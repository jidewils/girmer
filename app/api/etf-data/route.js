import { NextResponse } from 'next/server';

// Canadian ETFs to track
const ETF_LIST = [
  { symbol: 'VEQT.TO', name: 'Vanguard All-Equity', category: 'All-in-One Equity' },
  { symbol: 'XEQT.TO', name: 'iShares All-Equity', category: 'All-in-One Equity' },
  { symbol: 'VGRO.TO', name: 'Vanguard Growth', category: 'All-in-One Balanced' },
  { symbol: 'XGRO.TO', name: 'iShares Growth', category: 'All-in-One Balanced' },
  { symbol: 'VFV.TO', name: 'Vanguard S&P 500', category: 'US Equity' },
  { symbol: 'XUS.TO', name: 'iShares S&P 500', category: 'US Equity' },
  { symbol: 'XIU.TO', name: 'iShares S&P/TSX 60', category: 'Canadian Equity' },
  { symbol: 'VCN.TO', name: 'Vanguard Canada All Cap', category: 'Canadian Equity' },
  { symbol: 'ZAG.TO', name: 'BMO Aggregate Bond', category: 'Bonds' },
  { symbol: 'XBB.TO', name: 'iShares Core Bond', category: 'Bonds' },
];

// Simple in-memory cache (resets on cold start, but good enough for daily data)
let cachedData = null;
let cacheTimestamp = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours in ms

async function fetchETFData(symbol, apiKey) {
  try {
    // Get current price and previous close for daily change
    const quoteUrl = `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`;
    const quoteRes = await fetch(quoteUrl);
    const quoteData = await quoteRes.json();

    if (quoteData.status === 'error') {
      console.error(`Error fetching ${symbol}:`, quoteData.message);
      return null;
    }

    // Get historical data for YTD and 1-year returns
    const timeSeriesUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=1day&outputsize=252&apikey=${apiKey}`;
    const tsRes = await fetch(timeSeriesUrl);
    const tsData = await tsRes.json();

    if (tsData.status === 'error' || !tsData.values || tsData.values.length === 0) {
      console.error(`Error fetching time series for ${symbol}`);
      return null;
    }

    const values = tsData.values;
    const currentPrice = parseFloat(values[0].close);
    
    // Find YTD start (first trading day of the year)
    const currentYear = new Date().getFullYear();
    const ytdStartValue = values.find(v => {
      const date = new Date(v.datetime);
      return date.getFullYear() === currentYear - 1 && date.getMonth() === 11;
    }) || values[values.length - 1];
    
    // 1-year return (use oldest data point we have, up to 252 trading days)
    const oneYearAgoValue = values[values.length - 1];
    
    const ytdReturn = ytdStartValue ? ((currentPrice - parseFloat(ytdStartValue.close)) / parseFloat(ytdStartValue.close)) * 100 : null;
    const oneYearReturn = ((currentPrice - parseFloat(oneYearAgoValue.close)) / parseFloat(oneYearAgoValue.close)) * 100;

    return {
      symbol: symbol.replace('.TO', ''),
      price: currentPrice,
      change: parseFloat(quoteData.change || 0),
      changePercent: parseFloat(quoteData.percent_change || 0),
      ytdReturn: ytdReturn ? ytdReturn.toFixed(1) : 'N/A',
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

    // Fetch fresh data (limit to 5 ETFs to stay within free tier limits)
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
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    if (results.length > 0) {
      cachedData = results;
      cacheTimestamp = now;
    }

    return NextResponse.json({ 
      etfs: results.length > 0 ? results : getStaticFallbackData(),
      cached: false,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('ETF API error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ETF data',
      etfs: getStaticFallbackData()
    }, { status: 200 });
  }
}

// Fallback data if API fails
function getStaticFallbackData() {
  return [
    { symbol: 'VEQT', name: 'Vanguard All-Equity', category: 'All-in-One Equity', oneYearReturn: 'N/A', ytdReturn: 'N/A', price: null },
    { symbol: 'XEQT', name: 'iShares All-Equity', category: 'All-in-One Equity', oneYearReturn: 'N/A', ytdReturn: 'N/A', price: null },
    { symbol: 'VGRO', name: 'Vanguard Growth', category: 'All-in-One Balanced', oneYearReturn: 'N/A', ytdReturn: 'N/A', price: null },
    { symbol: 'XGRO', name: 'iShares Growth', category: 'All-in-One Balanced', oneYearReturn: 'N/A', ytdReturn: 'N/A', price: null },
    { symbol: 'VFV', name: 'Vanguard S&P 500', category: 'US Equity', oneYearReturn: 'N/A', ytdReturn: 'N/A', price: null },
  ];
}
