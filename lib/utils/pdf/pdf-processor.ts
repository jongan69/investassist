// import { generateAiInsights } from './ai-json';
import { PdfDocument, Transaction } from './types';
import PdfParse from 'pdf-parse';

import {
  tableHeaderPattern,
  extractHeaderData,
  getPdfBuffer,
  parseTransactions,
  createFailedDocument,
  createBasicProcessedData
} from './pdf-utils';
import { generateCacheKey, pdfCache } from './pdf-cache';
import { storeNonDuplicateTransactions } from './transaction-storage';
/**
 * Process a PDF document and extract transaction data
 * @param pdfData The PDF document data
 * @param pdfBuffer Optional PDF buffer if already fetched
 * @returns The processed PDF document
 */
export async function processPdf(pdfData: PdfDocument, pdfBuffer?: ArrayBuffer): Promise<PdfDocument> {
  const cacheKey = generateCacheKey(pdfData);

  try {
    // Check cache first
    const cachedPdf = pdfCache.get(cacheKey);
    if (cachedPdf) {
      console.log('Returning cached PDF data');
      return cachedPdf;
    }

    // Get PDF buffer if not provided
    const buffer = await getPdfBuffer(pdfData, pdfBuffer);

    // Extract data from PDF
    const extractedData = await extractPdfData(Buffer.from(buffer));

    // Create processed data structure
    const processedData = createBasicProcessedData(extractedData, null);

    // Update the PDF document with processed data
    const updatedPdfDoc: PdfDocument = {
      ...pdfData,
      processingStatus: 'completed',
      processedData,
      processedAt: new Date()
    };

    // Cache the results
    pdfCache.set(cacheKey, updatedPdfDoc);

    return updatedPdfDoc;
  } catch (error) {
    console.error('Error processing PDF:', error);

    // Return failed document
    return createFailedDocument(pdfData, error);
  }
}

/**
 * Cleans PDF text and extracts header data and transactions
 * @param text The raw PDF text
 * @returns Cleaned text, header data, and transactions 
 */
