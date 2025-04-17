import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";

export const SOLANA_MAIN = clusterApiUrl(WalletAdapterNetwork.Mainnet);
export const SOLANA_TEST = clusterApiUrl(WalletAdapterNetwork.Testnet);
export const SOLANA_DEV = clusterApiUrl(WalletAdapterNetwork.Devnet);
export const GENESYSGO = "https://ssc-dao.genesysgo.net";
export const METAPLEX = "https://api.metaplex.solana.com";
export const SERUM = "https://solana-api.projectserum.com";
export const HELIUS = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;
export const DEXSCREENER = "https://api.dexscreener.com";
export const JUPITER = "https://api.jup.ag";
export const DEFAULT_IMAGE_URL = process.env.UNKNOWN_IMAGE_URL || "https://s3.coinmarketcap.com/static-gravity/image/5cc0b99a8dd84fbfa4e150d84b5531f2.png";

export const JUPITER_QUOTE = "https://quote-api.jup.ag/v6";
export const SOL_MINT = "So11111111111111111111111111111111111111112";

export const BLOCKENGINE = `mainnet.block-engine.jito.wtf`
export const INVEST_ASSIST_MINT = "8KxEiudmUF5tpJKK4uHzjDuJPGKUz9hYUDBEVcfdpump";
export const MOONSHOT_LINK = 'https://moonshot.money/xN27hcrY3fj7yWpX2mguwPgi?ref=vtsmoh24uf'
export const INVEST_ASSIST_MINT_DECIMALS = 6;
export const COST_OF_INVESTMENT_PLAN = 1000;
// You can use any of the other enpoints here
// export const NETWORK = "https://api.devnet.solana.com"; // for devnet
// or
// export const NETWORK = "https://api.mainnet-beta.solana.com"; // for mainnet

export const MARKET_API = "https://marketapi-mu83.onrender.com"