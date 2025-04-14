
// Define custom screener types
export type CustomScreenerType =
  | "low_pe_ratio"
  | "high_margin_tech"
  | "undervalued_midcaps"
  | "momentum_leaders"
  | "value_stocks"
  | "growth_stocks"
  | "income_stocks"
  | "dcf_undervalued"
  | "epv_undervalued"
  | "rim_undervalued"
  | "relative_value"
  | "nav_undervalued"
  | "gordon_growth"
  | "quality_moat"      // New screener
  | "dividend_growth"   // New screener
  | "momentum_value"    // New screener
  | "low_volatility"    // New screener

// Define the base screener sources for each custom screener
export const customScreenerSources: Record<CustomScreenerType, string[]> = {
  low_pe_ratio: ["undervalued_large_caps", "undervalued_growth_stocks", "solid_large_growth_funds"],
  high_margin_tech: [
    "most_actives",
    "undervalued_large_caps",
    "solid_midcap_growth_funds",
    "day_gainers",
    "portfolio_anchors",
    "top_mutual_funds",
    "undervalued_growth_stocks"
  ],
  undervalued_midcaps: ["solid_midcap_growth_funds", "undervalued_growth_stocks"],
  momentum_leaders: ["day_gainers", "small_cap_gainers"],
  value_stocks: ["undervalued_large_caps", "undervalued_growth_stocks"],
  growth_stocks: ["growth_technology_stocks", "solid_large_growth_funds", "solid_midcap_growth_funds"],
  income_stocks: ["undervalued_large_caps", "portfolio_anchors", "solid_large_growth_funds"],
  // New valuation-based screeners
  dcf_undervalued: [
    "portfolio_anchors",
    "most_actives",
    "day_gainers",
    "undervalued_large_caps",
    "solid_midcap_growth_funds",
    "top_mutual_funds",
    "undervalued_growth_stocks"
  ],
  epv_undervalued: ["undervalued_large_caps", "undervalued_growth_stocks", "solid_large_growth_funds"],
  rim_undervalued: ["undervalued_large_caps", "undervalued_growth_stocks", "solid_large_growth_funds"],
  relative_value: ["undervalued_large_caps", "undervalued_growth_stocks", "portfolio_anchors"],
  nav_undervalued: ["undervalued_large_caps", "undervalued_growth_stocks", "solid_large_growth_funds"],
  gordon_growth: ["undervalued_large_caps", "portfolio_anchors", "solid_large_growth_funds"],
  // New screeners with appropriate sources
  quality_moat: ["solid_large_growth_funds", "solid_midcap_growth_funds", "undervalued_large_caps"],
  dividend_growth: ["undervalued_large_caps", "portfolio_anchors", "solid_large_growth_funds"],
  momentum_value: ["day_gainers", "most_actives", "undervalued_growth_stocks"],
  low_volatility: ["undervalued_large_caps", "solid_large_growth_funds", "portfolio_anchors"],
}

