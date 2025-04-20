import { createClient } from '@supabase/supabase-js';
// Remove S3 imports as we won't be storing PDFs
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import path from 'path';
import { LRUCache } from 'lru-cache';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize PDF.js worker for Node.js environment
const pdfjsWorker = path.join(process.cwd(), 'node_modules', 'pdfjs-dist', 'legacy', 'build', 'pdf.worker.min.mjs');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// Create a cache for processed PDFs to avoid redundant processing
const pdfCache = new LRUCache<string, PdfDocument>({
  max: 100, // Maximum number of items to store
  ttl: 1000 * 60 * 60 * 24, // 24 hours
  updateAgeOnGet: true,
});

// Create a cache for raw PDF buffers
const pdfBufferCache = new LRUCache<string, Buffer>({
  max: 50, // Maximum number of items to store
  ttl: 1000 * 60 * 60, // 1 hour
  updateAgeOnGet: true,
});

export interface Transaction {
  id?: string;
  owner: string;
  asset: string;
  transactionType: string;
  date: string;
  notificationDate: string;
  amount: string;
  hasLargeCapitalGains: boolean;
  details: string;
}

export interface PdfDocument {
  id?: string;
  documentUrl: string;
  name: string;
  office: string;
  filingYear: string;
  filingType: string;
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
  processedData: {
    transactions: Array<Transaction>;
    summary: {};
    rawText: string;
    processedAt?: Date;
    error?: string;
  };
  processedAt?: Date;
  error?: string;
}

// Helper function to generate a cache key for a PDF
function generateCacheKey(pdfData: PdfDocument): string {
  return `${pdfData.documentUrl}-${pdfData.name}-${pdfData.filingYear}-${pdfData.filingType}`;
}

