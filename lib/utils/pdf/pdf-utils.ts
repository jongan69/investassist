import { PdfDocument, Transaction } from './types';
import { getAssetFromTicker } from './getAssetFromTicker';
export const tableHeaderPattern = /IDOwnerAssetTransactionTypeDateNotificationDateAmountCap\.Gains > \$200\?/g;

/*
 * Create basic processed data without AI insights
 * @param extractedData The extracted data from the PDF
 * @param error The error that occurred
 * @returns Basic processed data
 */
export function createBasicProcessedData(extractedData: PdfDocument['processedData'], error: unknown): PdfDocument['processedData'] {
  return {
    transactions: extractedData.transactions,
    summary: extractedData.summary || {
      status: 'Unknown',
      stateDistrict: 'Unknown'
    },
    // insights: {},
    rawText: extractedData.rawText,
    processedAt: new Date(),
    error: error instanceof Error ? error.message : 'Error generating AI insights'
  };
}

/**
 * Create a failed document
 * @param pdfData The PDF document data
 * @param error The error that occurred
 * @returns A failed PDF document
 */
export function createFailedDocument(pdfData: PdfDocument, error: unknown): PdfDocument {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error processing PDF';

  return {
    ...pdfData,
    processingStatus: 'failed',
    processedData: {
      transactions: [],
      summary: {},
      rawText: '',
      error: errorMessage
    },
    error: errorMessage
  };
}

/**
 * Get PDF buffer from URL or use provided buffer
 * @param pdfData The PDF document data
 * @param pdfBuffer Optional PDF buffer if already fetched
 * @returns The PDF buffer
 */
