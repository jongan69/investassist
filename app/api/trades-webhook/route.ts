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
  instructions: Array<{
    programId: string
    accounts: string[]
    data: string
  }>
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

async function parsePumpFunTransaction(transaction: Transaction): Promise<{ action: string | null; description: string }> {
  // Pump.fun program ID and constants
  const PUMP_PROGRAM_ID = '6EF8rrecthR5Dkzon8Nwu78hRvfCKubJ14M5uBEwF6P'
  const SOL_MINT = 'So11111111111111111111111111111111111111112'
  const SOL_DECIMAL = 1e9
  
  if (transaction.source === PUMP_PROGRAM_ID) {
    // Check if any instruction is from the Pump.fun program
    const hasPumpInstruction = transaction.instructions?.some(
      instruction => instruction.programId === PUMP_PROGRAM_ID
    )

    if (!hasPumpInstruction) {
      return { action: null, description: transaction.description }
    }

    // Find the token transfer that isn't SOL (the token being bought/sold)
    const tokenTransfer = transaction.tokenTransfers.find(t => t.mint !== SOL_MINT)
    const solTransfer = transaction.tokenTransfers.find(t => t.mint === SOL_MINT)

    if (!tokenTransfer) {
      return { action: null, description: transaction.description }
    }

    // Get token info to display symbol
    const tokenInfo = await getTokenInfo(tokenTransfer.mint)
    const tokenSymbol = tokenInfo?.symbol || 'Unknown Token'

    // Determine if it's a buy or sell based on the token transfer direction
    const isBuy = tokenTransfer.toUserAccount === transaction.feePayer

    if (isBuy) {
      const solAmount = Math.abs(solTransfer?.tokenAmount || 0)
      return {
        action: 'Buy',
        description: `Bought ${tokenTransfer.tokenAmount?.toFixed(2) || '0'} ${tokenSymbol} for ${solAmount.toFixed(4)} SOL`
      }
    } else {
      const solAmount = Math.abs(solTransfer?.tokenAmount || 0)
      return {
        action: 'Sell',
        description: `Sold ${tokenTransfer.tokenAmount?.toFixed(2) || '0'} ${tokenSymbol} for ${solAmount.toFixed(4)} SOL`
      }
    }
  }
  
  return {
    action: null,
    description: transaction.description
  }
}

export async function POST(request: Request) {
  try {
    const webhookData = await request.json()
    const transaction = webhookData[0]
    
    // Log a concise transaction summary
    console.log('\nTransaction Summary:')
    console.log('-------------------')
    console.log('Type:', transaction.type)
    console.log('Description:', transaction.description)
    console.log('Fee Payer:', transaction.feePayer)
    console.log('Timestamp:', new Date(transaction.timestamp * 1000).toISOString())
    console.log('\nToken Transfers:')
    transaction.tokenTransfers?.forEach((transfer: TokenTransfer, index: number) => {
      console.log(`\n[Transfer ${index + 1}]`)
      console.log('From:', transfer.fromUserAccount)
      console.log('To:', transfer.toUserAccount)
      console.log('Amount:', transfer.tokenAmount)
      console.log('Token:', transfer.mint)
      console.log('Standard:', transfer.tokenStandard)
    })
    console.log('\n-------------------\n')

    if (!Array.isArray(webhookData) || webhookData.length === 0) {
      return NextResponse.json({ error: 'Invalid webhook data format' }, { status: 400 })
    }

    if (!transaction?.feePayer) {
      return NextResponse.json({ error: 'Missing required transaction data' }, { status: 400 })
    }

    // Extract transfer details
    const { amount, senderAddress, receiverAddress } = extractTransferDetails(transaction)

    // Find matching trader
    const matchingTrader = await findMatchingTrader(senderAddress, receiverAddress)

    // Parse Pump.fun specific details - now awaiting the async function
    const { action, description } = await parsePumpFunTransaction(transaction)

    // Create base trade object
    const trade = {
      id: Date.now(),
      wallet: transaction.feePayer || '',
      toAmount: amount || 0,
      action: action,
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
      description: description,
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