export async function extractData(cleanText: string) {
  try {
    // Look for the transaction table header to confirm where transactions start
    const headerPattern = /ID\s+Owner\s+Asset\s+Transaction Type Date\s+Notification Date Amount\s+Cap\. Gains > \$200\?/i;
    const headerMatch = cleanText.match(headerPattern);

    if (!headerMatch) {
      console.error('Available text for inspection:', cleanText.slice(0, 2000));
      throw new Error('Transaction table header not found');
    }

    // Extract owner from the text - more direct approach
    let owner = 'Unknown';

    // Try multiple patterns to extract the owner
    const ownerPatterns = [
      /Name:\s+([^S]+?)(?=\s+Status)/i,
      /Name:\s+([^T]+)/i,
      /Digitally Signed:\s+([^,]+)/i
    ];

    for (const pattern of ownerPatterns) {
      const match = cleanText.match(pattern);
      if (match && match[1]) {
        owner = match[1].trim();
        // Remove any trailing "S" that might be incorrectly included
        owner = owner.replace(/\s+S$/, '');
        break;
      }
    }

    console.log('Extracted owner:', owner); // Debug log to verify owner extraction

    // Slice the text to the start of transactions
    const transactionStartIndex = headerMatch.index! + headerMatch[0].length;
    const transactionsText = cleanText.slice(transactionStartIndex);

    // Split into transactions - look for "SP" followed by a company name
    const transactionPattern = /SP\s+([^[]+?)\s+\[([^\]]+)\]\s+([PS])(?:\s+\(partial\))?\s+(\d{2}\/\d{2}\/\d{4})\s+(\d{2}\/\d{2}\/\d{4})\s+(\$\d{1,3}(?:,\d{3})*(?:\s*-\s*\$\d{1,3}(?:,\d{3})*)?)\s+([TF])\s+S:\s+New\s+D:\s+(.+?)(?=\s+SP\s+|$)/g;

    const matches = [...transactionsText.matchAll(transactionPattern)];

    const transactions = matches.map((match, index) => {
      const [
        _, // Full match
        asset,
        transactionTypeCode,
        transactionType,
        date,
        notificationDate,
        amount,
        capitalGainsFlag,
        details
      ] = match;

      // Clean up details - remove everything after the first period if it's the last transaction
      let cleanDetails = details.trim();
      if (match === matches[matches.length - 1]) {
        // For the last transaction, only keep the text up to the first period
        const periodIndex = cleanDetails.indexOf('.');
        if (periodIndex !== -1) {
          cleanDetails = cleanDetails.substring(0, periodIndex + 1);
        }
      }

      return {
        owner,
        asset: asset.trim(),
        transactionType,
        date,
        notificationDate,
        amount,
        hasLargeCapitalGains: capitalGainsFlag === 'T',
        details: cleanDetails
      };
    });

    // If no transactions were found with the pattern, try a more aggressive approach
    if (transactions.length === 0) {
      // Look for lines that contain "SP" followed by a company name
      const spLines = transactionsText.split(/(?=SP\s+)/g).filter(line => line.includes('SP '));

      return {
        transactions: spLines.map((line, index) => {
          // Extract asset
          const assetMatch = line.match(/SP\s+([^[]+?)(?:\s+\[|$)/);
          const asset = assetMatch ? assetMatch[1].trim() : 'Unknown';

          // Extract transaction type
          const typeMatch = line.match(/\[([^\]]+)\]\s+([PS])(?:\s+\(partial\))?/);
          const transactionType = typeMatch ? typeMatch[2] : 'Unknown';

          // Extract dates
          const dates = line.match(/\d{2}\/\d{2}\/\d{4}/g);
          const date = dates && dates[0] ? dates[0] : '';
          const notificationDate = dates && dates[1] ? dates[1] : '';

          // Extract amount
          const amountMatch = line.match(/\$\d{1,3}(?:,\d{3})*(?:\s*-\s*\$\d{1,3}(?:,\d{3})*)?/);
          const amount = amountMatch ? amountMatch[0] : '';

          // Extract capital gains flag
          const capitalGainsMatch = line.match(/Cap\.\s+Gains\s*>\s*\$200\?\s*([TF])/i);
          const hasLargeCapitalGains = capitalGainsMatch ? capitalGainsMatch[1] === 'T' : false;

          // Extract details
          const detailsMatch = line.match(/S:\s*New\s+D:\s*(.+?)(?=\s+SP\s+|$)/i);
          let details = detailsMatch ? detailsMatch[1].trim() : '';

          // Clean up details - remove everything after the first period if it's the last transaction
          if (index === spLines.length - 1 && details) {
            const periodIndex = details.indexOf('.');
            if (periodIndex !== -1) {
              details = details.substring(0, periodIndex + 1);
            }
          }

          return {
            owner,
            asset,
            transactionType,
            date,
            notificationDate,
            amount,
            hasLargeCapitalGains,
            details
          };
        })
      };
    }

    return { transactions };

  } catch (error) {
    console.error('Error extracting PDF data:', error);
    throw new Error('Failed to extract data from PDF');
  }
}

export async function extractPdfData(pdfBuffer: Buffer): Promise<PdfDocument['processedData']> {
  const result: PdfDocument['processedData'] = {
    transactions: [],
    summary: {},
    rawText: ''
  };

  try {
    // Load the PDF document
    const data = new Uint8Array(pdfBuffer);
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;

    // Extract text from all pages
    let fullText = '';
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      const page = await pdfDocument.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }

    // Clean up null chars and normalize whitespace
    const cleanText = fullText.replace(/\x00+/g, '').replace(/\s+/g, ' ').trim();
    const { transactions } = await extractData(cleanText);
    result.transactions = transactions;
    result.rawText = cleanText;

    return result;
  } catch (error) {
    console.error('Error extracting PDF data:', error);
    throw new Error('Failed to extract data from PDF');
  }
}