export async function getPdfBuffer(pdfData: PdfDocument, pdfBuffer?: ArrayBuffer): Promise<ArrayBuffer> {
  if (pdfBuffer) {
    return pdfBuffer;
  }

  const response = await fetch(pdfData.documentUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch PDF: ${response.status}`);
  }
  return await response.arrayBuffer();
}

/**
 * Extract header data from text
 * @param text The text to extract header data from
 * @returns The header data
 */
export function extractHeaderData(text: string) {
  const regex = /^(Name|Status|State\/District):([^:]+)$/gm;
  const result: Record<string, string> = {};
  let match;

  while ((match = regex.exec(text)) !== null) {
    const key = match[1].toLowerCase().replace(/\/| /g, '_');

    // For 'state_district', extract only the first alphanumeric part (e.g., CA11)
    if (key === 'state_district') {
      result[key] = match[2].split(/\s+/)[0]; // Take the first part before any space or newline
    } else {
      // Clean other fields by removing unwanted characters like null bytes or newlines
      result[key] = match[2].replace(/[\x00\n\r]/g, '').trim();
    }
  }

  return result;
}

/**
 * Parse transactions from raw text
 * @param rawText The raw text to parse transactions from
 * @param headerData The header data to use for the transactions
 * @returns An array of transactions
 */
export async function parseTransactions(cleanTextWithoutExtraHeaders: string, headerData: Record<string, string>, ID: string): Promise<Transaction[]> {
  // Create a pattern based on the passed in ID
  // Escape special regex characters in the ID to avoid regex errors
  const escapedID = ID.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  const transactions: Transaction[] = [];
  // console.log('Parsing transactions from text:', cleanTextWithoutExtraHeaders.substring(0, 100) + '...');
  console.log('Using ID pattern:', escapedID);
  
  // First remove everything before the first ID
  const firstIDIndex = cleanTextWithoutExtraHeaders.indexOf(ID);
  if (firstIDIndex !== -1) {
    cleanTextWithoutExtraHeaders = cleanTextWithoutExtraHeaders.substring(firstIDIndex);
  }
  
  // Alternative approach: Split by ID and process each part
  const parts = cleanTextWithoutExtraHeaders.split(new RegExp(`(?=${escapedID})`, 'g'));
  // console.log(`Found ${parts.length} parts by splitting on ID`);
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i].trim();
    if (!part) continue;
    
    // Skip if this part doesn't start with the ID
    if (!part.startsWith(ID)) continue;
    
    // Remove the ID prefix to get just the transaction content
    const transactionContent = part.substring(ID.length).trim();
    
    // Skip empty transactions
    if (!transactionContent) {
      console.log('Skipping empty transaction');
      continue;
    }

    // console.log(`Transaction ${i+1}:`, transactionContent.substring(0, 50) + '...');
    
    // Parse the transaction
    try {
      const transaction = await parseTransactionBlock(transactionContent, ID, headerData);
      transactions.push(transaction);
    } catch (error) {
      console.error(`Error parsing transaction ${i+1}:`, error);
    }
  }

  console.log(`Found ${transactions.length} transactions`);
  return transactions;
}

// Function to parse each transaction block
async function parseTransactionBlock(content: string, id: string, headerData: Record<string, string>): Promise<Transaction> {
  try {
    // Parse asset (before the first parentheses)
    // First, try to find the company name by looking for patterns like "Company Name - Stock Type"
    const companyPattern = /^([^\(]+?)(?:\s*-\s*[^\(]+)?(?=\s*\()/;
    const companyMatch = content.match(companyPattern);
    
    // If no match with the company pattern, fall back to the original pattern
    const assetMatch = companyMatch || content.match(/^(.*?)(?=\()/);
    const assetName = assetMatch ? assetMatch[1].trim() : 'Unknown';
    
    // Clean up the asset name - remove any ID prefixes that might have been included
    const cleanAssetName = assetName.replace(new RegExp(`^${id}`, 'i'), '').trim();


    // Parse ticker (inside parentheses)
    const tickerMatch = content.match(/\(([A-Z]+)\)/);
    const ticker = tickerMatch ? tickerMatch[1] : null;

    // Get the asset from the ticker
    const asset = ticker ? await getAssetFromTicker(ticker) : null;


    // Parse transaction type (P or S)
    const transTypeMatch = content.match(/\]\s*(P|S)(?:\s*\(partial\))?/);
    const transactionType = transTypeMatch ? transTypeMatch[1] : 'Unknown';

    // Parse transaction and notification dates
    const dates = [...content.matchAll(/(0[1-9]|1[0-2])\/\d{2}\/\d{4}/g)];
    const transactionDate = dates[0]?.[0] ?? 'Unknown';
    const notificationDate = dates[1]?.[0] ?? 'Unknown';

    // Parse amount (range of amounts in dollar format)
    const amountMatch = content.match(/\$[0-9,]+(?: - \$[0-9,]+)?/);
    const amount = amountMatch ? amountMatch[0] : 'Unknown';

    // Parse hasLargeCapitalGains from standalone T or F
    // Look for T or F that appears after the amount and before any details
    // This is more specific than just looking for any T or F in the content
    const capitalGainsPatterns = [
      /\$[0-9,]+(?: - \$[0-9,]+)?\s*(T|F)\b/, // T or F after amount
      /\b(T|F)\b\s*(?:D:|S:|$)/,              // T or F before details or end
      /\b(T|F)\b/                              // Any standalone T or F as fallback
    ];
    
    let hasLargeCapitalGains = true; // Default to true if not found
    
    for (const pattern of capitalGainsPatterns) {
      const capitalGainsMatch = content.match(pattern);
      if (capitalGainsMatch && capitalGainsMatch[1]) {
        hasLargeCapitalGains = capitalGainsMatch[1] === 'T';
        // console.log(`Found capital gains indicator: ${capitalGainsMatch[1]} using pattern ${pattern}`);
        break;
      }
    }

    // Improved pattern to capture everything after D: until the end
    const descMatch = content.match(/D:\s*([\s\S]*?)$/);
    const details = descMatch ? descMatch[1].trim().replace(/\s+/g, ' ') : null;

    // Return the parsed transaction object
    return {
      id,
      owner: headerData.name || 'Unknown',
      asset: asset || cleanAssetName,
      transactionType,
      date: transactionDate,
      notificationDate,
      amount,
      hasLargeCapitalGains,
      details,
      ticker,
    };
  } catch (error) {
    console.error('Error parsing transaction block:', error);
    console.error('Content:', content);
    
    // Return a minimal transaction object with available data
    return {
      id,
      owner: headerData.name || 'Unknown',
      asset: 'Error parsing asset',
      transactionType: 'Unknown',
      date: 'Unknown',
      notificationDate: 'Unknown',
      amount: 'Unknown',
      hasLargeCapitalGains: true,
      details: 'Error parsing transaction details',
      ticker: null
    };
  }
}