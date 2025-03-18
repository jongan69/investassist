import { NextResponse } from 'next/server'
import { pusher } from '@/lib/pusher'
import { getTokenInfo } from '@/lib/solana/fetchDefaultTokenData'
import { Trade } from '@/types/trades'

interface TokenTransfer {
  fromUserAccount: string
  toUserAccount: string
  amount: number
  mint: string
  fromTokenAccount?: string
  toTokenAccount?: string
  tokenAmount?: number
  tokenStandard?: string
}

interface NativeTransfer {
  amount: number
  fromUserAccount: string
  toUserAccount: string
}

interface AccountData {
  account: string
  nativeBalanceChange: number
  tokenBalanceChanges: Array<{
    mint: string
    rawTokenAmount: {
      decimals: number
      tokenAmount: string
    }
    tokenAccount: string
    userAccount: string
  }>
}

interface NFTEvent {
  amount: number
  buyer: string
  description: string
  fee: number
  feePayer: string
  nfts: Array<{
    mint: string
    tokenStandard: string
  }>
  saleType: string
  seller: string
  signature: string
  slot: number
  source: string
  staker: string
  timestamp: number
  type: string
}

interface Transaction {
  accountData: AccountData[]
  description: string
  events: {
    nft: NFTEvent
  }
  fee: number
  feePayer: string
  nativeTransfers: NativeTransfer[]
  signature: string
  slot: number
  source: string
  timestamp: number
  tokenTransfers: TokenTransfer[]
  type: string
}

interface Trader {
  username: string;
  wallets: {
    SOL?: string[];
    ETH?: string[];
  };
}

async function fetchTraderAccounts() {
  try {
    const response = await fetch('https://soltrendio.com/api/premium/tracked-accounts', { cache: 'no-store' });
    return await response.json();
  } catch (error) {
    console.error('Error retrieving tracked accounts:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const webhookData = await request.json()
    console.log(webhookData)
    if (!Array.isArray(webhookData) || webhookData.length === 0) {
      return NextResponse.json({ error: 'Invalid webhook data format' }, { status: 400 })
    }

    const transaction: Transaction = webhookData[0]
    if (!transaction?.feePayer) {
      return NextResponse.json({ error: 'Missing required transaction data' }, { status: 400 })
    }

    // Extract transfer details
    const { amount, senderAddress, receiverAddress } = extractTransferDetails(transaction)

    // Find matching trader
    const matchingTrader = await findMatchingTrader(senderAddress, receiverAddress)

    // Create base trade object
    const trade = {
      id: Date.now(), // or generate a proper ID
      wallet: transaction.feePayer || '',
      toAmount: amount || 0,
      action: null,
      fromAmount: 0,
      fromTokenAddress: '',
      fromTokenSymbol: '',
      fromTokenPic: '',
      toTokenAddress: '',
      toTokenSymbol: '',
      toTokenPic: '',
      entryPrice: 0,
      exitPrice: 0,
      pnl: 0,
      roi: 0,
      lastTrade: '',
      amountInvested: 0,
      holding: 0,
      avgSell: 0,
      holdingTime: 0,
      timestamp: (transaction.timestamp || Date.now()) * 1000,
      label: matchingTrader?.username || 'Unknown',
      description: transaction.description || '',
      signature: transaction.signature || '',
      fromTokenData: null,
      toTokenData: null
    }

    // Parse swap details if present
    if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
      await enrichTradeWithSwapDetails(trade, transaction)
    }

    // Ensure all values are properly formatted before sending to Pusher
    const sanitizedTrade = JSON.parse(JSON.stringify(trade))

    // Save and broadcast
    // await saveTrade(trade)
    await pusher.trigger('trades', 'new-trade', sanitizedTrade)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ error: 'Internal server error: ' + err }, { status: 500 })
  }
}

function extractTransferDetails(transaction: Transaction) {
  let amount = 0
  let senderAddress = ''
  let receiverAddress = ''

  if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
    const [tokenTransfer] = transaction.tokenTransfers
    amount = tokenTransfer.amount
    senderAddress = tokenTransfer.fromUserAccount
    receiverAddress = tokenTransfer.toUserAccount
  } else if (transaction.nativeTransfers && transaction.nativeTransfers.length > 0) {
    const [nativeTransfer] = transaction.nativeTransfers
    amount = nativeTransfer.amount
    const addressRegex = /([1-9A-HJ-NP-Za-km-z]{32,44})/g
    const [sender, receiver] = transaction.description.match(addressRegex) || []
    if (sender && receiver) {
      senderAddress = sender
      receiverAddress = receiver
    }
  }

  return { amount, senderAddress, receiverAddress }
}

async function findMatchingTrader(senderAddress?: string, receiverAddress?: string) {
  const tradersData = await fetchTraderAccounts()
  if (!tradersData) {
    return null
  }
  return tradersData.find((trader: Trader) => {
    // Skip traders with no wallets or no SOL wallets
    if (!trader.wallets || !trader.wallets.SOL || trader.wallets.SOL.length === 0) {
      return false
    }
    return trader.wallets.SOL.some((wallet: string) => 
      senderAddress?.toLowerCase() === wallet.toLowerCase() ||
      receiverAddress?.toLowerCase() === wallet.toLowerCase()
    )
  })
}

async function enrichTradeWithSwapDetails(trade: Trade, transaction: Transaction) {
  const swapRegex = /(swapped|transferred) ([\d.]+) (\w+) for ([\d.]+) (\w+)/
  const swapMatch = transaction.description.match(swapRegex)

  if (swapMatch) {
    const [, action, fromAmount, fromToken, toAmount] = swapMatch
    const fromTokenMint = transaction.tokenTransfers![0].mint
    const toTokenMint = transaction.tokenTransfers![1].mint
    const enrichedFromData = await getTokenInfo(fromTokenMint)
    const enrichedToData = await getTokenInfo(toTokenMint)
    trade.action = action
    trade.fromAmount = parseFloat(fromAmount)
    trade.fromTokenSymbol = fromToken === 'SOL' ? 'SOL' : enrichedFromData?.symbol || fromToken
    trade.toAmount = parseFloat(toAmount)
    trade.fromTokenData = {
      image: enrichedFromData?.image || '',
      symbol: enrichedFromData?.symbol || '',
      address: fromTokenMint,
      priceUsd: enrichedFromData?.price || 0,
      volume24h: enrichedFromData?.volume?.h24 || 0,
      marketCap: enrichedFromData?.marketCap || 0,
      liquidity: enrichedFromData?.liquidity?.usd || 0,
      priceChange24h: enrichedFromData?.priceChange?.h24 || 0,
    }
    trade.toTokenSymbol = enrichedToData?.symbol || ''
    trade.toTokenData = {
      image: enrichedToData?.image || '',
      symbol: enrichedToData?.symbol || '',
      address: toTokenMint,
      priceUsd: enrichedToData?.price || 0,
      volume24h: enrichedToData?.volume?.h24 || 0,
      marketCap: enrichedToData?.marketCap || 0,
      liquidity: enrichedToData?.liquidity?.usd || 0,
      priceChange24h: enrichedToData?.priceChange?.h24 || 0,
      holderCount: 0, // Not available in TokenInfo
      totalSupply: 0, // Not available in TokenInfo
    }
  }
} 