export async function processPdf(pdfData: PdfDocument, pdfBuffer?: ArrayBuffer): Promise<PdfDocument> {
  console.log(`Processing PDF from URL: ${pdfData.documentUrl}`);

  try {
    // Check if we already have this PDF in the cache
    const cacheKey = generateCacheKey(pdfData);
    const cachedDocument = pdfCache.get(cacheKey);
    
    if (cachedDocument) {
      console.log(`Using cached PDF data for: ${pdfData.documentUrl}`);
      return cachedDocument;
    }

    let buffer: Buffer | undefined;

    if (pdfBuffer) {
      buffer = Buffer.from(pdfBuffer);
    } else {
      // Check if we have the buffer in cache
      const cachedBuffer = pdfBufferCache.get(pdfData.documentUrl);
      
      if (cachedBuffer) {
        console.log(`Using cached PDF buffer for: ${pdfData.documentUrl}`);
        buffer = cachedBuffer;
      } else {
        // Fetch with timeout and retry logic
        let retries = 3;
        let lastError: Error | null = null;
        
        while (retries > 0) {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
            
            const response = await fetch(pdfData.documentUrl, { 
              signal: controller.signal,
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              }
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch PDF: ${response.statusText}`);
            }
            
            buffer = Buffer.from(await response.arrayBuffer());
            // Cache the buffer for future use
            pdfBufferCache.set(pdfData.documentUrl, buffer);
            break;
          } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            retries--;
            if (retries > 0) {
              // Exponential backoff
              await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
            }
          }
        }
        
        if (retries === 0 && lastError) {
          throw lastError;
        }
      }
    }

    // Ensure buffer is defined before proceeding
    if (!buffer) {
      throw new Error('Failed to obtain PDF buffer');
    }

    // Process the PDF
    const processedData = await extractPdfData(buffer);

    // Create document in Supabase with processing results
    const document: PdfDocument = {
      ...pdfData,
      processedData,
      processedAt: new Date(),
      processingStatus: 'completed'
    };

    // Cache the processed document
    pdfCache.set(cacheKey, document);

    // Get existing transactions to check for duplicates
    const { data: existingTransactions, error: fetchError } = await supabase
      .from('house-rep-transactions')
      .select('owner, asset, date, notificationDate, amount, hasLargeCapitalGains, details');

    if (fetchError) {
      throw new Error(`Failed to fetch existing transactions: ${fetchError.message}`);
    }

    console.log(`Found ${existingTransactions?.length || 0} existing transactions in database`);

    // Create a function to check if two transactions are duplicates
    const isDuplicate = (newTx: Transaction, existingTx: any) => {
      // Normalize dates for comparison
      const newDate = new Date(newTx.date).toISOString().split('T')[0];
      const existingDate = new Date(existingTx.date).toISOString().split('T')[0];
      const newNotificationDate = new Date(newTx.notificationDate).toISOString().split('T')[0];
      const existingNotificationDate = new Date(existingTx.notificationDate).toISOString().split('T')[0];

      // Normalize amounts for comparison (remove spaces and $ signs)
      const newAmount = newTx.amount.replace(/[\s$]/g, '');
      const existingAmount = existingTx.amount.replace(/[\s$]/g, '');

      const isDup = (
        newTx.owner.toLowerCase() === existingTx.owner.toLowerCase() &&
        newTx.asset.toLowerCase() === existingTx.asset.toLowerCase() &&
        newDate === existingDate &&
        newNotificationDate === existingNotificationDate &&
        newAmount === existingAmount &&
        newTx.hasLargeCapitalGains === existingTx.hasLargeCapitalGains &&
        newTx.details.toLowerCase().trim() === existingTx.details.toLowerCase().trim()
      );

      if (isDup) {
        // console.log('Found duplicate transaction:', {
        //   new: {
        //     owner: newTx.owner,
        //     asset: newTx.asset,
        //     date: newDate,
        //     amount: newAmount
        //   },
        //   existing: {
        //     owner: existingTx.owner,
        //     asset: existingTx.asset,
        //     date: existingDate,
        //     amount: existingAmount
        //   }
        // });
      }

      return isDup;
    };

    // Filter out transactions that already exist
    const newTransactions = document.processedData.transactions.filter(newTx => {
      const isDup = existingTransactions?.some(existingTx => isDuplicate(newTx, existingTx));
      if (isDup) {
        // console.log('Filtering out duplicate transaction:', {
        //   owner: newTx.owner,
        //   asset: newTx.asset,
        //   date: newTx.date,
        //   amount: newTx.amount
        // });
      }
      return !isDup;
    });

    console.log(`Found ${newTransactions.length} new transactions out of ${document.processedData.transactions.length} total`);

    if (newTransactions.length === 0) {
      console.log('No new transactions to insert');
      return document;
    }

    // Insert only new transactions
    const insertPromises = newTransactions.map(transaction => {
      const insertData = {
        owner: transaction.owner,
        asset: transaction.asset,
        date: transaction.date ? new Date(transaction.date) : null,
        notificationDate: transaction.notificationDate ? new Date(transaction.notificationDate) : null,
        amount: transaction.amount,
        hasLargeCapitalGains: transaction.hasLargeCapitalGains,
        details: transaction.details
      };

      return supabase
        .from('house-rep-transactions')
        .insert(insertData);
    });

    // Execute all insertions in parallel
    const results = await Promise.all(insertPromises);

    // Check for errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Errors inserting transactions:', errors);
      throw new Error(`Failed to insert ${errors.length} transactions`);
    }

    return document;
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

export async function updatePdfStatus(
  documentId: string,
  status: PdfDocument['processingStatus'],
  processedData?: any,
  error?: string
): Promise<void> {
  const { error: updateError } = await supabase
    .from('house-rep-transactions')
    .update({
      processingStatus: status,
      processedData,
      error,
      processedAt: new Date()
    })
    .eq('id', documentId);

  if (updateError) throw updateError;
}

export async function getPdfStatus(documentId: string): Promise<PdfDocument | null> {
  const { data, error } = await supabase
    .from('house-rep-transactions')
    .select()
    .eq('id', documentId)
    .single();

  if (error) return null;
  return data;
} 