import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function GET(request) {
  try {
    // Simple auth via query param (you can make this more secure later)
    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    
    // Check admin key (set this in Vercel env vars as ADMIN_KEY)
    const adminKey = process.env.ADMIN_KEY || 'girmer2025';
    if (key !== adminKey) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get stats
    const total = await redis.get('girmer:stats:total') || 0;
    
    // Get today's count
    const today = new Date().toISOString().split('T')[0];
    const todayCount = await redis.get(`girmer:stats:daily:${today}`) || 0;
    
    // Get this week's count (last 7 days)
    let weekCount = 0;
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = await redis.get(`girmer:stats:daily:${dateStr}`) || 0;
      weekCount += parseInt(count);
    }

    // Get province breakdown
    const provinces = await redis.hgetall('girmer:stats:provinces') || {};

    // Get recent subscribers (last 50)
    const subscribers = await redis.lrange('girmer:subscribers', 0, 49);
    const parsedSubscribers = subscribers.map(s => {
      try {
        return typeof s === 'string' ? JSON.parse(s) : s;
      } catch {
        return s;
      }
    });

    return NextResponse.json({
      stats: {
        total: parseInt(total),
        today: parseInt(todayCount),
        thisWeek: weekCount,
        provinces,
      },
      subscribers: parsedSubscribers,
    }, { status: 200 });

  } catch (error) {
    console.error('Fetch subscribers error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
