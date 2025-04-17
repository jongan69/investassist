import { Connection, PublicKey, GetProgramAccountsFilter } from "@solana/web3.js";
import {
  mplTokenMetadata,
  findMetadataPda,
  fetchDigitalAssetByMetadata,
  fetchMetadata,
  TokenStandard
} from '@metaplex-foundation/mpl-token-metadata'
import { fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import Bottleneck from "bottleneck";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { fetchJupiterSwap } from "./fetchJupiterSwap";
import { fetchIpfsMetadata } from "./fetchIpfsMetadata";
import { extractCidFromUrl } from "./extractCidUrl";
import { processTokenMetadata } from "./processMetadata";
import { withRetry } from "./withRetry";
import { HELIUS, JUPITER } from "../utils/constants";
import { getDefaultTokenMetadata, getTokenInfo } from "./fetchDefaultTokenData";
import { DEFAULT_IMAGE_URL } from "../utils/constants";

// Initialize connection and metaplex
const connection = new Connection(HELIUS as string);
const metaplexUmi = createUmi(HELIUS as string).use(mplTokenMetadata());

// Rate limiters with optimized settings
const rpcLimiter = new Bottleneck({
  maxConcurrent: 8,    // Increased concurrent requests
  minTime: 150,        // Reduced delay between requests
  reservoir: 45,       // Increased token bucket
  reservoirRefreshInterval: 1000,
  reservoirRefreshAmount: 45
});

export const apiLimiter = new Bottleneck({
  maxConcurrent: 5,    // Increased concurrent requests
  minTime: 200,        // Reduced delay between requests
  reservoir: 30,       // Increased token bucket
  reservoirRefreshInterval: 1000,
  reservoirRefreshAmount: 30
});

const BATCH_SIZE = 20;     // Increased batch size
const BATCH_DELAY = 500;   // Reduced delay between batches
const TOKEN_DELAY = 50;    // Reduced delay between tokens

// Enhanced metadata cache with longer TTL
class MetadataCache {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private TTL = 1000 * 60 * 60 * 24; // 24 hour TTL - tokens don't change that often

  set(key: string, value: any) {
    this.cache.set(key, { data: value, timestamp: Date.now() });
  }

  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  // Preload multiple metadata entries
  preload(entries: { key: string; value: any }[]) {
    entries.forEach(({ key, value }) => this.set(key, value));
  }
}

const metadataCache = new MetadataCache();

// Exponential backoff retry helper
async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  baseDelay: number = 1000
): Promise<T> {
  let retries = 0;
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      if (typeof error === 'object' && error?.toString().includes('429') && retries < maxRetries) {
        const delay = baseDelay * Math.pow(2, retries);
        retries++;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
}

export interface TokenData {
  name: string;
  symbol: string;
  amount: number;
  usdValue: number;
  decimals: number;
  logo: string;
  isNft: boolean;
  description: string;
  tokenAddress: string;
  mintAddress: string;
  cid: string | null;
  // Additional token information
  tokenProgram?: string;
  associatedTokenAddress?: string;
  pricePerToken?: number;
  priceCurrency?: string;
  supply?: number | null;
  isFrozen?: boolean;
  isDelegated?: boolean;
  authorities?: Array<{
    address: string;
    scopes: string[];
  }>;
  royalty?: {
    royalty_model: string;
    target: null;
    percent: number;
    basis_points: number;
    primary_sale_happened: boolean;
    locked: boolean;
  } | null;
  creators?: any[];
}

interface ParsedTokenAccountData {
  parsed: {
    info: {
      mint: string;
      tokenAmount: {
        uiAmount: number;
        decimals: number;
      };
    };
  };
}

function isParsedTokenAccountData(data: any): data is ParsedTokenAccountData {
  return (
    data &&
    typeof data === 'object' &&
    'parsed' in data &&
    data.parsed &&
    typeof data.parsed === 'object' &&
    'info' in data.parsed &&
    data.parsed.info &&
    typeof data.parsed.info === 'object' &&
    'mint' in data.parsed.info &&
    'tokenAmount' in data.parsed.info
  );
}

export async function fetchTokenMetadata(mintAddress: PublicKey, mint: string) {
  try {
    // console.log(`[fetchTokenMetadata] Starting metadata fetch for mint: ${mint}`);
    
    const metadataPda = findMetadataPda(metaplexUmi, {
      mint: fromWeb3JsPublicKey(mintAddress)
    });
    // console.log(`[fetchTokenMetadata] Found metadata PDA: ${metadataPda}`);
    
    const metadataAccountInfo = await fetchDigitalAssetByMetadata(metaplexUmi, metadataPda);
    // console.log(`[fetchTokenMetadata] Fetched digital asset metadata:`, metadataAccountInfo);
    
    if (!metadataAccountInfo) {
      // console.log(`[fetchTokenMetadata] No metadata found for mint: ${mint}`);
      return getDefaultTokenMetadata(mint);
    }
    
    const collectionMetadata = await fetchMetadata(metaplexUmi, metadataPda);
    // console.log(`[fetchTokenMetadata] Collection metadata:`, {
    //   name: collectionMetadata.name,
    //   uri: collectionMetadata.uri
    // });

    const cid = collectionMetadata.uri ? extractCidFromUrl(collectionMetadata.uri) : null;
    // console.log(`[fetchTokenMetadata] Extracted CID:`, cid);
    
    const logo = cid ? await fetchIpfsMetadata(cid) : DEFAULT_IMAGE_URL;
    // console.log(`[fetchTokenMetadata] Fetched IPFS metadata:`, logo);

    const token = await withRetry(() =>
      rpcLimiter.schedule(() => fetchDigitalAssetByMetadata(metaplexUmi, metadataPda))
    );

    let metadata = await processTokenMetadata(token, logo?.imageUrl ?? '', cid ?? '', mint);
    // console.log(`[fetchTokenMetadata] Processed metadata:`, metadata);
    // Handle collection metadata separately to prevent failures
    const tokenStandard = metadataAccountInfo?.metadata?.tokenStandard?.valueOf();
    // console.log(`[fetchTokenMetadata] Token standard:`, tokenStandard);
    
    const isNft = tokenStandard === TokenStandard.NonFungible ||
      tokenStandard === TokenStandard.NonFungibleEdition ||
      tokenStandard === TokenStandard.ProgrammableNonFungible ||
      tokenStandard === TokenStandard.ProgrammableNonFungibleEdition;
    // console.log(`[fetchTokenMetadata] Is NFT:`, isNft);
    // console.log(`isNft: ${isNft}`);
    if (isNft) {
      const collectionName = collectionMetadata?.name ?? metadata.name;
      const collectionLogo = logo?.imageUrl ?? DEFAULT_IMAGE_URL;
      try {
        metadata = {
          ...metadata,
          collectionName,
          collectionLogo,
          isNft
        };
      } catch (collectionError) {
        console.warn(`Failed to fetch collection metadata for token ${mint}:`, collectionError);
        // Keep existing metadata if collection fetch fails
      }
    }

    // Cache the result before returning
    metadataCache.set(mint, metadata);
    return metadata;

  } catch (error) {
    console.error("[fetchTokenMetadata] Error fetching metadata:", {
      mint,
      error: error instanceof Error ? error.message : error,
      
    });
    const defaultMetadata = await getDefaultTokenMetadata(mint);
    metadataCache.set(mint, defaultMetadata);
    return defaultMetadata;
  }
}

export async function fetchTokenAccounts(publicKey: PublicKey) {
  const filters: GetProgramAccountsFilter[] = [
    {
      dataSize: 165, // Size of token account (bytes)
    },
    {
      memcmp: {
        offset: 32, // Location of owner address in token account data
        bytes: publicKey.toBase58(), // Wallet address as base58 string
      },
    }
  ];

  return rpcLimiter.schedule(() =>
    connection.getParsedProgramAccounts(
      TOKEN_PROGRAM_ID,
      { filters }
    )
  );
}

// export async function fetchNftPrice(mintAddress: string) {
//   const response = await apiLimiter.schedule(() =>
//     fetch(`api/get-nft-floor`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ ca: mintAddress }),
//     })
//   );
//   return response.json();
// }

export async function handleTokenData(publicKey: PublicKey, tokenAccount: any, apiLimiter: any) {
  const mintAddress = tokenAccount.account.data.parsed.info.mint;
  // console.log(`[handleTokenData] Processing token with mint: ${mintAddress}`);

  const amount = tokenAccount.account.data.parsed.info.tokenAmount.uiAmount || 0;
  const decimals = tokenAccount.account.data.parsed.info.tokenAmount.decimals;
  // console.log(`[handleTokenData] Token amount: ${amount}, decimals: ${decimals}`);

  const [tokenAccountAddress] = PublicKey.findProgramAddressSync(
    [publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mintAddress).toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  // console.log(`[handleTokenData] Token account address: ${tokenAccountAddress.toString()}`);

  const jupiterPrice = await apiLimiter.schedule(() =>
    fetchJupiterSwap(mintAddress)
  );
  // console.log(`[handleTokenData] Jupiter price data:`, jupiterPrice.data[mintAddress]);

  const metadata = await fetchTokenMetadata(new PublicKey(mintAddress), mintAddress);
  // console.log(`[handleTokenData] Processed metadata:`, metadata);

  if (!metadata?.isNft) {
    const price = jupiterPrice.data[mintAddress]?.price || 0;
    const usdValue = amount * price;
    // console.log(`[handleTokenData] Token USD value: ${usdValue}`);

    return {
      mintAddress,
      tokenAddress: tokenAccountAddress.toString(),
      amount,
      decimals,
      usdValue,
      ...metadata,
    };
  } else {
    // // console.log(`[handleTokenData] Processing NFT price for ${mintAddress}`);
    // const nftData = await fetchNftPrice(mintAddress);
    // // console.log(`[handleTokenData] NFT price data:`, nftData);
    // const nftPrice = nftData.usdValue ?? 0;
    // // console.log(`NFT Floor Price of ${mintAddress}:`, nftPrice);
    return {
      mintAddress,
      tokenAddress: tokenAccountAddress.toString(),
      amount,
      decimals,
      usdValue: 0,
      ...metadata,
    };
  }
}

// Optimized batch processing with parallel execution where safe
async function processTokenBatch(
  batch: { account: { data: Buffer | ParsedTokenAccountData } }[],
  publicKey: PublicKey,
  jupiterPrices: any
): Promise<TokenData[]> {
  const results: TokenData[] = [];
  const metadataPromises: Promise<void>[] = [];
  const processedMints = new Set<string>();

  // First pass: Process all non-NFTs in parallel since they use cached Jupiter prices
  const nonNftPromises = batch?.map(async (account) => {
    try {
      const data = account.account.data;
      if (!isParsedTokenAccountData(data)) {
        return;
      }

      const parsedData = data.parsed.info;
      const mintAddress = parsedData.mint;

      // Skip if already processed
      if (processedMints.has(mintAddress)) {
        return;
      }
      processedMints.add(mintAddress);

      const amount = parsedData.tokenAmount.uiAmount || 0;
      const decimals = parsedData.tokenAmount.decimals;

      const [tokenAccountAddress] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mintAddress).toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      // Check cache first
      let metadata = metadataCache.get(mintAddress);
      if (!metadata) {
        const metadataPromise = withExponentialBackoff(() =>
          fetchTokenMetadata(new PublicKey(mintAddress), mintAddress)
        ).then(fetchedMetadata => {
          if (fetchedMetadata) {
            metadataCache.set(mintAddress, fetchedMetadata);
            metadata = fetchedMetadata;
          }
        });
        metadataPromises.push(metadataPromise);
        return;
      }

      if (!metadata?.isNft) {
        const price = jupiterPrices?.data?.[mintAddress]?.price || 0;
        results.push({
          mintAddress,
          tokenAddress: tokenAccountAddress.toString(),
          amount,
          decimals,
          usdValue: amount * price,
          ...metadata,
        });
      }
    } catch (error) {
      console.error("Error processing token data:", error);
    }
  });

  // Wait for all metadata fetches and non-NFT processing
  await Promise.all([...nonNftPromises, ...metadataPromises]);

  // Second pass: Process NFTs sequentially (they need separate price fetches)
  for (const account of batch) {
    try {
      const data = account.account.data;
      if (!isParsedTokenAccountData(data)) {
        continue;
      }

      const parsedData = data.parsed.info;
      const mintAddress = parsedData.mint;

      // Skip if already processed in first pass
      if (processedMints.has(mintAddress)) {
        continue;
      }

      const amount = parsedData.tokenAmount.uiAmount || 0;
      const decimals = parsedData.tokenAmount.decimals;

      const [tokenAccountAddress] = PublicKey.findProgramAddressSync(
        [publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), new PublicKey(mintAddress).toBuffer()],
        ASSOCIATED_TOKEN_PROGRAM_ID
      );

      const metadata = metadataCache.get(mintAddress);
      if (metadata?.isNft) {
        // const nftData = await withExponentialBackoff(() =>
        //   fetchNftPrice(mintAddress)
        // );
        results.push({
          mintAddress,
          tokenAddress: tokenAccountAddress.toString(),
          amount,
          decimals,
          usdValue: 0,
          ...metadata,
        });
        await new Promise(resolve => setTimeout(resolve, TOKEN_DELAY));
      }
    } catch (error) {
      console.error("Error processing NFT data:", error);
    }
  }

  return results;
}

