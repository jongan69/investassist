#!/usr/bin/env node

/**
 * Comprehensive API Route Testing Script
 * Tests all API routes in the InvestAssist application
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// Test results storage
const results = {
  passed: [],
  failed: [],
  skipped: [],
  errors: []
};

// Helper function to make requests
async function testRoute(method, path, body = null, description = '') {
  const url = `${BASE_URL}${path}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const startTime = Date.now();
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;
    const contentType = response.headers.get('content-type');
    
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const result = {
      method,
      path,
      status: response.status,
      duration,
      description,
      success: response.ok,
      hasData: !!data
    };

    if (response.ok) {
      results.passed.push(result);
      console.log(`✅ ${method} ${path} - ${response.status} (${duration}ms)`);
    } else {
      results.failed.push({ ...result, error: data });
      console.log(`❌ ${method} ${path} - ${response.status} (${duration}ms)`);
      if (data && typeof data === 'object' && data.error) {
        console.log(`   Error: ${data.error}`);
      }
    }

    return result;
  } catch (error) {
    const result = {
      method,
      path,
      error: error.message,
      description
    };
    results.failed.push(result);
    results.errors.push({ path, error: error.message });
    console.log(`❌ ${method} ${path} - ERROR: ${error.message}`);
    return null;
  }
}

// Test all routes
async function runTests() {
  console.log(`\n🧪 Testing API Routes at ${BASE_URL}\n`);
  console.log('='.repeat(60));

  // GET Routes
  console.log('\n📋 Testing GET Routes...\n');
  
  await testRoute('GET', '/api/info', null, 'Token info endpoint');
  await testRoute('GET', '/api/calendar', null, 'Calendar events');
  await testRoute('GET', '/api/axiom-pulse', null, 'Axiom pulse data');
  await testRoute('GET', '/api/combinedTrending', null, 'Combined trending data');
  await testRoute('GET', '/api/crypto-trends', null, 'Crypto trends');
  await testRoute('GET', '/api/fomc/latest', null, 'FOMC latest data');
  await testRoute('GET', '/api/finviz/futures', null, 'Finviz futures');
  await testRoute('GET', '/api/finviz/highestvolume', null, 'Finviz highest volume');
  await testRoute('GET', '/api/finviz/insider', null, 'Finviz insider trading');
  await testRoute('GET', '/api/finviz/opportunities', null, 'Finviz opportunities');
  await testRoute('GET', '/api/jupiter-tokens', null, 'Jupiter tokens');
  await testRoute('GET', '/api/launchlab', null, 'Launchlab data');
  await testRoute('GET', '/api/pumpfun/metas', null, 'Pumpfun metas');
  await testRoute('GET', '/api/realestate/market-trends', null, 'Real estate trends');
  await testRoute('GET', '/api/sector-performance', null, 'Sector performance');
  await testRoute('GET', '/api/tickers', null, 'Tickers list');
  await testRoute('GET', '/api/tiktok/trending', null, 'TikTok trending');
  await testRoute('GET', '/api/truthsocial/trump', null, 'Truth Social Trump posts');
  await testRoute('GET', '/api/twitter/twitter-trending', null, 'Twitter trending');
  await testRoute('GET', '/api/twitter/latest-tweets', null, 'Twitter latest tweets');
  await testRoute('GET', '/api/twitter/twitter-cas', null, 'Twitter CAS');
  await testRoute('GET', '/api/stonksjs/combined', null, 'StonksJS combined');
  await testRoute('GET', '/api/stonksjs/finviz', null, 'StonksJS finviz');
  await testRoute('GET', '/api/stonksjs/quote', null, 'StonksJS quote');
  await testRoute('GET', '/api/stonksjs/screeners', null, 'StonksJS screeners');
  await testRoute('GET', '/api/options/recomendations', null, 'Options recommendations');
  await testRoute('GET', '/api/alpaca/get-latest-news', null, 'Alpaca latest news');
  await testRoute('GET', '/api/helio/get-currencies', null, 'Helio currencies');
  await testRoute('GET', '/api/revshare', null, 'Revshare data');
  await testRoute('GET', '/api/nfts', null, 'NFTs data');
  await testRoute('GET', '/api/boxoffice', null, 'Box office data');
  await testRoute('GET', '/api/automotive', null, 'Automotive data');
  await testRoute('GET', '/api/d3ai', null, 'D3AI data');
  await testRoute('GET', '/api/soltrendio/free-access', null, 'SolTrendio free access');

  // POST Routes
  console.log('\n📋 Testing POST Routes...\n');

  await testRoute('POST', '/api/price', { outputMint: 'So11111111111111111111111111111111111111112' }, 'Token price');
  await testRoute('POST', '/api/database/get-profile', { username: 'test' }, 'Get profile');
  await testRoute('POST', '/api/database/get-leaderboard', {}, 'Get leaderboard');
  await testRoute('POST', '/api/database/get-pnl', { walletAddress: 'test123' }, 'Get PNL');
  await testRoute('POST', '/api/database/search-users', { query: 'test' }, 'Search users');
  await testRoute('POST', '/api/database/create-profile', { username: 'test', walletAddress: 'test123' }, 'Create profile');
  await testRoute('POST', '/api/database/save-user', { username: 'test', walletAddress: 'test123' }, 'Save user');
  await testRoute('POST', '/api/database/save-investment-plan', { plan: {} }, 'Save investment plan');
  await testRoute('POST', '/api/pumpfun/search', { query: 'test' }, 'Pumpfun search');
  await testRoute('POST', '/api/twitter/check-twitter-handle', { handle: 'test' }, 'Check Twitter handle');
  await testRoute('POST', '/api/twitter/twitter-search', { query: 'test' }, 'Twitter search');
  await testRoute('POST', '/api/twitter/user-tweets', { username: 'test' }, 'User tweets');
  await testRoute('POST', '/api/senator-trading', { draw: 1, start: 0, length: 10 }, 'Senator trading');
  await testRoute('POST', '/api/house-rep-trading', { lastName: 'test', filingYear: '2024' }, 'House rep trading');
  await testRoute('POST', '/api/market-summary', { data: {} }, 'Market summary');
  await testRoute('POST', '/api/generate-investment-plan', { userPortfolio: {} }, 'Generate investment plan');
  await testRoute('POST', '/api/options/get-high-oi-options', { symbol: 'AAPL' }, 'High OI options');
  await testRoute('POST', '/api/options/options-enhanced', { symbol: 'AAPL' }, 'Enhanced options');
  await testRoute('POST', '/api/get-birdseye-ohlcv', { tokenAddress: 'test', timeframe: '1h' }, 'Birdseye OHLCV');
  await testRoute('POST', '/api/get-formatted-ohlcv', { tokenAddress: 'test', timeframe: '1h' }, 'Formatted OHLCV');
  await testRoute('POST', '/api/get-kraken-ohlcv', { symbol: 'BTC/USD', interval: '1h' }, 'Kraken OHLCV');
  await testRoute('POST', '/api/get-yahoo-ohlcv', { symbol: 'AAPL', interval: '1d' }, 'Yahoo OHLCV');
  await testRoute('POST', '/api/get-token-meta', { mint: 'test' }, 'Token metadata');
  await testRoute('POST', '/api/get-ipfs-proxy', { cid: 'test' }, 'IPFS proxy');
  await testRoute('POST', '/api/users/holdings', { walletAddress: 'test' }, 'User holdings');
  await testRoute('POST', '/api/helio/create-paylink', { amount: 100, currency: 'USD' }, 'Helio paylink');
  await testRoute('POST', '/api/helio/get-signature', { data: {} }, 'Helio signature');
  await testRoute('POST', '/api/signup', { email: 'test@example.com' }, 'Signup');

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary\n');
  console.log(`✅ Passed: ${results.passed.length}`);
  console.log(`❌ Failed: ${results.failed.length}`);
  console.log(`⏭️  Skipped: ${results.skipped.length}`);
  console.log(`⚠️  Errors: ${results.errors.length}`);

  if (results.failed.length > 0) {
    console.log('\n❌ Failed Routes:\n');
    results.failed.forEach(({ method, path, status, error }) => {
      console.log(`  ${method} ${path} - ${status || 'ERROR'}: ${error || 'Unknown error'}`);
    });
  }

  if (results.errors.length > 0) {
    console.log('\n⚠️  Errors:\n');
    results.errors.forEach(({ path, error }) => {
      console.log(`  ${path}: ${error}`);
    });
  }

  // Calculate success rate
  const total = results.passed.length + results.failed.length;
  const successRate = total > 0 ? ((results.passed.length / total) * 100).toFixed(2) : 0;
  console.log(`\n📈 Success Rate: ${successRate}%`);

  // Exit with appropriate code
  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run tests
runTests().catch(console.error);
