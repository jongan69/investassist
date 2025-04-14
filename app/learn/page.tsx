import Link from "next/link";
import { 
  ArrowRight, 
  BarChart, 
  BookOpen,
  Coins, 
  Home,
  LineChart,
  Shield,
  TrendingUp,
  Wallet
} from "lucide-react";

const LEARNING_CONTENT = [
  {
    title: "Introduction to Investing",
    description: "Learn the basics of investing and the different types of investments available.",
    content: "Investing is the process of allocating money with the expectation of generating a profit. There are many different types of investments, including stocks, bonds, cryptocurrencies, and real estate. Each type of investment has its own risks and rewards, and it's important to understand the pros and cons of each before making an investment decision."
  },
  {
    title: "Types of Investments",
    description: "Learn about the different types of investments available and their characteristics.",
    content: "Stocks are shares of ownership in a company. Bonds are loans made to a company or government. Cryptocurrencies are digital currencies that use cryptography to secure and verify transactions. Real estate is property that includes land, buildings, and other improvements."
  }
]

const USEFUL_LINKS = [
  {
    title: "Moonshot",
    description: "Moonshot is a platform that allows you to invest in Solana cryptocurrencies.",
    url: "https://moonshot.money?ref=vtsmoh24uf"
  },
  {
    title: "Axiom",
    description: "Axiom is a platform that allows you to trade cryptocurrencies.",
    url: "https://axiom.trade/@jongan69"
  },
  {
    title: "AssetDash",
    description: "AssetDash is a platform that allows you to track your portfolio.",
    url: "https://bit.ly/3dNXbSJ"
  },
  {
    title: "Vector",
    description: "Vector is a platform that allows you to trade meme coins with friends.",
    url: "https://vec.fun/ref/jongan69"
  },
  {
    title: "Wealthfront",
    description: "Wealthfront is a platform that allows you to automate your investments.",
    url: "https://www.wealthfront.com/c/affiliates/invited/AFFA-XM0N-KTWR-LI4O"
  },
  {
    title: "Ourbit",
    description: "Ourbit is a trading platform that allows you to trade cryptocurrencies on multiple chains.",
    url: "https://www.ourbit.com/register?inviteCode=retardio"
  },
  {
    title: "Bags",
    description: "Bags is a platform that allows you to buy and sell solana memecoins with friends.",
    url: "https://bags.fm/$JONGAN69"
  },
  {
    title: "Groundfloor",
    description: "Groundfloor is a platform that allows you to invest in real estate.",
    url: "https://app.groundfloor.us/r/o6d7b4"
  },
  {
    title: "Webull",
    description: "Webull is a platform that allows you to trade stocks, options, and cryptocurrencies.",
    url: "https://a.webull.com/3DbzDujWx1zNAkk2CZ"
  },
  {
    title: "BonkBot",
    description: "BonkBot is a telegram bot that allows you to snipe meme coins.",
    url: "https://t.me/bonkbot_bot?start=ref_jyzn2"
  },
  {
    title: "Public",
    description: "Public is an investing platform where you can invest in stocks, bonds, options, crypto, and more.",
    url: "https://share.public.com/jonngan"
  },
  {
    title: "Fundrise",
    description: "Fundrise offers world-class private market investments like real estate, private credit, and venture.",
    url: "https://fundrise.com/i/g70dlo?utm_source=fundrise&utm_campaign=ios_share"
  },
  {
    title: "SolTrendio Watch App",
    description: "SolTrendio is a watch app that allows you to track the latest trends in the cryptocurrency ecosystem on your Apple Watch.",
    url: "https://apps.apple.com/us/app/soltrendio-trends/id6742119975"
  },
  {
    title: "Kraken",
    description: "Kraken is a platform that allows you to trade cryptocurrencies.",
    url: "https://kraken.onelink.me/JDNW/m6z2wu7k"
  },
  {
    title: "Kamino Finance",
    description: "Kamino Finance is a platform that allows you to multiply your holdings of any token by supplying it to the protocol for lending.",
    url: "https://swap.kamino.finance/?ref=lockin"
  }
]

