import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import Bottleneck from "bottleneck";
import { z } from "zod";
import { LRUCache } from "lru-cache";

import { processPdf } from "@/lib/utils/pdf/pdf-processor";
import { PdfDocument } from "@/lib/utils/pdf/types";
// Define a schema for request validation
const HouseRepSearchSchema = z.object({
  lastName: z.string().optional(),
  filingYear: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  page: z.number().optional(),
  pageSize: z.number().optional(),
});

// Define types for the request and response
type HouseRepSearchRequest = z.infer<typeof HouseRepSearchSchema>;

// Interface for the parsed House Representative data
interface HouseRepData {
  name: string;
  office: string;
  filingYear: string;
  filingType: string;
  documentUrl?: string;
  processingStatus?: 'pending' | 'processing' | 'completed' | 'failed';
  processedData?: any;
}

// Create a rate limiter for PDF processing
const limiter = new Bottleneck({
  minTime: 500, // Reduced from 1000ms to 500ms between requests
  maxConcurrent: 5, // Increased from 2 to 5 concurrent PDFs
  reservoir: 200, // Increased from 100 to 200 jobs
  reservoirRefreshAmount: 200,
  reservoirRefreshInterval: 60 * 1000, // Refresh every minute
});

// Create a cache for search results to avoid redundant requests
const searchResultsCache = new LRUCache<string, HouseRepData[]>({
  max: 500, // Increased from 100 to 500 items
  ttl: 1000 * 60 * 60 * 24, // Increased from 1 hour to 24 hours
  updateAgeOnGet: true,
});

// Function to generate a cache key for search results
function generateSearchCacheKey(request: HouseRepSearchRequest): string {
  return `${request.lastName || ''}-${request.filingYear || ''}-${request.state || ''}-${request.district || ''}`;
}

