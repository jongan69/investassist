export interface Stock {
    symbol: string;
    regularMarketPrice?: number;
    marketPrice?: number;
    price?: number;
    regularMarketChange?: number;
    regularMarketPreviousClose?: number;
    regularMarketChangePercent?: number;
    longName?: string;
    regularMarketVolume?: number;
    marketCap?: number;
    priceToBook?: number;
    fiftyTwoWeekHigh?: number;
}

export interface Contract {
    strike_price: string;
    ask_price?: string;
    last_price?: string;
    bid_price?: string;
    implied_volatility?: string;
    type: string;
    expiration_date: string;
    open_interest?: string;
    volume?: string;
    delta?: string;
    gamma?: string;
    theta?: string;
    vega?: string;
    symbol: string;
    exercise_style?: string;
    trading_status?: string;
    last_trade_date?: string;
    underlying_symbol?: string;
}

export interface Recommendation {
    symbol: string;
    companyName: string;
    stockScore: number;
    screener: string;
    currentPrice: number;
    options: {
        shortTermCalls: any;
        leapCalls: any;
        shortTermPuts: any;
        leapPuts: any;
    };
    optionsAvailable: {
        shortTermCalls: boolean;
        leapCalls: boolean;
        shortTermPuts: boolean;
        leapPuts: boolean;
    };
}

export interface OptionContract {
    symbol: string;
    strike_price: number;
    expiration_date: string;
    open_interest: number;
}

export interface OptionPrices {
    ask_price: number;
    bid_price: number;
    last_price: number;
    implied_volatility: number;
    open_interest: number;
    open_interest_date: string;
    close_price_date: string;
}