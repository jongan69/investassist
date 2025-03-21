import { NextResponse } from "next/server";
import { HELIUS } from "@/lib/solana/constants";

// Helper function to chunk array into smaller arrays
function chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check if error is rate limit
function isRateLimitError(error: any): boolean {
    return error?.status === 429 || 
           (error?.message?.includes('Rate limit exceeded') || 
            error?.message?.includes('429'));
}

// Process chunks with controlled concurrency
async function processChunksWithConcurrency(chunks: string[][], maxConcurrent: number = 3) {
    const results: (any | null)[] = [];
    const inProgress = new Set<number>();
    const queue = [...chunks];

    async function processChunk(chunk: string[], index: number) {
        const heliusRequest = {
            jsonrpc: "2.0",
            id: `investAssist-${index}`,
            method: "getAssetBatch",
            params: {
                ids: chunk,
                displayOptions: {
                    showFungible: true,
                    showInscription: true
                }
            }
        };

        try {
            const result = await makeRequestWithRetry(heliusRequest);
            results[index] = result;
        } catch (error) {
            console.error(`Failed to process chunk ${index + 1}:`, error);
            results[index] = null;
        } finally {
            inProgress.delete(index);
        }
    }

    async function processQueue() {
        while (queue.length > 0 || inProgress.size > 0) {
            while (inProgress.size < maxConcurrent && queue.length > 0) {
                const chunk = queue.shift()!;
                const index = chunks.length - queue.length - 1;
                inProgress.add(index);
                processChunk(chunk, index).catch(console.error);
            }
            await delay(100); // Small delay to prevent tight loop
        }
    }

    await processQueue();
    return results.filter(Boolean) as any[];
}

// Helper function to make request with retries
async function makeRequestWithRetry(
    heliusRequest: any,
    maxRetries: number = 3,
    baseDelay: number = 500
): Promise<any> {
    let lastError: any;
    let backoff = baseDelay;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            const response = await fetch(`${HELIUS}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(heliusRequest)
            });

            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`Helius API failed: ${response.status}: ${errorText}`);
                (error as any).status = response.status;
                throw error;
            }

            return response.json();
        } catch (error: any) {
            lastError = error;
            
            if (isRateLimitError(error)) {
                backoff = Math.min(backoff * 2, 5000); // Cap maximum backoff at 5 seconds
                console.log(`Rate limit hit, waiting ${backoff}ms before retry ${attempt + 1}/${maxRetries}`);
                await delay(backoff);
            } else {
                throw error;
            }
        }
    }
    
    throw lastError;
}

export async function POST(req: Request) {
    try {
        console.log("=== Starting token metadata fetch ===");
        
        const body = await req.json();
        console.log("Received request body:", JSON.stringify(body, null, 2));
        
        if (!body.ids) {
            console.log("Error: Missing ids in request body");
            return NextResponse.json({ error: "Token IDs array is required" }, { status: 400 });
        }

        const tokenIds = (Array.isArray(body.ids) ? body.ids : [body.ids]) as string[];
        
        // Validate that all IDs are strings
        if (!tokenIds.every((id: unknown) => typeof id === 'string')) {
            return NextResponse.json({ error: "All token IDs must be strings" }, { status: 400 });
        }

        console.log("Normalized token IDs:", tokenIds);
        
        if (tokenIds.length === 0) {
            console.log("Error: Empty token IDs array");
            return NextResponse.json({ error: "At least one token ID is required" }, { status: 400 });
        }

        console.log(`Processing ${tokenIds.length} token(s)`);

        // Process with optimized chunking and concurrency for large batches
        if (tokenIds.length > 100) {
            console.log("Token count exceeds 100, processing in parallel chunks...");
            const chunks = chunkArray(tokenIds, 100);
            console.log(`Split into ${chunks.length} chunks`);

            const results = await processChunksWithConcurrency(chunks);
            
            const combinedResult = {
                jsonrpc: "2.0",
                id: "investAssist",
                result: results.flatMap(chunk => chunk.result)
            };

            console.log(`Successfully processed ${results.length}/${chunks.length} chunks`);
            console.log(`Total results: ${combinedResult.result.length}`);
            
            return NextResponse.json(combinedResult);
        }

        // For 100 or fewer tokens, process as single request
        const heliusRequest = {
            jsonrpc: "2.0",
            id: "investAssist",
            method: "getAssetBatch",
            params: {
                ids: tokenIds,
                displayOptions: {
                    showFungible: true,
                    showInscription: true
                }
            }
        };

        console.log("Sending request to Helius API...");
        const data = await makeRequestWithRetry(heliusRequest);

        if (data.result) {
            console.log(`Received ${Array.isArray(data.result) ? data.result.length : 1} result(s)`);
        }

        console.log("=== Completed token metadata fetch ===");
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("=== Error in token metadata fetch ===");
        console.error("Error details:", error);
        console.error("Error stack:", error.stack);
        return NextResponse.json(
            { error: "Failed to fetch token metadata" }, 
            { status: 500 }
        );
    }
} 