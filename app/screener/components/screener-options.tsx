import { PredefinedScreenerModules } from "@/types/yahoo-finance"
import { CustomScreenerType } from "@/lib/yahoo-finance/customScreeners"

type ScreenerOption = {
  label: string
  value: PredefinedScreenerModules | CustomScreenerType
  group: string
}

export const ScreenerOptions: ScreenerOption[] = [
  // Standard Screeners
  { label: "Most Actives", value: "most_actives", group: "Standard" },
  { label: "Day Gainers", value: "day_gainers", group: "Standard" },
  { label: "Day Losers", value: "day_losers", group: "Standard" },
  { label: "Growth Technology Stocks", value: "growth_technology_stocks", group: "Standard" },
  { label: "The Most Shorted Stocks", value: "most_shorted_stocks", group: "Standard" },
  { label: "Undervalued Growth Stocks", value: "undervalued_growth_stocks", group: "Standard" },
  { label: "Aggressive Small Caps", value: "aggressive_small_caps", group: "Standard" },
  { label: "Conservative Foreign Funds", value: "conservative_foreign_funds", group: "Standard" },
  { label: "High Yield Bond", value: "high_yield_bond", group: "Standard" },
  { label: "Portfolio Anchors", value: "portfolio_anchors", group: "Standard" },
  { label: "Small Cap Gainers", value: "small_cap_gainers", group: "Standard" },
  { label: "Solid Large Growth Funds", value: "solid_large_growth_funds", group: "Standard" },
  { label: "Solid Midcap Growth Funds", value: "solid_midcap_growth_funds", group: "Standard" },
  { label: "Top Mutual Funds", value: "top_mutual_funds", group: "Standard" },
  { label: "Undervalued Large Caps", value: "undervalued_large_caps", group: "Standard" },
  
  // Custom Screeners
  { label: "Low P/E Ratio Stocks", value: "low_pe_ratio", group: "Custom" },
  { label: "High Margin Tech Stocks", value: "high_margin_tech", group: "Custom" },
  { label: "Undervalued Midcaps", value: "undervalued_midcaps", group: "Custom" },
  { label: "Momentum Leaders", value: "momentum_leaders", group: "Custom" },
  { label: "Value Stocks", value: "value_stocks", group: "Custom" },
  { label: "Growth Stocks", value: "growth_stocks", group: "Custom" },
  { label: "Income Stocks", value: "income_stocks", group: "Custom" },
  
  // Valuation-Based Screeners
  { label: "DCF Undervalued", value: "dcf_undervalued", group: "Valuation Models" },
  { label: "EPV Undervalued", value: "epv_undervalued", group: "Valuation Models" },
  { label: "RIM Undervalued", value: "rim_undervalued", group: "Valuation Models" },
  { label: "Relative Value", value: "relative_value", group: "Valuation Models" },
  { label: "NAV Undervalued", value: "nav_undervalued", group: "Valuation Models" },
  { label: "Gordon Growth", value: "gordon_growth", group: "Valuation Models" },
  
  // Quality and Strategy Screeners
  { label: "Quality Moat", value: "quality_moat", group: "Quality & Strategy" },
  { label: "Dividend Growth", value: "dividend_growth", group: "Quality & Strategy" },
  { label: "Momentum Value", value: "momentum_value", group: "Quality & Strategy" },
  { label: "Low Volatility", value: "low_volatility", group: "Quality & Strategy" },
]
