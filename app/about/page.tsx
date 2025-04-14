import { Suspense } from "react";
import Leaderboard from "@/components/ui/leaderboard";
import { INVEST_ASSIST_MINT, MOONSHOT_LINK } from "@/lib/solana/constants";
import TradingStats from './components/TradingStats';
import ParallaxHeader from './components/ParallaxHeader';
import BackToTopButton from './components/BackToTopButton';
import LearnMoreButton from './components/LearnMoreButton';
// import { useWallet } from "@solana/wallet-adapter-react";
// import { Pair, TokenInfo } from "@/types/dexscreener";

export const dynamic = 'force-dynamic';

// Mock environment variables for demonstration
// const INSTAGRAM_ACCOUNT = process.env.INSTAGRAM_ACCOUNT || 'investassist';
// const TIKTOK_ACCOUNT = process.env.TIKTOK_ACCOUNT || 'investassist';
const URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function getTokenInfo() {
  try {
    const response = await fetch(`${URL}/api/info`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching token info:', error);
    return { pairs: [] };
  }
}

export default async function AboutPage() {
  const tokenInfo = await getTokenInfo();
  // const { publicKey } = useWallet();
  // console.log(tokenInfo)
  // Get the pair with highest liquidity, with fallback for empty data
  const mainPair = tokenInfo.pairs && tokenInfo.pairs.length > 0
    ? tokenInfo.pairs.reduce((max: any, pair: any) => {
      // Skip pairs without liquidity data
      if (!pair.liquidity?.usd) return max;
      if (!max.liquidity?.usd) return pair;
      return pair.liquidity.usd > max.liquidity.usd ? pair : max;
    }, tokenInfo.pairs[0])
    : null;

  // Get social links from the main pair
  const socialLinks = mainPair?.info?.socials || [];

  // If we don't have main pair data, show a loading state
  if (!mainPair || !mainPair.liquidity?.usd) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-amber-500">
            Loading...
          </h1>
        </div>
      </div>
    );
  }

  // Get holder information
  const holderCount = tokenInfo.pair?.[0]?.holders?.count || 0;
  const totalSupply = tokenInfo.pair?.[0]?.holders?.totalSupply || '0';
  const topHolders = tokenInfo.pair?.[0]?.holders?.holders.slice(0, 5) || [];
  const createdAt = tokenInfo.pair?.[0]?.ti?.createdAt ? new Date(tokenInfo.pair[0].ti.createdAt).toLocaleDateString() : '';
  const headerImage = tokenInfo.pair?.[0]?.ti?.headerImage;

  // Create a properly formatted tokenInfo object for the ParallaxHeader
  const formattedTokenInfo = {
    ...tokenInfo,
    price: mainPair?.priceUsd ? parseFloat(mainPair.priceUsd) : 0,
    priceChange24h: mainPair?.priceChange?.h24 || 0,
    marketCap: mainPair?.marketCap || 0,
    volume24h: mainPair?.volume?.h24 || 0
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header Section with fixed height */}
      <div className="relative h-[500px] sm:h-[600px]">
        <ParallaxHeader
          imageUrl={headerImage}
          tokenInfo={formattedTokenInfo}
          mainPair={mainPair}
          contractAddress={INVEST_ASSIST_MINT}
          moonshotLink={MOONSHOT_LINK}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col space-y-24 bg-white dark:bg-gray-900">
        {/* About Section */}
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 sm:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full transform translate-x-32 -translate-y-32" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-transparent bg-clip-text">
                    About InvestAssist
                  </h2>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                    InvestAssist is a revolutionary platform that empowers investors with real-time market data and insights.
                    Our mission is to make investing more accessible and informed through cutting-edge technology and comprehensive market analysis.
                  </p>
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                    With InvestAssist, you can track market trends, analyze investment opportunities, and make data-driven decisions
                    to optimize your portfolio performance.
                  </p>
                  <a 
                    href={MOONSHOT_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Invest Now
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-48 h-48 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl shadow-lg p-6 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-300">
                    <svg className="w-32 h-32 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trading Stats Section */}
        <div className="container mx-auto px-4">
          <TradingStats data={tokenInfo} />
        </div>

        {/* Use Cases Section */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Use Cases</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Market Analysis</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Get real-time market data and trends to make informed investment decisions.
              </p>
              <a href="/" className="text-blue-600 dark:text-blue-400 font-medium hover:underline inline-flex items-center">
                Learn More
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Portfolio Tracking</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Monitor your investments and track performance across different assets.
              </p>
              <LearnMoreButton 
                color="text-green-600 dark:text-green-400" 
              />
            </div>
            <div className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Investment Insights</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Access AI-powered insights and recommendations for your investment strategy.
              </p>
              <a href="/insights" className="text-purple-600 dark:text-purple-400 font-medium hover:underline inline-flex items-center">
                Learn More
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-bold mb-8 text-center">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-Time Data</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Access up-to-date market information and price data for informed decision-making.
              </p>
              <a href="/" className="text-orange-600 dark:text-orange-400 font-medium hover:underline inline-flex items-center">
                Try Now
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
            <div className="group bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-4">AI-Powered Analysis</h3>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Leverage advanced AI algorithms for market trend analysis and predictions.
              </p>
              <a href="/insights" className="text-red-600 dark:text-red-400 font-medium hover:underline inline-flex items-center">
                Try Now
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="container mx-auto px-4 py-24 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Token Statistics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="relative">
                  <h3 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white relative break-words">
                    {holderCount.toLocaleString()}+
                  </h3>
                </div>
                <p className="text-xl mt-4 text-gray-700 dark:text-gray-200">Token Holders</p>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-4">Growing community! 👥</p>
              </div>

              <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="relative">
                  <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white relative break-words">
                    {parseInt(totalSupply).toLocaleString()}
                  </h3>
                </div>
                <p className="text-xl mt-4 text-gray-700 dark:text-gray-200">Total Supply</p>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-4">Fixed supply! 💎</p>
              </div>

              <div className="group bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="relative">
                  <h3 className="text-3xl sm:text-5xl font-bold text-gray-900 dark:text-white relative break-words">
                    {createdAt || 'N/A'}
                  </h3>
                </div>
                <p className="text-xl mt-4 text-gray-700 dark:text-gray-200">Launch Date</p>
                <p className="text-base text-gray-600 dark:text-gray-300 mt-4">Established! 🚀</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Holders Section */}
        {topHolders.length > 0 && (
          <div className="container mx-auto px-4 py-24 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                Top Holders
              </h2>
              <div className="bg-white dark:bg-gray-700 rounded-xl shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rank
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Address
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Balance
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        % of Supply
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-700 divide-y divide-gray-200 dark:divide-gray-600">
                    {topHolders?.map((holder: any, index: number) => (
                      <tr key={holder.id} className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {holder.id.substring(0, 6)}...{holder.id.substring(holder.id.length - 4)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {parseInt(holder.balance).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                          {holder.percentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Social Links Section */}
        {socialLinks.length > 0 && (
          <div className="container mx-auto px-4 py-24 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="max-w-5xl mx-auto text-center">
              <h2 className="text-3xl sm:text-5xl font-bold mb-12 text-gray-900 dark:text-white">
                Connect With Us
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {socialLinks?.map((link: { type: string; url: string }) => (
                  <a
                    key={link.type}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    {link.type.charAt(0).toUpperCase() + link.type.slice(1)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard Section */}
        <div className="container mx-auto px-4 py-24 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl sm:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
              Top Investors
            </h2>
            <Suspense fallback={<div className="text-center py-12">Loading leaderboard...</div>}>
              <Leaderboard />
            </Suspense>
          </div>
        </div>

        {/* Join Us Section */}
        <div className="container mx-auto px-4 py-24 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-8 text-gray-900 dark:text-white">
              Join Us
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-12 max-w-2xl mx-auto text-lg leading-relaxed">
              Join thousands of investors who trust InvestAssist to guide their investment journey. Sign up today and take control of your financial future with confidence.
            </p>
            <a 
              href={MOONSHOT_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-bold text-lg hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <BackToTopButton />
    </div>
  );
}