import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, income, province } = body;

    // Validate
    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email required' }, { status: 400 });
    }

    // Create subscriber object
    const subscriber = {
      id: Date.now().toString(),
      name,
      email,
      income: income || null,
      province: province || null,
      createdAt: new Date().toISOString(),
    };

    // Save to Redis
    // 1. Add to subscribers list
    await redis.lpush('girmer:subscribers', JSON.stringify(subscriber));
    
    // 2. Increment total count
    await redis.incr('girmer:stats:total');
    
    // 3. Increment today's count
    const today = new Date().toISOString().split('T')[0];
    await redis.incr(`girmer:stats:daily:${today}`);

    // 4. Track province if provided
    if (province) {
      await redis.hincrby('girmer:stats:provinces', province, 1);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Subscription saved',
      id: subscriber.id 
    }, { status: 200 });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({ error: 'Failed to save subscription' }, { status: 500 });
  }
}
