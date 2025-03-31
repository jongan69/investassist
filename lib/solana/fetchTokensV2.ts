import { Connection, GetProgramAccountsFilter } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TokenData } from "./fetchTokens";

// Token metadata interfaces
interface TokenPriceInfo {
    price_per_token: number;
    currency: string;
}

interface TokenInfo {
    symbol: string;
    supply: number;
    decimals: number;
    token_program: string;
    price_info?: TokenPriceInfo;
    mint_authority?: string;
    freeze_authority?: string;
}

interface TokenMetadataContent {
    metadata: {
        name: string;
        symbol: string;
        description?: string;
    };
    files?: Array<{
        uri: string;
        cdn_uri: string;
        mime: string;
    }>;
    links?: {
        image?: string;
    };
}

interface TokenMetadata {
    interface: string;
    id: string;
    content: TokenMetadataContent;
    token_info: TokenInfo;
}

export interface EnrichedTokenData extends TokenMetadata {
    balance: number;
    value: number;
}

// Add this interface at the top with other interfaces
interface VerifiedToken {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    tags: string[];
}

// Add this cache object for verified tokens
let verifiedTokensCache: {
    data: VerifiedToken[] | null;
    timestamp: number;
} = {
    data: null,
    timestamp: 0
};

export async function getTokenAccounts(wallet: string, solanaConnection: Connection) {
    const filters:GetProgramAccountsFilter[] = [
        {
          dataSize: 165,    //size of account (bytes)
        },
        {
          memcmp: {
            offset: 32,     //location of our query in the account (bytes)
            bytes: wallet,  //our search criteria, a base58 encoded string
          },            
        }];
    const accounts = await solanaConnection.getParsedProgramAccounts(
        TOKEN_PROGRAM_ID,
        {filters: filters}
    );
    
    // Create an object to store token mint addresses and balances
    const tokenBalances: { [key: string]: number } = {};
    
    accounts.forEach((account) => {
        const parsedAccountInfo:any = account.account.data;
        const mintAddress:string = parsedAccountInfo["parsed"]["info"]["mint"];
        const tokenBalance: number = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
        
        // Only add tokens with non-zero balance
        if (tokenBalance > 0) {
            tokenBalances[mintAddress] = tokenBalance;
        }
    });

    return tokenBalances;
}

export function convertToTokenData(enrichedToken: EnrichedTokenData): TokenData {
    return {
        name: enrichedToken.content.metadata.name,
        mintAddress: enrichedToken.id,
        tokenAddress: '', // This will be populated by the associated token account
        amount: enrichedToken.balance,
        decimals: enrichedToken.token_info.decimals,
        usdValue: enrichedToken.value,
        symbol: enrichedToken.content.metadata.symbol,
        logo: enrichedToken.content.links?.image || '',
        cid: null,
        isNft: enrichedToken.interface === 'NFT',
        description: enrichedToken.content.metadata.description
    };
}

export async function getTokenAccountsWithMetadata(wallet: string, solanaConnection: Connection): Promise<TokenData[]> {
    const enrichedTokens = await getTokenAccountsWithMetadataRaw(wallet, solanaConnection);
    return enrichedTokens.map(convertToTokenData);
}

// Add this function to fetch verified tokens
async function getVerifiedTokens(): Promise<VerifiedToken[]> {
    const ONE_HOUR = 3600000; // 1 hour in milliseconds
    const now = Date.now();

    // Return cached data if it's less than 1 hour old
    if (verifiedTokensCache.data && (now - verifiedTokensCache.timestamp) < ONE_HOUR) {
        return verifiedTokensCache.data;
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/jupiter-tokens`);
        if (!response.ok) {
            throw new Error('Failed to fetch verified tokens');
        }

        const tokens = await response.json();
        
        // Update cache
        verifiedTokensCache = {
            data: tokens,
            timestamp: now
        };

        return tokens;
    } catch (error) {
        console.error('Error fetching verified tokens:', error);
        // Return empty array if fetch fails
        return [];
    }
}

// Modify the getTokenAccountsWithMetadataRaw function
async function getTokenAccountsWithMetadataRaw(wallet: string, solanaConnection: Connection): Promise<EnrichedTokenData[]> {
    const tokenBalances = await getTokenAccounts(wallet, solanaConnection);
    const verifiedTokens = await getVerifiedTokens();
    
    // Create a Set of verified token addresses for faster lookup
    const verifiedTokenAddresses = new Set(verifiedTokens.map(token => token.address));
    
    // Filter mintAddresses to only include verified tokens
    const mintAddresses = Object.keys(tokenBalances).filter(address => verifiedTokenAddresses.has(address));
    
    if (mintAddresses.length === 0) {
        return [];
    }

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/get-token-meta`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ids: mintAddresses
            })
        });

        if (!response.ok) {
            console.error('Failed to fetch token metadata:', response.status, response.statusText);
            throw new Error(`Failed to fetch token metadata: ${response.status}`);
        }

        const metadataResponse = await response.json();
        
        // Validate the response structure
        if (!metadataResponse || !Array.isArray(metadataResponse.result)) {
            console.error('Invalid metadata response structure:', metadataResponse);
            throw new Error('Invalid metadata response structure');
        }

        const metadata: TokenMetadata[] = metadataResponse.result;

        // Filter out any invalid tokens and map the valid ones
        return metadata
            .filter(token => token && token.id && tokenBalances[token.id] !== undefined)
            .map((token) => ({
                ...token,
                balance: tokenBalances[token.id],
                value: token.token_info?.price_info?.price_per_token 
                    ? token.token_info.price_info.price_per_token * tokenBalances[token.id]
                    : 0
            }));
    } catch (error) {
        console.error('Error fetching token metadata:', error);
        // Return empty array instead of throwing to prevent UI crashes
        return [];
    }
}

// Example usage:
// const tokenBalances = await getTokenAccounts(walletToQuery, solanaConnection);
// console.log(tokenBalances);
//  Example output:
// {
//     "mintAddress1": 100.5,
//     "mintAddress2": 50.0,
//     // ... more token balances
// }

// Example usage:
// const tokensWithMetadata = await getTokenAccountsWithMetadata(walletAddress, solanaConnection);
// Returns array of tokens with both metadata and balance information:
// [
//   {
//     id: "mint_address",
//     balance: 100.5,
//     value: 505.25, // if price data available
//     content: {...},  // metadata from Helius
//     token: {...}     // token info from Helius
//   },
//   ...
// ]