// Define filtering criteria for each custom screener
export const customScreenerFilters: Record<CustomScreenerType, (stock: any) => boolean> = {
  low_pe_ratio: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a P/E ratio
    if (!stock.trailingPE) return false
    
    // P/E ratio must be less than 15
    if (stock.trailingPE > 15) return false
    
    // Must have positive earnings
    if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths <= 0) return false
    
    // Must have a reasonable market cap (at least $1B)
    if (!stock.marketCap || stock.marketCap < 1000000000) return false
    
    return true
  },
  
  high_margin_tech: (stock) => {
    console.log(`[DEBUG] Checking ${stock.symbol} for high_margin_tech screener`)
    
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Not an equity (${stock.quoteType})`)
      return false
    }
    
    // Must have a reasonable market cap (at least $50M) - already lowered from $100M
    if (!stock.marketCap || stock.marketCap < 50000000) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Market cap too small (${stock.marketCap})`)
      return false
    }
    
    // Must have positive earnings
    if (!stock.epsTrailingTwelveMonths || stock.epsTrailingTwelveMonths <= 0) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Negative EPS (${stock.epsTrailingTwelveMonths})`)
      return false
    }
    
    // List of known tech stock symbols (partial list)
    const knownTechSymbols = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'INTC', 'AMD', 'CRM', 'ADBE', 
      'ORCL', 'CSCO', 'IBM', 'QCOM', 'TXN', 'MU', 'AMAT', 'LRCX', 'KLAC', 'ASML',
      'TSLA', 'PLTR', 'SNOW', 'DDOG', 'NET', 'CRWD', 'ZS', 'OKTA', 'TEAM', 'SHOP',
      'SQ', 'PYPL', 'MELI', 'BABA', 'JD', 'PDD', 'BIDU', 'TCEHY', 'SNAP', 'PINS',
      'TWTR', 'UBER', 'LYFT', 'DASH', 'RBLX', 'RNG', 'ZM', 'DOCN', 'PATH', 'U',
      'COIN', 'RIOT', 'MARA', 'HUT', 'BITF', 'CAN', 'SMCI', 'DELL', 'HPQ', 'LOGI',
      'ANET', 'JNPR', 'UI', 'DOCU', 'WDAY', 'NOW', 'SNPS', 'CDNS', 'ANSS', 'ADSK',
      'MTCH', 'EA', 'ATVI', 'TTWO', 'RBLX', 'U', 'ROKU', 'DIS', 'NFLX', 'CMCSA',
      'T', 'VZ', 'TMUS', 'S', 'VOD', 'ERIC', 'NOK', 'QCOM', 'AVGO', 'SWKS', 'QRVO',
      'MRVL', 'AMBA', 'LSCC', 'XLNX', 'ADI', 'MCHP', 'NXPI', 'STM', 'TSM', 'ASX',
      'UMC', 'SMIC', 'GFS', 'AMAT', 'LRCX', 'KLAC', 'ASML', 'TER', 'AMKR', 'CREE',
      'IIVI', 'COHR', 'IPGP', 'LITE', 'ACIA', 'AAOI', 'FNSR', 'CIEN', 'JNPR', 'ANET',
      'UI', 'NET', 'FSLY', 'AKAM', 'CDN', 'NET', 'DDOG', 'NEWR', 'APPN', 'FROG',
      'SUMO', 'SPLK', 'ESTC', 'LOGM', 'DOCN', 'PATH', 'U', 'RNG', 'ZM', 'TEAM', 'OKTA',
      'CRWD', 'ZS', 'NET', 'PANW', 'FTNT', 'CYBR', 'RPD', 'VRNS', 'TENB', 'RNG',
      'DOCN', 'PATH', 'U', 'RNG', 'ZM', 'TEAM', 'OKTA', 'CRWD', 'ZS', 'NET', 'PANW',
      'FTNT', 'CYBR', 'RPD', 'VRNS', 'TENB', 'RNG', 'DOCN', 'PATH', 'U', 'RNG', 'ZM',
      'TEAM', 'OKTA', 'CRWD', 'ZS', 'NET', 'PANW', 'FTNT', 'CYBR', 'RPD', 'VRNS', 'TENB'
    ];
    
    // Check if the stock is in the Technology sector or has a technology-related industry
    // OR if it's in our list of known tech symbols
    const isTechSector = 
      (stock.sector && stock.sector.toLowerCase().includes('technology')) ||
      (stock.industry && (
        stock.industry.toLowerCase().includes('software') ||
        stock.industry.toLowerCase().includes('semiconductor') ||
        stock.industry.toLowerCase().includes('internet') ||
        stock.industry.toLowerCase().includes('hardware') ||
        stock.industry.toLowerCase().includes('electronics') ||
        stock.industry.toLowerCase().includes('telecommunications') ||
        stock.industry.toLowerCase().includes('information') ||
        stock.industry.toLowerCase().includes('computer') ||
        stock.industry.toLowerCase().includes('digital') ||
        stock.industry.toLowerCase().includes('data') ||
        stock.industry.toLowerCase().includes('cloud') ||
        stock.industry.toLowerCase().includes('ai') ||
        stock.industry.toLowerCase().includes('robotics') ||
        stock.industry.toLowerCase().includes('cyber') ||
        stock.industry.toLowerCase().includes('tech') ||
        stock.industry.toLowerCase().includes('media') ||
        stock.industry.toLowerCase().includes('entertainment') ||
        stock.industry.toLowerCase().includes('communication') ||
        stock.industry.toLowerCase().includes('network') ||
        stock.industry.toLowerCase().includes('platform') ||
        stock.industry.toLowerCase().includes('service') ||
        stock.industry.toLowerCase().includes('solution') ||
        // Add more tech-related industries
        stock.industry.toLowerCase().includes('e-commerce') ||
        stock.industry.toLowerCase().includes('fintech') ||
        stock.industry.toLowerCase().includes('biotech') ||
        stock.industry.toLowerCase().includes('healthcare technology') ||
        stock.industry.toLowerCase().includes('automation') ||
        stock.industry.toLowerCase().includes('mobile') ||
        stock.industry.toLowerCase().includes('app') ||
        stock.industry.toLowerCase().includes('gaming') ||
        stock.industry.toLowerCase().includes('virtual reality') ||
        stock.industry.toLowerCase().includes('augmented reality') ||
        stock.industry.toLowerCase().includes('blockchain') ||
        stock.industry.toLowerCase().includes('cryptocurrency')
      )) ||
      knownTechSymbols.includes(stock.symbol);
    
    if (!isTechSector) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Not identified as a tech stock (sector: ${stock.sector}, industry: ${stock.industry})`)
      return false
    }
    
    // Check for high margins using multiple approaches
    // 1. First try operating margins if available
    // 2. Then try profit margins if available
    // 3. If both are missing, use earnings yield as a proxy for profitability
    // 4. For known tech stocks, we'll be more lenient with margin requirements
    
    let hasHighMargin = false;
    
    // Check operating margins if available
    if (stock.operatingMargins && stock.operatingMargins > 0.03) {
      hasHighMargin = true;
      console.log(`[DEBUG] ${stock.symbol}: Passed - High operating margin (${stock.operatingMargins})`);
    } 
    // Check profit margins if available
    else if (stock.profitMargins && stock.profitMargins > 0.03) {
      hasHighMargin = true;
      console.log(`[DEBUG] ${stock.symbol}: Passed - High profit margin (${stock.profitMargins})`);
    }
    // If margins are not available, use earnings yield as a proxy
    else if (stock.epsTrailingTwelveMonths && stock.regularMarketPrice) {
      const earningsYield = stock.epsTrailingTwelveMonths / stock.regularMarketPrice;
      if (earningsYield > 0.02) { // 2% earnings yield as a minimum
        hasHighMargin = true;
        console.log(`[DEBUG] ${stock.symbol}: Passed - Good earnings yield (${earningsYield})`);
      }
    }
    // For known tech stocks, we'll be more lenient
    else if (knownTechSymbols.includes(stock.symbol)) {
      // For known tech stocks, we'll assume they have decent margins
      hasHighMargin = true;
      console.log(`[DEBUG] ${stock.symbol}: Passed - Known tech stock with assumed good margins`);
    }
    
    if (!hasHighMargin) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Insufficient margin data or margins too low`);
      return false;
    }
    
    // Check for reasonable valuation (P/E < 50) - increased from 40
    if (stock.trailingPE && stock.trailingPE > 50) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - P/E ratio too high (${stock.trailingPE})`)
      return false
    }
    
    // Check for growth potential (positive forward EPS)
    // Make this optional - some tech companies reinvest heavily and may have negative forward EPS
    // if (stock.epsForward && stock.epsForward <= 0) return false
    
    console.log(`[DEBUG] ${stock.symbol}: PASSED all filters for high_margin_tech`)
    return true
  },
  
  undervalued_midcaps: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a market cap between $2B and $10B
    if (!stock.marketCap || stock.marketCap < 2000000000 || stock.marketCap > 10000000000) return false
    
    // Must have a P/E ratio
    if (!stock.trailingPE) return false
    
    // P/E ratio must be less than 20
    if (stock.trailingPE > 20) return false
    
    // Must have positive earnings
    if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths <= 0) return false
    
    return true
  },
  
  momentum_leaders: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a reasonable market cap (at least $500M)
    if (!stock.marketCap || stock.marketCap < 500000000) return false
    
    // Must have a positive price change
    if (!stock.regularMarketChangePercent || stock.regularMarketChangePercent <= 0) return false
    
    // Must have a significant price change (at least 5%)
    if (stock.regularMarketChangePercent < 5) return false
    
    // Must have sufficient volume
    if (!stock.regularMarketVolume || stock.regularMarketVolume < 100000) return false
    
    return true
  },
  
  value_stocks: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a P/E ratio
    if (!stock.trailingPE) return false
    
    // P/E ratio must be less than 20
    if (stock.trailingPE > 20) return false
    
    // Must have a price-to-book ratio
    if (!stock.priceToBook) return false
    
    // Price-to-book ratio must be less than 2
    if (stock.priceToBook > 2) return false
    
    // Must have positive earnings
    if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths <= 0) return false
    
    // Must have a reasonable market cap (at least $1B)
    if (!stock.marketCap || stock.marketCap < 1000000000) return false
    
    return true
  },
  
  growth_stocks: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a reasonable market cap (at least $1B)
    if (!stock.marketCap || stock.marketCap < 1000000000) return false
    
    // Must have positive earnings
    if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths <= 0) return false
    
    // Must have a reasonable P/E ratio (less than 30)
    if (stock.trailingPE && stock.trailingPE > 30) return false
    
    // Must have a positive PEG ratio
    if (stock.pegRatio && stock.pegRatio <= 0) return false
    
    // PEG ratio should be less than 2 (indicating reasonable growth valuation)
    if (stock.pegRatio && stock.pegRatio > 2) return false
    
    return true
  },
  
  income_stocks: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a dividend yield
    if (!stock.dividendYield || stock.dividendYield <= 0) return false
    
    // Must have a reasonable dividend yield (at least 2%)
    if (stock.dividendYield < 2) return false
    
    // Must have a reasonable payout ratio (less than 100%)
    if (stock.payoutRatio && stock.payoutRatio > 100) return false
    
    // Must have positive earnings
    if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths <= 0) return false
    
    // Must have a reasonable market cap (at least $500M)
    if (!stock.marketCap || stock.marketCap < 500000000) return false
    
    return true
  },
  
  // New valuation-based filters
  
  // 1. Discounted Cash Flow (DCF) Model
  dcf_undervalued: (stock) => {
    console.log(`[DEBUG] Checking ${stock.symbol} for dcf_undervalued screener`)
    
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Not an equity (${stock.quoteType})`)
      return false
    }
    
    // Must have a reasonable market cap (at least $50M) - lowered from $100M
    if (!stock.marketCap || stock.marketCap < 50000000) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Market cap too small (${stock.marketCap})`)
      return false
    }
    
    // Must have positive earnings
    if (!stock.epsTrailingTwelveMonths || stock.epsTrailingTwelveMonths <= 0) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Negative EPS (${stock.epsTrailingTwelveMonths})`)
      return false
    }
    
    // Check for free cash flow data or use earnings as a proxy
    const hasFreeCashFlow = stock.freeCashflow && stock.freeCashflow > 0
    const hasOperatingCashFlow = stock.operatingCashflow && stock.operatingCashFlow > 0
    const hasNetIncome = stock.netIncome && stock.netIncome > 0
    
    // If we have free cash flow data, use it
    if (hasFreeCashFlow) {
      // Calculate FCF yield (FCF / Market Cap)
      const fcfYield = stock.freeCashflow / stock.marketCap
      
      // FCF yield should be at least 1% (indicating undervaluation) - lowered from 1.5%
      if (fcfYield < 0.01) {
        console.log(`[DEBUG] ${stock.symbol}: Failed - FCF yield too low (${fcfYield})`)
        return false
      }
      
      // Check if the company has a reasonable debt level
      if (stock.totalDebt && stock.totalDebt > stock.marketCap * 0.9) {
        console.log(`[DEBUG] ${stock.symbol}: Failed - Debt too high (${stock.totalDebt / stock.marketCap})`)
        return false
      }
    } 
    // If we don't have free cash flow but have operating cash flow, use it
    else if (hasOperatingCashFlow) {
      // Calculate operating cash flow yield
      const ocfYield = stock.operatingCashflow / stock.marketCap
      
      // Operating cash flow yield should be at least 1.5% (indicating undervaluation) - lowered from 2%
      if (ocfYield < 0.015) {
        console.log(`[DEBUG] ${stock.symbol}: Failed - Operating cash flow yield too low (${ocfYield})`)
        return false
      }
      
      // Check if the company has a reasonable debt level
      if (stock.totalDebt && stock.totalDebt > stock.marketCap * 0.9) {
        console.log(`[DEBUG] ${stock.symbol}: Failed - Debt too high (${stock.totalDebt / stock.marketCap})`)
        return false
      }
    }
    // If we don't have cash flow data but have net income, use it
    else if (hasNetIncome) {
      // Calculate earnings yield (EPS / Price)
      const earningsYield = stock.epsTrailingTwelveMonths / stock.regularMarketPrice
      
      // Earnings yield should be at least 2% (indicating undervaluation) - lowered from 3%
      if (earningsYield < 0.02) {
        console.log(`[DEBUG] ${stock.symbol}: Failed - Earnings yield too low (${earningsYield})`)
        return false
      }
      
      // Check if the company has a reasonable debt level
      if (stock.totalDebt && stock.totalDebt > stock.marketCap * 0.9) {
        console.log(`[DEBUG] ${stock.symbol}: Failed - Debt too high (${stock.totalDebt / stock.marketCap})`)
        return false
      }
    }
    // If we don't have any cash flow or earnings data, use P/E ratio as a fallback
    else {
      // Check if the P/E ratio is reasonable (less than 25) - increased from 20
      if (!stock.trailingPE || stock.trailingPE > 25) {
        console.log(`[DEBUG] ${stock.symbol}: Failed - P/E ratio too high (${stock.trailingPE})`)
        return false
      }
      
      // Check if the company has a reasonable debt level
      if (stock.totalDebt && stock.totalDebt > stock.marketCap * 0.9) {
        console.log(`[DEBUG] ${stock.symbol}: Failed - Debt too high (${stock.totalDebt / stock.marketCap})`)
        return false
      }
    }
    
    // Check for growth potential (positive forward EPS)
    // Make this optional - some companies may have negative forward EPS due to reinvestment
    // if (stock.epsForward && stock.epsForward <= 0) return false
    
    // Check for reasonable valuation metrics
    // Price to book ratio should not be too high (indicating overvaluation)
    if (stock.priceToBook && stock.priceToBook > 8) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Price to book ratio too high (${stock.priceToBook})`)
      return false
    }
    
    // Check for reasonable analyst ratings (not too negative)
    if (stock.averageAnalystRating && 
        (stock.averageAnalystRating.includes('Sell') || 
         stock.averageAnalystRating.includes('Strong Sell'))) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Negative analyst rating (${stock.averageAnalystRating})`)
      return false
    }
    
    // Check for reasonable PEG ratio (if available)
    // PEG ratio should be less than 3 (indicating undervaluation relative to growth) - increased from 2.5
    if (stock.pegRatio && stock.pegRatio > 3) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - PEG ratio too high (${stock.pegRatio})`)
      return false
    }
    
    console.log(`[DEBUG] ${stock.symbol}: PASSED all filters for dcf_undervalued`)
    return true
  },
  
  // 2. Earnings Power Value (EPV)
  epv_undervalued: (stock) => {
    console.log(`[DEBUG] Checking ${stock.symbol} for epv_undervalued screener`)
    
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Not an equity (${stock.quoteType})`)
      return false
    }
    
    // Must have earnings data
    if (!stock.epsTrailingTwelveMonths || stock.epsTrailingTwelveMonths <= 0) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Negative EPS (${stock.epsTrailingTwelveMonths})`)
      return false
    }
    
    // Must have a reasonable market cap (at least $50M) - lowered from $100M
    if (!stock.marketCap || stock.marketCap < 50000000) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Market cap too small (${stock.marketCap})`)
      return false
    }
    
    // Calculate normalized earnings using a conservative estimate
    // We'll use the average of the last 3 years if available, or just current earnings
    const normalizedEarnings = stock.epsTrailingTwelveMonths * 0.8 // Conservative estimate
    
    // Calculate EPV (assuming a 10% required return)
    const requiredReturn = 0.1
    const epv = normalizedEarnings / requiredReturn
    
    // The EPV is already per share since we used EPS
    const epvPerShare = epv
    
    // Current price should be below EPV per share (indicating undervaluation)
    // Allow for a 10% margin of error
    if (stock.regularMarketPrice >= epvPerShare * 0.9) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Price not below EPV (${stock.regularMarketPrice} >= ${epvPerShare * 0.9})`)
      return false
    }
    
    // Check if the company has a reasonable debt level
    if (stock.totalDebt && stock.totalDebt > stock.marketCap * 0.7) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Debt too high (${stock.totalDebt / stock.marketCap})`)
      return false
    }
    
    // Additional checks using new fields
    
    // Check if the stock has strong growth potential (positive forward EPS)
    // Make this optional - some companies may have negative forward EPS due to reinvestment
    // if (stock.epsForward && stock.epsForward <= 0) return false
    
    // Check if the stock has reasonable valuation metrics
    // Price to book ratio should not be too high (indicating overvaluation)
    if (stock.priceToBook && stock.priceToBook > 5) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Price to book ratio too high (${stock.priceToBook})`)
      return false
    }
    
    // Check if the stock has reasonable analyst ratings (not too negative)
    if (stock.averageAnalystRating && 
        (stock.averageAnalystRating.includes('Sell') || 
         stock.averageAnalystRating.includes('Strong Sell'))) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Negative analyst rating (${stock.averageAnalystRating})`)
      return false
    }
    
    // Check if the stock has reasonable PEG ratio (if available)
    // PEG ratio should be less than 2 (indicating undervaluation relative to growth)
    if (stock.pegRatio && stock.pegRatio > 2) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - PEG ratio too high (${stock.pegRatio})`)
      return false
    }
    
    console.log(`[DEBUG] ${stock.symbol}: PASSED all filters for epv_undervalued`)
    return true
  },
  
  // 3. Residual Income Model (RIM)
  rim_undervalued: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have earnings and book value data
    if (!stock.epsTrailingTwelveMonths || stock.epsTrailingTwelveMonths <= 0) return false
    if (!stock.bookValue || stock.bookValue <= 0) return false
    
    // Must have a reasonable market cap (at least $500M)
    if (!stock.marketCap || stock.marketCap < 500000000) return false
    
    // The bookValue is already per share, so we don't need to divide by sharesOutstanding
    const bookValuePerShare = stock.bookValue
    
    // Calculate return on equity (ROE)
    const roe = stock.epsTrailingTwelveMonths / bookValuePerShare
    
    // Calculate required return (assuming 10% cost of equity)
    const requiredReturn = 0.1
    
    // Calculate residual income
    const residualIncome = stock.epsTrailingTwelveMonths - (bookValuePerShare * requiredReturn)
    
    // Residual income should be positive (indicating undervaluation)
    if (residualIncome <= 0) return false
    
    // Calculate RIM value (book value + present value of residual income)
    // For simplicity, we'll use a 5-year horizon with a 10% discount rate
    const horizon = 5
    const discountRate = 0.1
    const growthRate = 0.05 // Assuming 5% growth in residual income
    
    // Present value of residual income
    let pvResidualIncome = 0
    for (let i = 1; i <= horizon; i++) {
      pvResidualIncome += residualIncome * Math.pow(1 + growthRate, i) / Math.pow(1 + discountRate, i)
    }
    
    // RIM value per share
    const rimValuePerShare = bookValuePerShare + pvResidualIncome
    
    // Current price should be below RIM value per share (indicating undervaluation)
    // Allow for a 10% margin of error
    if (stock.regularMarketPrice >= rimValuePerShare * 0.9) return false
    
    return true
  },
  
  // 4. Relative Valuation (Multiples-Based)
  relative_value: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a reasonable market cap (at least $1B)
    if (!stock.marketCap || stock.marketCap < 1000000000) return false
    
    // Must have positive earnings
    if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths <= 0) return false
    
    // Check P/E ratio (should be below 15)
    if (stock.trailingPE && stock.trailingPE > 15) return false
    
    // Check P/B ratio (should be below 2)
    if (stock.priceToBook && stock.priceToBook > 2) return false
    
    // Check EV/EBITDA if available (should be below 10)
    if (stock.enterpriseToEbitda && stock.enterpriseToEbitda > 10) return false
    
    // Check PEG ratio if available (should be below 1.5)
    if (stock.pegRatio && stock.pegRatio > 1.5) return false
    
    // Check if the company has a reasonable debt level
    if (stock.totalDebt && stock.totalDebt > stock.marketCap * 0.5) return false
    
    return true
  },
  
  // 5. Net Asset Value (NAV) for REITs and BDCs
  nav_undervalued: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a reasonable market cap (at least $100M)
    if (!stock.marketCap || stock.marketCap < 100000000) return false
    
    // Must have book value data
    if (!stock.bookValue || stock.bookValue <= 0) return false
    
    // The bookValue is already per share, so we don't need to divide by sharesOutstanding
    const bookValuePerShare = stock.bookValue
    
    // Current price should be below book value per share (indicating undervaluation)
    // Allow for a 10% margin of error
    if (stock.regularMarketPrice >= bookValuePerShare * 0.9) return false
    
    // Check if the company pays a dividend
    if (!stock.dividendYield || stock.dividendYield <= 0) return false
    
    // Dividend yield should be reasonable (between 2% and 20%)
    if (stock.dividendYield < 2 || stock.dividendYield > 20) return false
    
    // Check if the company has positive earnings
    if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths <= 0) return false
    
    return true
  },
  
  // 6. Gordon Growth Model with Multi-Stage Growth
  gordon_growth: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a dividend yield
    if (!stock.dividendYield || stock.dividendYield <= 0) return false
    
    // Must have a reasonable market cap (at least $1B)
    if (!stock.marketCap || stock.marketCap < 1000000000) return false
    
    // Must have positive earnings
    if (stock.epsTrailingTwelveMonths && stock.epsTrailingTwelveMonths <= 0) return false
    
    // Calculate dividend per share
    const dividendPerShare = stock.regularMarketPrice * stock.dividendYield
    
    // Estimate growth rate (using historical growth if available, otherwise conservative estimate)
    const growthRate = stock.dividendGrowthRate ? Math.min(stock.dividendGrowthRate, 0.1) : 0.05
    
    // Assume a required return of 10%
    const requiredReturn = 0.1
    
    // Calculate value using Gordon Growth Model
    // V = D0 * (1 + g) / (r - g)
    const value = dividendPerShare * (1 + growthRate) / (requiredReturn - growthRate)
    
    // Current price should be below calculated value (indicating undervaluation)
    if (stock.regularMarketPrice >= value) return false
    
    // Check if the company has a reasonable payout ratio (less than 80%)
    if (stock.payoutRatio && stock.payoutRatio > 80) return false
    
    return true
  },
  
  // New screener implementations
  quality_moat: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a reasonable market cap (at least $100M)
    if (!stock.marketCap || stock.marketCap < 100000000) return false
    
    // Must have positive earnings
    if (!stock.epsTrailingTwelveMonths || stock.epsTrailingTwelveMonths <= 0) return false
    
    // Calculate ROE from available data if returnOnEquity is not available
    let roe = stock.returnOnEquity;
    
    // If returnOnEquity is not available, try to calculate it from earnings and book value
    if (!roe && stock.epsTrailingTwelveMonths && stock.bookValue && stock.sharesOutstanding) {
      // ROE = Earnings / Book Value
      // Book Value = bookValue * sharesOutstanding
      const totalBookValue = stock.bookValue * stock.sharesOutstanding;
      if (totalBookValue > 0) {
        roe = (stock.epsTrailingTwelveMonths * stock.sharesOutstanding) / totalBookValue;
        console.log(`[DEBUG] ${stock.symbol}: Calculated ROE from earnings and book value: ${roe}`)
      }
    }
    
    // If we still don't have ROE, use a fallback approach
    if (!roe) {
      // Use profit margins as a proxy for ROE if available
      if (stock.profitMargins && stock.profitMargins > 0.15) {
        roe = 0.15; // Assume at least 15% ROE if profit margins are good
        console.log(`[DEBUG] ${stock.symbol}: Using profit margins as proxy for ROE: ${stock.profitMargins}`)
      } else {
        console.log(`[DEBUG] ${stock.symbol}: Failed - Cannot determine ROE`)
        return false; // Can't determine ROE, so fail the filter
      }
    }
    
    if (roe < 0.15) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Low ROE (${roe})`)
      return false
    }
    
    if (stock.totalDebt && stock.totalStockholderEquity && 
        stock.totalDebt / stock.totalStockholderEquity > 1) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - High debt (${stock.totalDebt / stock.totalStockholderEquity})`)
      return false
    }
    
    if (stock.epsForward && stock.epsTrailingTwelveMonths && 
        stock.epsForward <= stock.epsTrailingTwelveMonths) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - No earnings growth (${stock.epsForward} <= ${stock.epsTrailingTwelveMonths})`)
      return false
    }
    
    if (stock.trailingPE && stock.trailingPE > 25) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - High P/E (${stock.trailingPE})`)
      return false
    }
    
    if (stock.averageAnalystRating && 
        (stock.averageAnalystRating.includes('Sell') || 
         stock.averageAnalystRating.includes('Strong Sell'))) {
      console.log(`[DEBUG] ${stock.symbol}: Failed - Negative analyst rating (${stock.averageAnalystRating})`)
      return false
    }
    
    console.log(`[DEBUG] ${stock.symbol}: PASSED all filters`)
    return true
  },
  
  dividend_growth: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a reasonable market cap (at least $100M)
    if (!stock.marketCap || stock.marketCap < 100000000) return false
    
    // Must have positive earnings
    if (!stock.epsTrailingTwelveMonths || stock.epsTrailingTwelveMonths <= 0) return false
    
    // Must have a dividend yield
    if (!stock.trailingAnnualDividendYield || stock.trailingAnnualDividendYield <= 0) return false
    
    // Dividend yield should be reasonable (between 1% and 6%)
    if (stock.trailingAnnualDividendYield < 0.01 || stock.trailingAnnualDividendYield > 0.06) return false
    
    // Check for reasonable payout ratio (< 75%)
    if (stock.payoutRatio && stock.payoutRatio > 0.75) return false
    
    // Check for earnings growth (forward EPS > trailing EPS)
    if (stock.epsForward && stock.epsTrailingTwelveMonths && 
        stock.epsForward <= stock.epsTrailingTwelveMonths) return false
    
    // Check for reasonable valuation (P/E < 20)
    if (stock.trailingPE && stock.trailingPE > 20) return false
    
    return true
  },
  
  momentum_value: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a reasonable market cap (at least $100M)
    if (!stock.marketCap || stock.marketCap < 100000000) return false
    
    // Must have positive earnings
    if (!stock.epsTrailingTwelveMonths || stock.epsTrailingTwelveMonths <= 0) return false
    
    // Check for positive price momentum (current price > 50-day MA)
    if (stock.fiftyDayAverage && stock.regularMarketPrice <= stock.fiftyDayAverage) return false
    
    // Check for reasonable valuation (P/E < 20)
    if (stock.trailingPE && stock.trailingPE > 20) return false
    
    // Check for reasonable price to book (P/B < 3)
    if (stock.priceToBook && stock.priceToBook > 3) return false
    
    // Check for positive earnings growth (forward EPS > trailing EPS)
    if (stock.epsForward && stock.epsTrailingTwelveMonths && 
        stock.epsForward <= stock.epsTrailingTwelveMonths) return false
    
    // Check for reasonable PEG ratio (< 2)
    if (stock.pegRatio && stock.pegRatio > 2) return false
    
    return true
  },
  
  low_volatility: (stock) => {
    // Must be a common stock
    if (stock.quoteType !== 'EQUITY') return false
    
    // Must have a reasonable market cap (at least $100M)
    if (!stock.marketCap || stock.marketCap < 100000000) return false
    
    // Must have positive earnings
    if (!stock.epsTrailingTwelveMonths || stock.epsTrailingTwelveMonths <= 0) return false
    
    // Check for low beta (< 0.8)
    if (stock.beta && stock.beta > 0.8) return false
    
    // Check for stable earnings (positive forward EPS)
    if (stock.epsForward && stock.epsForward <= 0) return false
    
    // Check for reasonable valuation (P/E < 20)
    if (stock.trailingPE && stock.trailingPE > 20) return false
    
    // Check for reasonable debt levels (debt to equity < 1)
    if (stock.totalDebt && stock.totalStockholderEquity && 
        stock.totalDebt / stock.totalStockholderEquity > 1) return false
    
    // Check for positive analyst ratings
    if (stock.averageAnalystRating && 
        (stock.averageAnalystRating.includes('Sell') || 
         stock.averageAnalystRating.includes('Strong Sell'))) return false
    
    return true
  },
}

// Function to apply custom screener filters to stock data
export function applyCustomScreenerFilter(
  screenerType: CustomScreenerType,
  stocks: any[]
): any[] {
  console.log(`[DEBUG] Applying ${screenerType} filter to ${stocks.length} stocks`)
  
  // For high_margin_tech, log the first few stocks to see their data
  if (screenerType === 'high_margin_tech') {
    console.log(`[DEBUG] Sample of stocks being filtered for high_margin_tech:`)
    const sampleSize = Math.min(5, stocks.length)
    for (let i = 0; i < sampleSize; i++) {
      const stock = stocks[i]
      console.log(`[DEBUG] Stock ${i+1}: ${stock.symbol} - Sector: ${stock.sector}, Industry: ${stock.industry}, Operating Margin: ${stock.operatingMargins}, Profit Margin: ${stock.profitMargins}, P/E: ${stock.trailingPE}`)
    }
  }
  
  const filter = customScreenerFilters[screenerType]
  const filteredStocks = stocks.filter(filter)
  
  console.log(`[DEBUG] After applying ${screenerType} filter: ${filteredStocks.length} stocks passed (${Math.round((filteredStocks.length / stocks.length) * 100)}%)`)
  
  return filteredStocks
}