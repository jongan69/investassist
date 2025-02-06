interface WhaleActivity {
    symbol: string;
    name: string;
    token_address: string;
    bullishScore?: number;
    bearishScore?: number;
}

interface TopTweetedTickers {
    ticker: string;
    ca: string;
    count: number;
}

interface TrendData {
    bitcoinPrice: string;
    ethereumPrice: string;
    solanaPrice: string;
    topTweetedTickers: TopTweetedTickers[];
    whaleActivity: {
        bullish: WhaleActivity[];
        bearish: WhaleActivity[];
    };
}