// Function to process a single PDF
async function processAndStorePdf(url: string, pdfData: HouseRepData): Promise<any> {
  try {
    if (!url) {
      console.warn('No PDF URL provided for processing');
      return {
        status: 'error',
        error: 'No PDF URL provided'
      };
    }

    // Create a PdfDocument object
    const pdfDocument: PdfDocument = {
      documentUrl: url,
      name: pdfData.name,
      office: pdfData.office,
      filingYear: pdfData.filingYear,
      filingType: pdfData.filingType,
      processingStatus: 'pending',
      processedData: {
        transactions: [],
        summary: {},
        // insights: {},
        rawText: ''
      }
    };

    // Process and store the PDF
    const processedData = await processPdf(pdfDocument);

    return processedData.processedData.transactions;
  } catch (error) {
    console.error('Error processing PDF:', error);
    return {
      status: 'error',
      url,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Function to queue PDF processing
async function queuePdfProcessing(documentUrl: string, pdfData: HouseRepData): Promise<void> {
  if (!documentUrl) {
    console.warn('No document URL provided for queueing');
    return;
  }

  // Determine priority based on filing year (more recent = higher priority)
  const filingYear = parseInt(pdfData.filingYear || '0', 10);
  const currentYear = new Date().getFullYear();
  const priority = filingYear === currentYear ? 1 : 2; // Lower number = higher priority

  // Add to processing queue with priority
  limiter.schedule({ priority }, () => processAndStorePdf(documentUrl, pdfData))
    .then(result => {
      console.log('PDF processed');
      // console.log('Result:', result);
    })
    .catch(error => {
      console.error('Error in PDF processing queue:', error);
    });
}

// Function to fetch CSRF token
async function fetchCsrfToken(): Promise<string> {
  try {
    // Try the main search page first
    const response = await fetch(
      "https://disclosures-clerk.house.gov/FinancialDisclosure/ViewMemberSearch",
      {
        method: "GET",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      }
    );

    if (!response.ok) {
      console.warn(`Failed to fetch CSRF token from main page: ${response.status}`);

      // Try an alternative URL if the main one fails
      const altResponse = await fetch(
        "https://disclosures-clerk.house.gov/",
        {
          method: "GET",
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
          }
        }
      );

      if (!altResponse.ok) {
        console.warn(`Failed to fetch CSRF token from alternative page: ${altResponse.status}`);
        // Return a fallback token if both attempts fail
        return "CfDJ8PKifB2d25VIr5FlpzbdlcEZdfTWDxWUuOZ2A1-98XLjUMPzuurwBWeUoQqr7mucWaeZ1a0RbAoheaeOAkhh_kTlQ_J1N-alS0avVzMAJtuRype4dywmHOXJbNUAJZGXaMzanB3e00eKNf7YfP-p4HE";
      }

      const htmlContent = await altResponse.text();
      const dom = new JSDOM(htmlContent);
      const document = dom.window.document;

      // Find the CSRF token in the HTML
      const tokenElement = document.querySelector('input[name="__RequestVerificationToken"]');
      if (!tokenElement) {
        console.warn('CSRF token not found in alternative page');
        // Return a fallback token if we can't find one
        return "CfDJ8PKifB2d25VIr5FlpzbdlcEZdfTWDxWUuOZ2A1-98XLjUMPzuurwBWeUoQqr7mucWaeZ1a0RbAoheaeOAkhh_kTlQ_J1N-alS0avVzMAJtuRype4dywmHOXJbNUAJZGXaMzanB3e00eKNf7YfP-p4HE";
      }

      return tokenElement.getAttribute('value') || "CfDJ8PKifB2d25VIr5FlpzbdlcEZdfTWDxWUuOZ2A1-98XLjUMPzuurwBWeUoQqr7mucWaeZ1a0RbAoheaeOAkhh_kTlQ_J1N-alS0avVzMAJtuRype4dywmHOXJbNUAJZGXaMzanB3e00eKNf7YfP-p4HE";
    }

    const htmlContent = await response.text();
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Find the CSRF token in the HTML
    const tokenElement = document.querySelector('input[name="__RequestVerificationToken"]');
    if (!tokenElement) {
      console.warn('CSRF token not found in main page');
      // Return a fallback token if we can't find one
      return "CfDJ8PKifB2d25VIr5FlpzbdlcEZdfTWDxWUuOZ2A1-98XLjUMPzuurwBWeUoQqr7mucWaeZ1a0RbAoheaeOAkhh_kTlQ_J1N-alS0avVzMAJtuRype4dywmHOXJbNUAJZGXaMzanB3e00eKNf7YfP-p4HE";
    }

    return tokenElement.getAttribute('value') || "CfDJ8PKifB2d25VIr5FlpzbdlcEZdfTWDxWUuOZ2A1-98XLjUMPzuurwBWeUoQqr7mucWaeZ1a0RbAoheaeOAkhh_kTlQ_J1N-alS0avVzMAJtuRype4dywmHOXJbNUAJZGXaMzanB3e00eKNf7YfP-p4HE";
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    // Return a fallback token if we can't fetch one
    return "CfDJ8PKifB2d25VIr5FlpzbdlcEZdfTWDxWUuOZ2A1-98XLjUMPzuurwBWeUoQqr7mucWaeZ1a0RbAoheaeOAkhh_kTlQ_J1N-alS0avVzMAJtuRype4dywmHOXJbNUAJZGXaMzanB3e00eKNf7YfP-p4HE";
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const requestBody = await request.json();
    console.log('Request body:', requestBody);
    // Validate the request body
    const validationResult = HouseRepSearchSchema.safeParse(requestBody);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request parameters",
          details: validationResult.error.format()
        },
        { status: 400 }
      );
    }

    // Check if we have cached results
    const cacheKey = generateSearchCacheKey(validationResult.data);
    const cachedResults = searchResultsCache.get(cacheKey);

    if (cachedResults) {
      console.log('Using cached search results');

      // Apply pagination to cached results if needed
      const page = validationResult.data.page || 1;
      const pageSize = validationResult.data.pageSize || 100;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedResults = cachedResults.slice(start, end);

      return NextResponse.json({
        success: true,
        data: paginatedResults,
        totalResults: cachedResults.length,
        cached: true
      });
    }

    // Set default values if not provided
    const searchParams: {
      LastName: string;
      FilingYear: string;
      State: string;
      District: string;
      __RequestVerificationToken?: string;
    } = {
      LastName: validationResult.data.lastName || "",
      FilingYear: validationResult.data.filingYear || "2025",
      State: validationResult.data.state || "",
      District: validationResult.data.district || "",
    };

    // Fetch CSRF token
    const csrfToken = await fetchCsrfToken();
    searchParams.__RequestVerificationToken = csrfToken;

    // Convert the search parameters to URL-encoded form data
    const formData = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Make the request to the House Financial Disclosure website with retry logic
    let response;
    let retries = 3;
    let lastError: Error | null = null;

    while (retries > 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

        response = await fetch(
          "https://disclosures-clerk.house.gov/FinancialDisclosure/ViewMemberSearchResult",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            },
            body: formData.toString(),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

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

    // Get the HTML response as text
    const htmlContent = await response!.text();

    // Parse the HTML using JSDOM
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Extract data from the HTML
    const results: HouseRepData[] = [];

    // Find the table with search results - using the specific class from the HTML
    const table = document.querySelector('table.library-table');

    if (table) {
      // Get all rows from the tbody
      const tbody = table.querySelector('tbody');
      if (tbody) {
        const rows = Array.from(tbody.querySelectorAll('tr'));

        for (const row of rows) {
          const cells = row.querySelectorAll('td');

          if (cells.length >= 4) {
            // Extract name and document URL from the first cell
            const nameCell = cells[0];
            const name = nameCell.textContent?.trim() || '';

            // Find document URL if available
            const documentLink = nameCell.querySelector('a');
            const href = documentLink?.getAttribute('href');
            const documentUrl = href ? `https://disclosures-clerk.house.gov/${href}` : undefined;

            // Extract other data
            const office = cells[1].textContent?.trim() || '';
            const filingYear = cells[2].textContent?.trim() || '';
            const filingType = cells[3].textContent?.trim() || '';

            const result: HouseRepData = {
              name,
              office,
              filingYear,
              filingType,
              documentUrl,
              processingStatus: documentUrl ? 'pending' : undefined
            };

            // Queue the PDF for processing if we have a URL
            if (documentUrl) {
              queuePdfProcessing(documentUrl, result);
            }

            results.push(result);
          }
        }
      }
    }

    // Cache the results
    searchResultsCache.set(cacheKey, results);

    // Apply pagination if needed
    const page = validationResult.data.page || 1;
    const pageSize = validationResult.data.pageSize || 100;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedResults = results.slice(start, end);

    // Return the structured data
    return NextResponse.json({
      success: true,
      data: paginatedResults,
      totalResults: results.length
    });
  } catch (error) {
    console.error("Error processing House Rep search request:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
