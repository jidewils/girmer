import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

// ETFs to track - US-listed ETFs (available on Twelve Data free tier)
const ETF_LIST = [
  { symbol: 'VTI', name: 'Vanguard Total Stock Market', category: 'US Total Market' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', category: 'US Large Cap' },
  { symbol: 'VT', name: 'Vanguard Total World Stock', category: 'Global Equity' },
  { symbol: 'QQQ', name: 'Invesco Nasdaq 100', category: 'US Tech' },
  { symbol: 'SCHD', name: 'Schwab US Dividend', category: 'US Dividend' },
];

// Cache duration: 24 hours
const CACHE_DURATION_HOURS = 24;

async function fetchETFData(symbol, apiKey) {
  try {
    // Get quote data
    const quoteUrl = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;
    const quoteRes = await fetch(quoteUrl);
    const quoteData = await quoteRes.json();

    if (quoteData.status === 'error' || quoteData.code) {
      console.error(`Error fetching ${symbol}:`, quoteData.message || quoteData.code);
      return null;
    }

    // Get price data for returns calculation
    const priceUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=252&apikey=${apiKey}`;
    const priceRes = await fetch(priceUrl);
    const priceData = await priceRes.json();

    if (priceData.status === 'error' || !priceData.values || priceData.values.length === 0) {
      // Return with just quote data if time series fails
      return {
        symbol,
        price: parseFloat(quoteData.close) || null,
        change: parseFloat(quoteData.change) || 0,
        changePercent: parseFloat(quoteData.percent_change) || 0,
        ytdReturn: 'N/A',
        oneYearReturn: 'N/A',
      };
    }

    const values = priceData.values;
    const currentPrice = parseFloat(values[0].close);
    
    // Calculate YTD (from start of year)
    const currentYear = new Date().getFullYear();
    let ytdStartPrice = null;
    for (let i = values.length - 1; i >= 0; i--) {
      const date = new Date(values[i].datetime);
      if (date.getFullYear() === currentYear) {
        ytdStartPrice = parseFloat(values[i].close);
        break;
      }
    }
    
    // 1-year return (oldest data point)
    const oneYearAgoPrice = parseFloat(values[values.length - 1].close);
    
    const ytdReturn = ytdStartPrice ? ((currentPrice - ytdStartPrice) / ytdStartPrice) * 100 : null;
    const oneYearReturn = ((currentPrice - oneYearAgoPrice) / oneYearAgoPrice) * 100;

    return {
      symbol,
      price: currentPrice,
      change: parseFloat(quoteData.change) || 0,
      changePercent: parseFloat(quoteData.percent_change) || 0,
      ytdReturn: ytdReturn !== null ? ytdReturn.toFixed(1) : 'N/A',
      oneYearReturn: oneYearReturn.toFixed(1),
    };
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    return null;
  }
}

async function fetchAllETFData(apiKey) {
  const results = [];
  
  for (const etf of ETF_LIST) {
    const data = await fetchETFData(etf.symbol, apiKey);
    if (data) {
      results.push({
        ...data,
        name: etf.name,
        category: etf.category,
      });
    }
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  return results;
}

export async function GET() {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    
    // Try to get cached data from Redis
    const cachedData = await redis.get('girmer:etf:data');
    const cachedTimestamp = await redis.get('girmer:etf:timestamp');
    
    if (cachedData && cachedTimestamp) {
      const cacheAge = Date.now() - parseInt(cachedTimestamp);
      const cacheAgeHours = cacheAge / (1000 * 60 * 60);
      
      // If cache is less than 24 hours old, return cached data
      if (cacheAgeHours < CACHE_DURATION_HOURS) {
        return NextResponse.json({
          etfs: cachedData,
          cached: true,
          lastUpdated: new Date(parseInt(cachedTimestamp)).toISOString(),
          cacheAgeHours: Math.round(cacheAgeHours * 10) / 10,
        });
      }
    }
    
    // No valid cache - need to fetch fresh data
    if (!apiKey) {
      console.error('TWELVE_DATA_API_KEY not configured');
      // Return cached data even if stale, or fallback
      if (cachedData) {
        return NextResponse.json({
          etfs: cachedData,
          cached: true,
          stale: true,
          lastUpdated: cachedTimestamp ? new Date(parseInt(cachedTimestamp)).toISOString() : null,
          note: 'API key not configured, using stale cache',
        });
      }
      return NextResponse.json({
        etfs: getStaticFallbackData(),
        cached: false,
        lastUpdated: null,
        note: 'Using fallback data - API key not configured',
      });
    }

    // Fetch fresh data
    console.log('Fetching fresh ETF data from Twelve Data...');
    const freshData = await fetchAllETFData(apiKey);
    
    if (freshData && freshData.length > 0) {
      // Save to Redis
      const timestamp = Date.now();
      await redis.set('girmer:etf:data', freshData);
      await redis.set('girmer:etf:timestamp', timestamp.toString());
      
      console.log(`Cached ${freshData.length} ETFs at ${new Date(timestamp).toISOString()}`);
      
      return NextResponse.json({
        etfs: freshData,
        cached: false,
        lastUpdated: new Date(timestamp).toISOString(),
      });
    }
    
    // Fetch failed - return stale cache or fallback
    if (cachedData) {
      return NextResponse.json({
        etfs: cachedData,
        cached: true,
        stale: true,
        lastUpdated: cachedTimestamp ? new Date(parseInt(cachedTimestamp)).toISOString() : null,
        note: 'API fetch failed, using stale cache',
      });
    }
    
    // No cache, no fresh data - use fallback
    return NextResponse.json({
      etfs: getStaticFallbackData(),
      cached: false,
      lastUpdated: null,
      note: 'Using fallback data',
    });

  } catch (error) {
    console.error('ETF API error:', error);
    
    // Try to return cached data on error
    try {
      const cachedData = await redis.get('girmer:etf:data');
      const cachedTimestamp = await redis.get('girmer:etf:timestamp');
      if (cachedData) {
        return NextResponse.json({
          etfs: cachedData,
          cached: true,
          stale: true,
          lastUpdated: cachedTimestamp ? new Date(parseInt(cachedTimestamp)).toISOString() : null,
          note: 'Error occurred, using cached data',
        });
      }
    } catch (redisError) {
      console.error('Redis error:', redisError);
    }
    
    return NextResponse.json({
      etfs: getStaticFallbackData(),
      cached: false,
      lastUpdated: null,
      error: 'Failed to fetch ETF data',
    });
  }
}

// Force refresh endpoint - can be called manually or via cron
export async function POST(request) {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }
    
    console.log('Force refreshing ETF data...');
    const freshData = await fetchAllETFData(apiKey);
    
    if (freshData && freshData.length > 0) {
      const timestamp = Date.now();
      await redis.set('girmer:etf:data', freshData);
      await redis.set('girmer:etf:timestamp', timestamp.toString());
      
      return NextResponse.json({
        success: true,
        etfsUpdated: freshData.length,
        lastUpdated: new Date(timestamp).toISOString(),
      });
    }
    
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    
  } catch (error) {
    console.error('Force refresh error:', error);
    return NextResponse.json({ error: 'Failed to refresh' }, { status: 500 });
  }
}

// Fallback data with realistic values
function getStaticFallbackData() {
  return [
    { symbol: 'VTI', name: 'Vanguard Total Stock Market', category: 'US Total Market', oneYearReturn: '12.4', ytdReturn: '3.2', price: 268.50 },
    { symbol: 'VOO', name: 'Vanguard S&P 500', category: 'US Large Cap', oneYearReturn: '14.1', ytdReturn: '3.5', price: 492.30 },
    { symbol: 'VT', name: 'Vanguard Total World Stock', category: 'Global Equity', oneYearReturn: '10.8', ytdReturn: '2.9', price: 112.40 },
    { symbol: 'QQQ', name: 'Invesco Nasdaq 100', category: 'US Tech', oneYearReturn: '18.5', ytdReturn: '4.1', price: 438.20 },
    { symbol: 'SCHD', name: 'Schwab US Dividend', category: 'US Dividend', oneYearReturn: '8.2', ytdReturn: '1.8', price: 82.60 },
  ];
}
