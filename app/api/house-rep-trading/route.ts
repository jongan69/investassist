import { NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import Bottleneck from "bottleneck";
import { PdfDocument, processPdf } from "@/lib/utils/pdf-storage";

// Define types for the request and response
interface HouseRepSearchRequest {
  lastName?: string;
  filingYear?: string;
  state?: string;
  district?: string;
}

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
  minTime: 1000, // Minimum 1 second between requests
  maxConcurrent: 2 // Process max 2 PDFs at a time
});

// Function to process a single PDF
async function processAndStorePdf(url: string, pdfData: HouseRepData): Promise<any> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const pdfBuffer = await response.arrayBuffer();
    
    // Create a PdfDocument object
    // const pdfDocument = {
    //   documentUrl: url,
    //   name: pdfData.name,
    //   office: pdfData.office,
    //   filingYear: pdfData.filingYear,
    //   filingType: pdfData.filingType,
    //   processingStatus: 'pending' as const,
    //   processedData: {
    //     transactions: [],
    //     summary: {},
    //     rawText: ''
    //   }
    // };
    
    // Process and store the PDF
    const processedData = await processPdf(pdfData as PdfDocument, pdfBuffer);
    // console.log('Processed data:', processedData);
    // Only store if we have a document URL
    if (!pdfData.documentUrl) {
      throw new Error('Document URL is required');
    }
    
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
  if (!documentUrl) return;
  
  // Add to processing queue
  limiter.schedule(() => processAndStorePdf(documentUrl, pdfData))
    .then(result => {
      // Here you would typically update your database with the processed result
      // console.log('PDF processed:', result);
      console.log('PDF processed');
    })
    .catch(error => {
      console.error('Error in PDF processing queue:', error);
    });
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const requestBody: HouseRepSearchRequest = await request.json();
    
    // Set default values if not provided
    const searchParams = {
      LastName: requestBody.lastName || "",
      FilingYear: requestBody.filingYear || "2025",
      State: requestBody.state || "",
      District: requestBody.district || "",
      // Note: The __RequestVerificationToken is typically a CSRF token that changes with each session
      // In a real implementation, you would need to fetch this token first
      __RequestVerificationToken: "CfDJ8PKifB2d25VIr5FlpzbdlcEZdfTWDxWUuOZ2A1-98XLjUMPzuurwBWeUoQqr7mucWaeZ1a0RbAoheaeOAkhh_kTlQ_J1N-alS0avVzMAJtuRype4dywmHOXJbNUAJZGXaMzanB3e00eKNf7YfP-p4HE"
    };

    // Convert the search parameters to URL-encoded form data
    const formData = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      formData.append(key, value);
    });

    // Make the request to the House Financial Disclosure website
    const response = await fetch(
      "https://disclosures-clerk.house.gov/FinancialDisclosure/ViewMemberSearchResult",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Get the HTML response as text
    const htmlContent = await response.text();
    
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
    
    // Return the structured data
    return NextResponse.json({
      success: true,
      data: results
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