async function cleanPdfText(text: string): Promise<{ cleanText: string; headerData: Record<string, string>; transactions: Transaction[] }> {
  // Try different approaches to find the asterisk
  console.log('Text length before cleaning:', text.length);
  // console.log('text:', text);
  const headerData = extractHeaderData(text); // Extract header data first
  console.log('Header data:', headerData);

  // First, find the first occurrence of "ID" which is the start of the table header
  const firstIdIndex = text.indexOf("ID");
  // console.log('First ID index:', firstIdIndex);

  if (firstIdIndex !== -1) {
    // Look for the next occurrence of "ID" followed by "Owner" or "Asset"
    let nextIdIndex = text.indexOf("ID", firstIdIndex + 2); // +2 to skip the first "ID"
    // console.log('Next ID index:', nextIdIndex);

    while (nextIdIndex !== -1) {
      // Check if this "ID" is followed by "Owner" or "Asset" within a reasonable distance
      const textAfterId = text.substring(nextIdIndex, nextIdIndex + 100);
      // console.log('Text after next ID:', textAfterId);

      if (textAfterId.includes("Owner") || textAfterId.includes("Asset")) {
        // console.log('Found potential duplicate header at index:', nextIdIndex);

        // Find where this header ends (look for the next transaction ID or end of text)
        let endIndex = text.length;
        const nextTransactionMatch = text.substring(nextIdIndex + 2).match(/([A-Z]{2})([^\?]*)/);
        if (nextTransactionMatch) {
          endIndex = text.indexOf(nextTransactionMatch[0], nextIdIndex + 2);
          // console.log('Found end of header at index:', endIndex);
        }

        // Remove the duplicate header
        // console.log('Removing duplicate header from index', nextIdIndex, 'to', endIndex);
        text = text.substring(0, nextIdIndex) + text.substring(endIndex);

        // Look for the next occurrence of "ID"
        nextIdIndex = text.indexOf("ID", firstIdIndex + 2);
      } else {
        // This "ID" is not part of a table header, move to the next one
        nextIdIndex = text.indexOf("ID", nextIdIndex + 2);
      }
    }
  }

  const index = text.indexOf("ID"); // Find the first occurrence of "ID"
  console.log('Final ID index for slicing:', index);
  let cleanText = index !== -1 ? text.slice(index) : text;
  const cleanTextWithoutExtraHeaders = cleanText.replace(tableHeaderPattern, (match, offset) => {
    return offset === 0 ? match : '';
  });
  cleanText = cleanTextWithoutExtraHeaders
    .replace(/[\x00\n]/g, '')          // remove all control characters and newlines
    .replace(/\$/g, ' $')              // add space before every dollar sign
    .replace(/\*[^*]*$/, '')           // remove everything after the last asterisk
    .replace(/Filing ID #\d+/g, "")    // remove 'Filing ID #number'
    .replace(/\.(?!\s)/g, ". ")        // add space after every '.' if not already followed by a space
    .replace(/(?<!\s)D:/g, " D:")      // add space before every 'D:' if not already preceded by a space
    .replace(/(\d)F/g, "$1 F ")       // add space before every 'F' if there are number in front of it not already preceded by a space 
    .replace(/ {2,}/g, " ")           // remove multiple spaces
    .replace(/\bFiling\b/g, "");      // remove the word 'Filing'
    
  // Extract ID - look for patterns like ?XX, XX?, or just XX where XX is 2 letters
  // Try multiple patterns to find the ID
  let ID = '';
  const idPatterns = [
    /\?([A-Za-z]{2})/,  // ?XX pattern
    /([A-Za-z]{2})\?/,  // XX? pattern
    /\b([A-Za-z]{2})\b/ // Standalone XX pattern
  ];
  
  for (const pattern of idPatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1]) {
      ID = match[1];
      console.log(`Found ID using pattern ${pattern}: ${ID}`);
      break;
    }
  }
  
  if (!ID) {
    console.warn('Could not extract ID from text, using default');
    ID = 'XX'; // Default fallback
  }

  const transactions = await parseTransactions(cleanText, headerData, ID);
  // console.log('Transactions:', transactions);
  // console.log('Text length after cleaning:', cleanText.length);
  // console.log('Difference in length:', text.length - cleanText.length);
  const idIndex = cleanText.indexOf(ID);
  const updatedCleanText = cleanText.slice(idIndex).replace(new RegExp(ID, 'g'), `${ID} `);
  return { cleanText: updatedCleanText, headerData, transactions };
}


/**
 * Extracts data from a PDF buffer
 * @param pdfBuffer The PDF buffer to extract data from
 * @returns The extracted data from the PDF
 */
export async function extractPdfData(pdfBuffer: Buffer): Promise<PdfDocument['processedData']> {
  const result: PdfDocument['processedData'] = {
    transactions: [],
    summary: {
      status: 'Unknown',
      stateDistrict: 'Unknown'
    },
    rawText: ''
  };

  try {
    // Load the PDF document
    const pdfResult = await PdfParse(pdfBuffer);
    console.log('PDF parsed successfully, text length:', pdfResult.text.length);

    // Clean the text by removing content after the last asterisk
    const cleanText = await cleanPdfText(pdfResult.text);

    // Extract transaction data and summary
    result.transactions = cleanText.transactions;
    result.summary = cleanText.headerData;
    result.rawText = cleanText.cleanText;

    // Store the transactions in the database asynchronously without waiting
    storeNonDuplicateTransactions(cleanText.transactions)
      .then(storedTransactionsResult => {
        console.log('Transactions stored in database:', storedTransactionsResult);
      })
      .catch(error => {
        console.error('Error storing transactions in database:', error);
      });
      
    return result;
  } catch (error) {
    console.error('Error extracting PDF data:', error);
    throw new Error('Failed to extract data from PDF');
  }
}