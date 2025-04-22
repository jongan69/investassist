'use client';

import { useEffect, useState } from 'react';
import { INVEST_ASSIST_MINT, MOONSHOT_LINK } from "@/lib/utils/constants";
import TradingStats from './TradingStats';
import ParallaxHeader from './ParallaxHeader';
import BackToTopButton from './BackToTopButton';
import LearnMoreButton from './LearnMoreButton';
import LoadingSpinner from './LoadingSpinner';

// Default placeholder data to use when API fails
const defaultTokenInfo = {
  pairs: [],
  pair: [{
    holders: {
      count: 0,
      totalSupply: '0',
      holders: []
    },
    ti: {
      createdAt: new Date().toLocaleDateString(),
      headerImage: './banner.png'
    }
  }],
  ti: null,
  holders: null,
  lpHolders: null
};

async function getTokenInfo() {
  try {
    // Create an AbortController for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(`/api/info`, { 
      cache: 'no-store',
      signal: controller.signal
    });
    
    // Clear the timeout
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    // Ensure we always return a consistent structure
    return {
      pairs: data.pairs || [],
      pair: data.pair || [],
      ti: data.ti || null,
      holders: data.holders || null,
      lpHolders: data.lpHolders || null
    };
  } catch (error) {
    console.error('Error fetching token info:', error);
    // Return default data structure on error
    return defaultTokenInfo;
  }
}

export default function AboutContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [tokenInfo, setTokenInfo] = useState<any>(defaultTokenInfo);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getTokenInfo();
        setTokenInfo(data);
        
        // Check if we have valid data
        if (!data || !data.pairs || data.pairs.length === 0) {
          setError('No market data available');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch market data');
        // Use default data on error
        setTokenInfo(defaultTokenInfo);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading spinner while fetching data
  if (isLoading) {
    return <LoadingSpinner />;
  }

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

  // Get holder information
  const holderCount = tokenInfo.pair?.[0]?.holders?.count || 0;
  const totalSupply = tokenInfo.pair?.[0]?.holders?.totalSupply || '0';
  const topHolders = tokenInfo.pair?.[0]?.holders?.holders?.slice(0, 5) || [];
  const createdAt = tokenInfo.pair?.[0]?.ti?.createdAt ? new Date(tokenInfo.pair[0].ti.createdAt).toLocaleDateString() : '';
  const headerImage = tokenInfo.pair?.[0]?.ti?.headerImage ?? '/banner.jpg';

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
          tokenInfo={formattedTokenInfo || {}}
          contractAddress={INVEST_ASSIST_MINT}
          moonshotLink={MOONSHOT_LINK}
        />
      </div>

      {/* Main Content */}
      <div className="flex flex-col space-y-24 bg-white dark:bg-gray-900">
        {/* About Section */}
        <div className="container mx-auto px-4 py-24">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-8 sm:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full transform translate-x-32 -translate-y-32" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start gap-8">
                <div className="flex-1">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 text-black dark:text-white bg-clip-text">
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
              <a href="/" className="text-purple-600 dark:text-purple-400 font-medium hover:underline inline-flex items-center">
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
              <a href="/" className="text-red-600 dark:text-red-400 font-medium hover:underline inline-flex items-center">
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
          <div className="max-w-screen-2xl mx-auto">
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
            <div className="max-w-screen-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-bold text-center mb-12 text-gray-900 dark:text-white">
                Top Holders
              </h2>
              
              {/* Mobile View - Card Layout */}
              <div className="block md:hidden">
                <div className="space-y-4">
                  {topHolders?.map((holder: any, index: number) => (
                    <a 
                      key={holder.id} 
                      href={`https://solscan.io/account/${holder.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block bg-white dark:bg-gray-700 rounded-lg shadow-md p-4 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Rank</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">#{index + 1}</span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Address</span>
                        <span className="text-sm text-gray-900 dark:text-white font-mono">
                          {holder.id.substring(0, 4)}...{holder.id.substring(holder.id.length - 4)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">Balance</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {parseInt(holder.balance).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-300">% of Supply</span>
                        <span className="text-sm text-gray-900 dark:text-white">
                          {holder.percentage.toFixed(2)}%
                        </span>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              
              {/* Desktop View - Table Layout */}
              <div className="hidden md:block overflow-x-auto">
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
                        <tr 
                          key={holder.id} 
                          className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 cursor-pointer"
                          onClick={() => window.open(`https://solscan.io/account/${holder.id}`, '_blank')}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            #{index + 1}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300 font-mono">
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
          </div>
        )}

        {/* Social Links Section */}
        {socialLinks.length > 0 && (
          <div className="container mx-auto px-4 py-24 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg">
            <div className="max-w-screen-2xl mx-auto text-center">
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

        {/* Join Us Section */}
        <div className="container mx-auto px-4 py-24 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl shadow-lg">
          <div className="max-w-screen-2xl mx-auto text-center">
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