export async function fetchTokenDatafromPublicKey(publicKey: PublicKey) {
  try {
    const tokenAccounts = await withExponentialBackoff(() =>
      fetchTokenAccounts(publicKey)
    );

    // Filter out zero balance tokens and invalid data
    const nonZeroTokenAccounts = tokenAccounts.filter(account => {
      const data = account.account.data;
      if (!isParsedTokenAccountData(data)) {
        return false;
      }
      const tokenAmount = data.parsed.info.tokenAmount.uiAmount || 0;
      return tokenAmount > 0;
    });

    let totalValue = 0;
    const results: TokenData[] = [];
    
    // Pre-fetch all mint addresses
    const allMintAddresses = nonZeroTokenAccounts.map(account => {
      const data = account.account.data;
      if (!isParsedTokenAccountData(data)) {
        throw new Error('Invalid token account data format');
      }
      return data.parsed.info.mint;
    });

    // Batch process in parallel where possible
    for (let i = 0; i < nonZeroTokenAccounts.length; i += BATCH_SIZE) {
      const batch = nonZeroTokenAccounts.slice(i, i + BATCH_SIZE);
      const batchMints = allMintAddresses.slice(i, i + BATCH_SIZE);

      // Batch fetch prices with retry
      const jupiterPrices = await withExponentialBackoff(() =>
        apiLimiter.schedule(() => fetchJupiterSwapBatch(batchMints))
      );

      const batchResults = await processTokenBatch(batch, publicKey, jupiterPrices);
      results.push(...batchResults);
      
      // Update total value
      totalValue += batchResults.reduce((sum, token) => sum + (token.usdValue || 0), 0);

      // Add shorter delay between batches
      if (i + BATCH_SIZE < nonZeroTokenAccounts.length) {
        await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
      }
    }

    // Filter out tokens without proper names
    const validTokens = results.filter(token => token.name !== token.mintAddress);

    return {
      tokens: validTokens,
      totalValue
    };
  } catch (error) {
    console.error("Error fetching token data:", error);
    return {
      tokens: [],
      totalValue: 0
    };
  }
}

export const fetchJupiterSwapBatch = async (mintAddresses: string[]) => {
  try {
    if (!mintAddresses.length) return null;
    
    // Join all mint addresses with comma
    const ids = mintAddresses.join(',');
    const response = await fetch(`${JUPITER}/price/v2?ids=${ids}`);
    
    if (!response.ok) {
      // Batch request to DexScreener for fallback
      const tokenInfoPromises = mintAddresses.map(id => getTokenInfo(id));
      const tokenInfos = await Promise.all(tokenInfoPromises);
      
      // Format response to match Jupiter's structure
      const data = tokenInfos.reduce((acc, tokenInfo, index) => {
        if (tokenInfo) {
          acc[mintAddresses[index]] = {
            price: tokenInfo.price,
            liquidity: tokenInfo.liquidity?.usd || 0,
            volume: tokenInfo.volume?.h24 || 0
          };
        }
        return acc;
      }, {} as Record<string, any>);
      
      return { data };
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching Jupiter swap prices:', error);
    return { data: {} };
  }
};