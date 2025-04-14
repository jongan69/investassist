import { fetchScreenerStocks } from "./fetchScreenerStocks"
import { CustomScreenerType, customScreenerSources, applyCustomScreenerFilter } from "./customScreeners"
import { PredefinedScreenerModules } from "@/types/yahoo-finance"

// Define the result type for custom screeners
export interface CustomScreenerResult {
  quotes: any[];
  total: number;
  count: number;
  meta: {
    screenerType: CustomScreenerType;
    sourceScreeners: string[];
    filteredCount: number;
    totalCount: number;
  };
  screenerName: string;
  screenerDescription: string;
}

// List of valid predefined screener modules
const VALID_SCREENER_MODULES: PredefinedScreenerModules[] = [
  "aggressive_small_caps",
  "conservative_foreign_funds",
  "day_gainers",
  "day_losers",
  "growth_technology_stocks",
  "high_yield_bond",
  "most_actives",
  "most_shorted_stocks",
  "portfolio_anchors",
  "small_cap_gainers",
  "solid_large_growth_funds",
  "solid_midcap_growth_funds",
  "top_mutual_funds",
  "undervalued_growth_stocks",
  "undervalued_large_caps"
]

// Function to fetch stocks from custom screeners
export async function fetchCustomScreenerStocks(
  screenerType: CustomScreenerType
): Promise<CustomScreenerResult> {
  console.log(`[DEBUG] Starting fetch for custom screener: ${screenerType}`)
  
  // Get the source screeners for this custom screener
  const sourceScreeners = customScreenerSources[screenerType]
  console.log(`[DEBUG] Using source screeners: ${sourceScreeners.join(', ')}`)
  
  // Fetch stocks from each source screener
  const allStocks: any[] = []
  
  for (const sourceScreener of sourceScreeners) {
    try {
      // Check if the source screener is a valid PredefinedScreenerModules type
      if (!VALID_SCREENER_MODULES.includes(sourceScreener as PredefinedScreenerModules)) {
        console.log(`[DEBUG] Skipping invalid source screener: ${sourceScreener}`)
        continue
      }
      
      console.log(`[DEBUG] Fetching stocks from source screener: ${sourceScreener}`)
      const screenerData = await fetchScreenerStocks(sourceScreener)
      
      if (screenerData && screenerData.quotes) {
        console.log(`[DEBUG] Received ${screenerData.quotes.length} stocks from ${sourceScreener}`)
        
        // For high_margin_tech, log some sample data from each source
        if (screenerType === 'high_margin_tech' && screenerData.quotes.length > 0) {
          const sampleSize = Math.min(3, screenerData.quotes.length)
          console.log(`[DEBUG] Sample data from ${sourceScreener}:`)
          for (let i = 0; i < sampleSize; i++) {
            const stock = screenerData.quotes[i] as any
            console.log(`[DEBUG] ${stock.symbol} - Sector: ${stock.sector}, Industry: ${stock.industry}, Operating Margin: ${stock.operatingMargins}, Profit Margin: ${stock.profitMargins}`)
          }
        }
        
        allStocks.push(...screenerData.quotes)
      } else {
        console.log(`[DEBUG] No stocks received from ${sourceScreener}`)
      }
    } catch (error) {
      console.error(`Error fetching stocks from ${sourceScreener}:`, error)
    }
  }
  
  // Remove duplicates based on symbol
  const uniqueStocks = allStocks.filter((stock, index, self) =>
    index === self.findIndex((s) => s.symbol === stock.symbol)
  )
  
  console.log(`[DEBUG] Unique stocks before filtering: ${uniqueStocks.length}`)
  
  // For high_margin_tech, log detailed information about the stocks
  if (screenerType === 'high_margin_tech') {
    console.log(`[DEBUG] Detailed analysis of stocks for high_margin_tech:`)
    
    // Count stocks by sector
    const sectorCounts: Record<string, number> = {}
    uniqueStocks.forEach(stock => {
      const stockAny = stock as any
      const sector = stockAny.sector || 'Unknown'
      sectorCounts[sector] = (sectorCounts[sector] || 0) + 1
    })
    console.log(`[DEBUG] Stocks by sector:`, sectorCounts)
    
    // Count stocks with tech-related industries
    const techIndustryCount = uniqueStocks.filter(stock => {
      const stockAny = stock as any
      if (!stockAny.industry) return false
      const industry = stockAny.industry.toLowerCase()
      return industry.includes('software') || 
             industry.includes('semiconductor') || 
             industry.includes('internet') ||
             industry.includes('hardware') ||
             industry.includes('electronics') ||
             industry.includes('telecommunications') ||
             industry.includes('information') ||
             industry.includes('computer') ||
             industry.includes('digital') ||
             industry.includes('data') ||
             industry.includes('cloud') ||
             industry.includes('ai') ||
             industry.includes('robotics') ||
             industry.includes('cyber') ||
             industry.includes('tech') ||
             industry.includes('media') ||
             industry.includes('entertainment') ||
             industry.includes('communication') ||
             industry.includes('network') ||
             industry.includes('platform') ||
             industry.includes('service') ||
             industry.includes('solution') ||
             industry.includes('e-commerce') ||
             industry.includes('fintech') ||
             industry.includes('biotech') ||
             industry.includes('healthcare technology') ||
             industry.includes('automation') ||
             industry.includes('mobile') ||
             industry.includes('app') ||
             industry.includes('gaming') ||
             industry.includes('virtual reality') ||
             industry.includes('augmented reality') ||
             industry.includes('blockchain') ||
             industry.includes('cryptocurrency')
    }).length
    console.log(`[DEBUG] Stocks with tech-related industries: ${techIndustryCount}`)
    
    // Count stocks with high margins
    const highMarginCount = uniqueStocks.filter(stock => {
      const stockAny = stock as any
      return (stockAny.operatingMargins && stockAny.operatingMargins > 0.03) || 
             (stockAny.profitMargins && stockAny.profitMargins > 0.03)
    }).length
    console.log(`[DEBUG] Stocks with high margins (>3%): ${highMarginCount}`)
    
    // Count stocks with reasonable P/E
    const reasonablePECount = uniqueStocks.filter(stock => {
      const stockAny = stock as any
      return !stockAny.trailingPE || stockAny.trailingPE <= 50
    }).length
    console.log(`[DEBUG] Stocks with reasonable P/E (<=50): ${reasonablePECount}`)
  }
  
  // Apply the custom screener filter
  const filteredStocks = applyCustomScreenerFilter(screenerType, uniqueStocks)
  
  console.log(`[DEBUG] Stocks after filtering: ${filteredStocks.length}`)
  
  // If no stocks pass the filter, try additional source screeners
  if (filteredStocks.length === 0) {
    console.log(`[DEBUG] No stocks passed the filter, trying additional source screeners`)
    
    // Additional source screeners to try
    const additionalSourceScreeners = [
      "undervalued_large_caps",
      "undervalued_growth_stocks",
      "solid_large_growth_funds",
      "portfolio_anchors"
    ]
    
    // Filter out source screeners that are already used
    const newSourceScreeners = additionalSourceScreeners.filter(
      (screener) => !sourceScreeners.includes(screener)
    )
    
    console.log(`[DEBUG] Trying additional source screeners: ${newSourceScreeners.join(', ')}`)
    
    // Fetch stocks from additional source screeners
    const additionalStocks: any[] = []
    
    for (const sourceScreener of newSourceScreeners) {
      try {
        console.log(`[DEBUG] Fetching stocks from additional source screener: ${sourceScreener}`)
        const screenerData = await fetchScreenerStocks(sourceScreener)
        
        if (screenerData && screenerData.quotes) {
          console.log(`[DEBUG] Received ${screenerData.quotes.length} stocks from ${sourceScreener}`)
          
          // For high_margin_tech, log some sample data from each additional source
          if (screenerType === 'high_margin_tech' && screenerData.quotes.length > 0) {
            const sampleSize = Math.min(3, screenerData.quotes.length)
            console.log(`[DEBUG] Sample data from additional source ${sourceScreener}:`)
            for (let i = 0; i < sampleSize; i++) {
              const stock = screenerData.quotes[i] as any
              console.log(`[DEBUG] ${stock.symbol} - Sector: ${stock.sector}, Industry: ${stock.industry}, Operating Margin: ${stock.operatingMargins}, Profit Margin: ${stock.profitMargins}`)
            }
          }
          
          additionalStocks.push(...screenerData.quotes)
        } else {
          console.log(`[DEBUG] No stocks received from ${sourceScreener}`)
        }
      } catch (error) {
        console.error(`Error fetching stocks from ${sourceScreener}:`, error)
      }
    }
    
    // Remove duplicates from additional stocks
    const uniqueAdditionalStocks = additionalStocks.filter((stock, index, self) =>
      index === self.findIndex((s) => s.symbol === stock.symbol)
    )
    
    console.log(`[DEBUG] Unique additional stocks before filtering: ${uniqueAdditionalStocks.length}`)
    
    // Apply the custom screener filter to additional stocks
    const filteredAdditionalStocks = applyCustomScreenerFilter(screenerType, uniqueAdditionalStocks)
    
    console.log(`[DEBUG] Additional stocks after filtering: ${filteredAdditionalStocks.length}`)
    
    // Combine the results
    const combinedStocks = [...filteredStocks, ...filteredAdditionalStocks]
    
    // Remove duplicates from combined stocks
    const uniqueCombinedStocks = combinedStocks.filter((stock, index, self) =>
      index === self.findIndex((s) => s.symbol === stock.symbol)
    )
    
    console.log(`[DEBUG] Unique combined stocks: ${uniqueCombinedStocks.length}`)
    
    return {
      quotes: uniqueCombinedStocks,
      total: uniqueCombinedStocks.length,
      count: uniqueCombinedStocks.length,
      meta: {
        screenerType,
        sourceScreeners: [...sourceScreeners, ...newSourceScreeners],
        filteredCount: uniqueCombinedStocks.length,
        totalCount: uniqueStocks.length
      },
      screenerName: screenerType,
      screenerDescription: screenerType
    }
  }
  
  return {
    quotes: filteredStocks,
    total: filteredStocks.length,
    count: filteredStocks.length,
    meta: {
      screenerType,
      sourceScreeners,
      filteredCount: filteredStocks.length,
      totalCount: uniqueStocks.length
    },
    screenerName: screenerType,
    screenerDescription: screenerType
  }
} 