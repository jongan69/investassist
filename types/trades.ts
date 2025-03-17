export interface Trade {
    id: number
    wallet: string
    toAmount: number
    action: string | null
    fromAmount: number
    fromTokenAddress: string
    fromTokenSymbol: string
    fromTokenPic: string
    toTokenAddress: string
    toTokenSymbol: string
    toTokenPic: string
    entryPrice: number
    exitPrice: number
    pnl: number
    roi: number
    lastTrade: string
    amountInvested: number
    holding: number
    avgSell: number
    holdingTime: number
    timestamp: number
    label: string
    description: string
    signature: string
    fromTokenData: any
    toTokenData: any
  }
  