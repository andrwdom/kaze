import mongoose from 'mongoose';
import Email from '@/models/Email';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { headers } from 'next/headers';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined');
}

// Create a new ratelimiter that allows 5 requests per minute
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

export async function POST(req: Request) {
  console.log('1. Starting email subscription...');
  
  try {
    // 1. Check rate limit
    const ip = headers().get('x-forwarded-for') || '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return new Response(
        JSON.stringify({ 
          error: 'Please wait a moment before trying again.' 
        }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 2. Get the email
    const { email } = await req.json();
    console.log('2. Received email:', email);

    // 3. Basic email validation
    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 4. Connect to MongoDB
    console.log('3. Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('4. MongoDB connected successfully');

    // 5. Save the email
    console.log('5. Attempting to save email...');
    await Email.create({ email });
    console.log('6. Email saved successfully');

    // 6. Return success
    return new Response(
      JSON.stringify({ success: true, message: 'Successfully subscribed!' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('ERROR:', error);

    // Handle duplicate emails gracefully
    if (error.code === 11000) {
      return new Response(
        JSON.stringify({ success: true, message: 'Successfully subscribed!' }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Return error
    return new Response(
      JSON.stringify({ error: 'Failed to save email. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 