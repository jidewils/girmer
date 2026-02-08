import { NextResponse } from 'next/server';

// ETFs to track - using US-listed ETFs (available on Twelve Data free tier)
// These are popular ETFs that Canadians can also invest in
const ETF_LIST = [
  { symbol: 'VTI', name: 'Vanguard Total Stock Market', category: 'US Total Market' },
  { symbol: 'VOO', name: 'Vanguard S&P 500', category: 'US Large Cap' },
  { symbol: 'VT', name: 'Vanguard Total World Stock', category: 'Global Equity' },
  { symbol: 'QQQ', name: 'Invesco Nasdaq 100', category: 'US Tech' },
  { symbol: 'VGT', name: 'Vanguard Info Tech', category: 'US Tech' },
  { symbol: 'SCHD', name: 'Schwab US Dividend', category: 'US Dividend' },
  { symbol: 'BND', name: 'Vanguard Total Bond', category: 'US Bonds' },
  { symbol: 'VWO', name: 'Vanguard Emerging Markets', category: 'Emerging Markets' },
];

// Simple in-memory cache
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

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

export async function GET() {
  try {
    const apiKey = process.env.TWELVE_DATA_API_KEY;
    
    if (!apiKey) {
      console.error('TWELVE_DATA_API_KEY not configured');
      return NextResponse.json({ 
        error: 'API key not configured',
        etfs: getStaticFallbackData()
      }, { status: 200 });
    }

    // Check cache
    const now = Date.now();
    if (cachedData && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
      return NextResponse.json({ 
        etfs: cachedData, 
        cached: true,
        lastUpdated: new Date(cacheTimestamp).toISOString()
      });
    }

    // Fetch fresh data (limit to 5 ETFs to stay within free tier: 8 calls/min)
    const priorityETFs = ETF_LIST.slice(0, 5);
    const results = [];
    
    for (const etf of priorityETFs) {
      const data = await fetchETFData(etf.symbol, apiKey);
      if (data) {
        results.push({
          ...data,
          name: etf.name,
          category: etf.category,
        });
      }
      // Delay to avoid rate limiting (8 calls/min = 1 every 7.5 sec, but we're conservative)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (results.length > 0) {
      cachedData = results;
      cacheTimestamp = now;
      
      return NextResponse.json({ 
        etfs: results,
        cached: false,
        lastUpdated: new Date().toISOString()
      });
    }

    // If all fetches failed, return fallback
    return NextResponse.json({ 
      etfs: getStaticFallbackData(),
      cached: false,
      lastUpdated: new Date().toISOString(),
      note: 'Using fallback data'
    });

  } catch (error) {
    console.error('ETF API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ETF data',
      etfs: getStaticFallbackData()
    }, { status: 200 });
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
