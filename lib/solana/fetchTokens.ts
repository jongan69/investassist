import { Connection, PublicKey } from "@solana/web3.js";
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
import { HELIUS } from "./constants";
import { getPairDetails } from "./fetchDexData";
import { getPairFromCa } from "./getPairFromCa";

const connection = new Connection(HELIUS as string);
const metaplexUmi = createUmi(HELIUS as string).use(mplTokenMetadata());
const DEFAULT_IMAGE_URL = process.env.UNKNOWN_IMAGE_URL || "https://s3.coinmarketcap.com/static-gravity/image/5cc0b99a8dd84fbfa4e150d84b5531f2.png";

// Rate limiters
const rpcLimiter = new Bottleneck({ maxConcurrent: 10, minTime: 100 });
export const apiLimiter = new Bottleneck({ maxConcurrent: 5, minTime: 100 });

export interface TokenData {
  name: string;
  mintAddress: string;
  tokenAddress: string;
  amount: number;
  decimals: number;
  usdValue: number;
  symbol: string;
  logo: string;
  cid: null;
  isNft: boolean;
  collectionName: string;
  collectionLogo: string;
  description?: string;
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
      const pair = await getPairFromCa(mint);
      // console.log(`[fetchTokenMetadata] Pair from CA:`, pair);
      const pairDetails = await getPairDetails(pair);
      // console.log(`[fetchTokenMetadata] Pair details:`, pairDetails);
      return pairDetails;
    }
    
    const collectionMetadata = await fetchMetadata(metaplexUmi, metadataPda);
    // console.log(`[fetchTokenMetadata] Collection metadata:`, {
    //   name: collectionMetadata.name,
    //   uri: collectionMetadata.uri
    // });

    const cid = collectionMetadata.uri ? extractCidFromUrl(collectionMetadata.uri) : null;
    // console.log(`[fetchTokenMetadata] Extracted CID:`, cid);
    
    const logo = cid ? await fetchIpfsMetadata(cid) : null;
    // console.log(`[fetchTokenMetadata] Fetched IPFS metadata:`, logo);

    const token = await withRetry(() =>
      rpcLimiter.schedule(() => fetchDigitalAssetByMetadata(metaplexUmi, metadataPda))
    );

    let metadata = await processTokenMetadata(token, logo?.imageUrl ?? '', cid ?? '', mint);
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

    return metadata;

  } catch (error) {
    console.error("[fetchTokenMetadata] Error fetching metadata:", {
      mint,
      error: error instanceof Error ? error.message : error
    });
    return null;
  }
}

export async function fetchTokenAccounts(publicKey: PublicKey) {
  return rpcLimiter.schedule(() =>
    connection.getParsedTokenAccountsByOwner(publicKey, {
      programId: TOKEN_PROGRAM_ID,
    })
  );
}

export async function fetchNftPrice(mintAddress: string) {
  const response = await apiLimiter.schedule(() =>
    fetch(`api/get-nft-floor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ca: mintAddress }),
    })
  );
  return response.json();
}

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
    // console.log(`[handleTokenData] Processing NFT price for ${mintAddress}`);
    const nftData = await fetchNftPrice(mintAddress);
    // console.log(`[handleTokenData] NFT price data:`, nftData);
    const nftPrice = nftData.usdValue ?? 0;
    // console.log(`NFT Floor Price of ${mintAddress}:`, nftPrice);
    return {
      mintAddress,
      tokenAddress: tokenAccountAddress.toString(),
      amount,
      decimals,
      usdValue: nftPrice,
      ...metadata,
    };
  }
}