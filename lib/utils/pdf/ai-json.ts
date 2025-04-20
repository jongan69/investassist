import { AI_API } from "../constants";
import { PdfDocument } from "./types";

/**
 * Enhanced version of generateJson that processes PDF data and returns a structured JSON object
 * @param input The PDF document data to process
 * @returns A processed and structured JSON object
 */
export async function generateJson(input: PdfDocument) {
    try {
        // Extract relevant data from the PDF document
        // const { processedData, name, office, filingYear, filingType } = input;
        // const { transactions, rawText } = processedData;

        // // Create a structured prompt for the AI
        // const prompt = `
        //     Analyze the following congressional trading data and provide a structured summary:

        //     Document: ${name}
        //     Office: ${office}
        //     Filing Year: ${filingYear}
        //     Filing Type: ${filingType}

        //     Number of transactions: ${transactions.length}

        //     Transaction data:
        //     ${JSON.stringify(transactions, null, 2)}

        //     Please provide a JSON response with the following structure:
        //     {
        //         "summary": {
        //             "totalTransactions": number,
        //             "totalAmount": string,
        //             "dateRange": { "start": string, "end": string },
        //             "mostFrequentAssets": [string],
        //             "transactionTypes": { "purchase": number, "sale": number },
        //             "assetsBySector": { "Technology": number, "Healthcare": number, "Finance": number, "Energy": number, "Other": number },
        //             "monthlyActivity": { "Jan": number, "Feb": number, "Mar": number, "Apr": number, "May": number, "Jun": number, "Jul": number, "Aug": number, "Sep": number, "Oct": number, "Nov": number, "Dec": number }
        //         },
        //         "insights": {
        //             "notableTransactions": [
        //                 {
        //                     "asset": string,
        //                     "amount": string,
        //                     "date": string,
        //                     "reason": string
        //                 }
        //             ],
        //             "patterns": [string],
        //             "riskLevel": string,
        //             "potentialConflicts": [string],
        //             "marketTiming": string,
        //             "sectorConcentration": string
        //         },
        //         "rawData": {
        //             "transactions": [object],
        //             "documentInfo": {
        //                 "name": string,
        //                 "office": string,
        //                 "filingYear": string,
        //                 "filingType": string
        //             }
        //         }
        //     }

        //     For the analysis:
        //     1. Calculate total amount by summing all transaction amounts (convert ranges to average)
        //     2. Identify the most frequent assets traded
        //     3. Categorize transactions by sector based on asset names
        //     4. Analyze monthly trading activity
        //     5. Identify notable transactions (large amounts, unusual timing, etc.)
        //     6. Look for patterns in trading behavior
        //     7. Assess potential conflicts of interest
        //     8. Evaluate market timing of trades
        //     9. Analyze sector concentration of investments
        // `;

        const format = `{
        owner: string;
        asset: string;
        transactionType: string;
        date: string;
        notificationDate: string;
        amount: string;
        hasLargeCapitalGains: boolean;
        details: string;
        ticker?: string;
       }`

        const prompt = `This JSON is incorrectly formatted, 
        Its supposed to be an array of objects with the following fields: ${format} 
        Please correct any issues and return it in the correct format: ${JSON.stringify(input)}`

        // Make the API request
        const url = `${AI_API}/chat`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: 'gpt-4o',
                json_mode: true,
                stream: false,
            })
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        // Parse the response
        const data = await response.json();

        // Validate the response structure
        if (!data || typeof data !== 'object') {
            throw new Error('Invalid response format from AI API');
        }

        // Return the processed data
        if (data?.response) {
            return data.response;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Error generating JSON:', error);

        // Return a fallback structure in case of error
        return {
            summary: {
                totalTransactions: input.processedData.transactions.length,
                totalAmount: "Error calculating",
                dateRange: { start: "Unknown", end: "Unknown" },
                mostFrequentAssets: [],
                transactionTypes: { purchase: 0, sale: 0 },
                assetsBySector: { Technology: 0, Healthcare: 0, Finance: 0, Energy: 0, Other: 0 },
                monthlyActivity: { Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0, Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0 }
            },
            insights: {
                notableTransactions: [],
                patterns: ["Error analyzing patterns"],
                riskLevel: "Unknown",
                potentialConflicts: [],
                marketTiming: "Unknown",
                sectorConcentration: "Unknown"
            },
            rawData: {
                transactions: input.processedData.transactions,
                documentInfo: {
                    name: input.name,
                    office: input.office,
                    filingYear: input.filingYear,
                    filingType: input.filingType
                }
            },
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Generate AI insights for the PDF data
 * @param pdfData The PDF document data
 * @param extractedData The extracted data from the PDF
 * @returns The updated PDF document with AI insights
 */
export async function generateAiInsights(pdfData: PdfDocument, extractedData: PdfDocument['processedData']): Promise<PdfDocument> {
    const aiData = await generateJson({
      ...pdfData,
      processedData: {
        ...pdfData.processedData,
        transactions: extractedData.transactions
      }
    });
  
    // Parse the AI response
    const parsedAiData = typeof aiData === 'string' ? JSON.parse(aiData) : aiData;
  
    // Update the processed data with AI insights
    const processedData = {
      transactions: extractedData.transactions,
      summary: parsedAiData.summary || {},
      insights: parsedAiData.insights || {},
      rawText: extractedData.rawText,
      processedAt: new Date()
    };
  
    // Update the PDF document with processed data
    return {
      ...pdfData,
      processingStatus: 'completed',
      processedData,
      processedAt: new Date()
    };
  }