export default async function LearnPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-48 h-48 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl transform -translate-y-4"></div>
              <div className="w-48 h-48 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl transform translate-x-4"></div>
            </div>
            <h1 className="relative text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Investment Learning Hub
            </h1>
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your comprehensive guide to understanding investments and finding the right platforms for your financial journey.
          </p>
        </div>

        {/* Getting Started Section */}
        <section className="mb-16 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center mb-6">
            <BookOpen className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-semibold dark:text-white">Getting Started with Investing</h2>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-8">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
                {LEARNING_CONTENT[0].content}
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-800">
                <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-300 flex items-center">
                  <Shield className="h-5 w-5 mr-2" />
                  Recommended Platforms for Beginners
                </h3>
                <div className="space-y-3">
                  <Link
                    href={USEFUL_LINKS.find(link => link.title === "Wealthfront")?.url || "#"}
                    className="flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="group-hover:underline">Wealthfront - Automated Investment Management</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={USEFUL_LINKS.find(link => link.title === "Public")?.url || "#"}
                    className="flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="group-hover:underline">Public - All-in-One Investment Platform</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Categories Section */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <BarChart className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-semibold dark:text-white">Investment Categories</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Stocks & Options Card */}
            <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <LineChart className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-xl font-semibold dark:text-white">Stocks & Options</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Start your journey in stock market investing with user-friendly platforms.
                </p>
                <div className="space-y-2">
                  <Link
                    href={USEFUL_LINKS.find(link => link.title === "Webull")?.url || "#"}
                    className="flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="group-hover:underline">Webull - Advanced Stock & Options Trading</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Traditional Cryptocurrency Card */}
            <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Coins className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-xl font-semibold dark:text-white">Traditional Cryptocurrency</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Explore the world of digital assets and cryptocurrency trading.
                </p>
                <div className="space-y-2">
                  <Link
                    href={USEFUL_LINKS.find(link => link.title === "Axiom")?.url || "#"}
                    className="flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="group-hover:underline">Axiom - Advanced Crypto Trading</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <Link
                    href={USEFUL_LINKS.find(link => link.title === "Ourbit")?.url || "#"}
                    className="flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="group-hover:underline">Ourbit - Multi-Chain Trading</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Real Estate Investments Card */}
            <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Home className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-xl font-semibold dark:text-white">Real Estate Investments</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Invest in real estate properties with lower barriers to entry.
                </p>
                <div className="space-y-2">
                  <Link
                    href={USEFUL_LINKS.find(link => link.title === "Groundfloor")?.url || "#"}
                    className="flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="group-hover:underline">Groundfloor - Real Estate Investment Platform</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Portfolio Tracking Card */}
            <div className="group bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <Wallet className="h-5 w-5 mr-2 text-blue-600" />
                  <h3 className="text-xl font-semibold dark:text-white">Portfolio Tracking</h3>
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Keep track of all your investments in one place.
                </p>
                <div className="space-y-2">
                  <Link
                    href={USEFUL_LINKS.find(link => link.title === "AssetDash")?.url || "#"}
                    className="flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="group-hover:underline">AssetDash - Comprehensive Portfolio Tracker</span>
                    <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Meme Coins & Social Trading Section */}
        <section className="mb-16 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center mb-6">
            <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-semibold dark:text-white">Meme Coins & Social Trading</h2>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-pink-500/5 rounded-lg blur-xl"></div>
                <p className="relative text-gray-700 dark:text-gray-300 mb-6">
                  Explore the exciting world of meme coins and social trading platforms. Note: These investments are typically highly volatile and risky.
                </p>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
                    <Coins className="h-5 w-5 mr-2 text-blue-600" />
                    Solana Ecosystem
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href={USEFUL_LINKS.find(link => link.title === "Moonshot")?.url || "#"}
                      className="flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="group-hover:underline">Moonshot - Solana Investment Platform</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-600">
                  <h3 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
                    <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                    Trading Tools
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href={USEFUL_LINKS.find(link => link.title === "BonkBot")?.url || "#"}
                      className="flex items-center text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors group"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="group-hover:underline">BonkBot - Meme Coin Trading Bot</span>
                      <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Investment Best Practices Section */}
        <section className="mb-16 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center mb-6">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-semibold dark:text-white">Investment Best Practices</h2>
          </div>
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-8">
              <ul className="space-y-4">
                {[
                  "Diversify your portfolio across different asset classes",
                  "Start with established platforms before exploring riskier investments",
                  "Never invest more than you can afford to lose",
                  "Research thoroughly before making investment decisions",
                  "Consider using portfolio tracking tools to monitor your investments"
                ].map((practice, index) => (
                  <li key={index} className="flex items-start group">
                    <div className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3 mt-0.5 group-hover:scale-110 transition-transform">
                      <span className="text-white text-sm font-medium">{index + 1}</span>
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{practice}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Stock Screeners Guide Section */}
        <section className="mb-16">
          <div className="flex items-center mb-6">
            <BarChart className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-semibold dark:text-white">Stock Screeners Guide</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6 max-w-3xl">
            Stock screeners help you filter stocks based on specific criteria. Below is a detailed guide to each screener available on InvestAssist, what it means, and when to use it.
          </p>
          
          <div className="grid gap-6">
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                  Basic Screeners
                </h3>
                
                <div className="space-y-6">
                  {[
                    {
                      title: "Low P/E Ratio",
                      meaning: "Identifies stocks with a low price-to-earnings ratio (P/E < 15), indicating they may be undervalued relative to their earnings.",
                      usage: "Best for value investors looking for potentially undervalued stocks. Useful during market downturns or when seeking defensive investments."
                    },
                    {
                      title: "High Margin Tech",
                      meaning: "Finds technology companies with high operating margins (>3%) and reasonable valuations (P/E < 50), indicating strong profitability.",
                      usage: "Ideal for growth investors interested in profitable tech companies. Good for identifying established tech leaders with strong business models."
                    },
                    {
                      title: "Undervalued Midcaps",
                      meaning: "Targets mid-sized companies ($2B-$10B market cap) with low P/E ratios (<20), suggesting they may be undervalued.",
                      usage: "Perfect for investors seeking a balance between growth and value. Midcaps often offer better growth potential than large caps while being less risky than small caps."
                    },
                    {
                      title: "Momentum Leaders",
                      meaning: "Identifies stocks with significant positive price movement (>5% gain) and high trading volume, indicating strong market interest.",
                      usage: "Best for short-term traders or momentum investors. Useful during strong bull markets when you want to capitalize on trending stocks."
                    },
                    {
                      title: "Value Stocks",
                      meaning: "Finds stocks with low P/E ratios (<20) and low price-to-book ratios (<2), classic indicators of value.",
                      usage: "Ideal for value investors or during market downturns. Good for finding potentially undervalued companies with strong fundamentals."
                    },
                    {
                      title: "Growth Stocks",
                      meaning: "Identifies companies with positive earnings growth, reasonable P/E ratios (<30), and PEG ratios less than 2, indicating good growth at a reasonable price.",
                      usage: "Best for growth investors with a longer time horizon. Useful during economic expansions when companies can grow earnings rapidly."
                    },
                    {
                      title: "Income Stocks",
                      meaning: "Finds stocks with dividend yields between 2-20% and reasonable payout ratios (<100%), indicating sustainable income potential.",
                      usage: "Ideal for income-focused investors or retirees. Good for building a portfolio that generates regular cash flow."
                    }
                  ].map((screener, index) => (
                    <div key={index} className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                      <h4 className="font-medium text-lg dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{screener.title}</h4>
                      <div className="space-y-2">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-blue-700 dark:text-blue-400">What it means:</span> {screener.meaning}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-blue-700 dark:text-blue-400">When to use:</span> {screener.usage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                  Advanced Valuation Screeners
                </h3>
                
                <div className="space-y-6">
                  {[
                    {
                      title: "DCF Undervalued",
                      meaning: "Uses discounted cash flow principles to identify stocks trading below their intrinsic value. Looks for high free cash flow yields (>1%) or earnings yields (>2%) relative to price.",
                      usage: "Best for fundamental investors who understand cash flow analysis. Useful for finding companies with strong cash generation that the market may be undervaluing."
                    },
                    {
                      title: "EPV Undervalued",
                      meaning: "Earnings Power Value screener identifies stocks trading below their normalized earnings power. Calculates a conservative estimate of sustainable earnings and compares it to current price.",
                      usage: "Ideal for value investors focused on earnings stability. Good for finding companies with consistent earnings that may be temporarily undervalued."
                    },
                    {
                      title: "RIM Undervalued",
                      meaning: "Residual Income Model screener identifies stocks trading below their book value plus the present value of expected future residual earnings.",
                      usage: "Best for investors who understand accounting and want to focus on companies creating value beyond their cost of capital. Useful for finding companies with strong return on equity."
                    },
                    {
                      title: "Relative Value",
                      meaning: "Compares a stock's valuation multiples (P/E, P/B, EV/EBITDA) to determine if it's undervalued relative to its peers or historical averages.",
                      usage: "Ideal for investors who want to compare companies within the same industry. Good for finding the most attractively valued companies in a sector."
                    },
                    {
                      title: "NAV Undervalued",
                      meaning: "Net Asset Value screener identifies stocks trading below their book value per share, with a focus on dividend-paying companies.",
                      usage: "Best for value investors interested in asset-rich companies. Particularly useful for REITs, financials, and other asset-heavy industries."
                    },
                    {
                      title: "Gordon Growth",
                      meaning: "Uses the Gordon Growth Model to identify dividend stocks trading below their calculated value based on current dividends, expected growth, and required return.",
                      usage: "Ideal for dividend investors looking for stocks with sustainable dividend growth. Good for finding income stocks that may also offer capital appreciation."
                    }
                  ].map((screener, index) => (
                    <div key={index} className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                      <h4 className="font-medium text-lg dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{screener.title}</h4>
                      <div className="space-y-2">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-blue-700 dark:text-blue-400">What it means:</span> {screener.meaning}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-blue-700 dark:text-blue-400">When to use:</span> {screener.usage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
              <div className="p-6 md:p-8">
                <h3 className="text-xl font-semibold mb-6 dark:text-white flex items-center">
                  <BarChart className="h-5 w-5 mr-2 text-blue-600" />
                  Quality & Strategy Screeners
                </h3>
                
                <div className="space-y-6">
                  {[
                    {
                      title: "Quality Moat",
                      meaning: "Identifies companies with sustainable competitive advantages (moats) based on high return on equity (>15%), low debt, and positive earnings growth.",
                      usage: "Best for long-term investors seeking companies with durable competitive advantages. Useful for building a portfolio of high-quality businesses that can compound wealth over time."
                    },
                    {
                      title: "Dividend Growth",
                      meaning: "Finds companies with moderate dividend yields (1-6%), reasonable payout ratios (<75%), and positive earnings growth, indicating potential for dividend increases.",
                      usage: "Ideal for income investors focused on dividend growth rather than high current yields. Good for building a portfolio of companies that can increase dividends over time."
                    },
                    {
                      title: "Momentum Value",
                      meaning: "Combines momentum (price above 50-day moving average) with value metrics (low P/E and P/B ratios) to find stocks with positive price trends and reasonable valuations.",
                      usage: "Best for investors who want to capture upward price trends while avoiding overvalued stocks. Useful during market recoveries or when seeking a balance between growth and value."
                    },
                    {
                      title: "Low Volatility",
                      meaning: "Identifies stocks with low beta (<0.8), stable earnings, reasonable valuations, and low debt levels, indicating lower price volatility.",
                      usage: "Ideal for risk-averse investors or those nearing retirement. Good for building a more stable portfolio that may experience less dramatic price swings."
                    }
                  ].map((screener, index) => (
                    <div key={index} className="group bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300">
                      <h4 className="font-medium text-lg dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{screener.title}</h4>
                      <div className="space-y-2">
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-blue-700 dark:text-blue-400">What it means:</span> {screener.meaning}
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-blue-700 dark:text-blue-400">When to use:</span> {screener.usage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* DeFi Protocols Section */}
        <section className="mb-16 transform hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center mb-6">
            <Coins className="h-6 w-6 mr-2 text-blue-600" />
            <h2 className="text-2xl font-semibold dark:text-white">DeFi Protocols</h2>
          </div>
          
          <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg blur-xl"></div>
                <h3 className="relative text-xl font-semibold mb-6 dark:text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                  Kamino Finance
                </h3>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-600">
                  <h4 className="font-medium text-lg dark:text-white mb-3">Overview</h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    Kamino Finance is a leading DeFi protocol on Solana that offers automated market making and liquidity provision services.
                  </p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-600">
                  <h4 className="font-medium text-lg dark:text-white mb-3">Key Features</h4>
                  <ul className="space-y-3">
                    {[
                      "Automated market making with advanced algorithms",
                      "Efficient liquidity provision for trading pairs",
                      "Yield farming opportunities for liquidity providers",
                      "Integration with major Solana DeFi protocols"
                    ].map((feature, index) => (
                      <li key={index} className="flex items-start group">
                        <ArrowRight className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5 group-hover:translate-x-1 transition-transform" />
                        <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-lg p-6 border border-gray-100 dark:border-gray-600">
                  <h4 className="font-medium text-lg dark:text-white mb-3">Getting Started</h4>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    To begin using Kamino Finance:
                  </p>
                  <ol className="space-y-3">
                    {[
                      "Connect your Solana wallet",
                      "Select a trading pair or liquidity pool",
                      "Provide liquidity or start trading",
                      "Monitor your positions and earnings"
                    ].map((step, index) => (
                      <li key={index} className="flex items-start group">
                        <span className="flex-shrink-0 h-6 w-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                          <span className="text-white text-sm font-medium">{index + 1}</span>
                        </span>
                        <span className="text-gray-700 dark:text-gray-300 pt-1">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl shadow-lg border border-blue-100 dark:border-blue-800 overflow-hidden transform hover:scale-[1.01] transition-all duration-300">
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center">
                <ArrowRight className="h-5 w-5 mr-2 text-blue-600" />
                Ready to Start Investing?
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-6">
                Choose the investment platform that best suits your needs and begin your investment journey today. Remember to always do your own research and consider consulting with financial advisors for personalized advice.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold transition-all duration-300 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105"
              >
                Learn More About InvestAssist
                <ArrowRight className="h-5 w-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}