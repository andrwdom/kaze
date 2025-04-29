import connectDB from '@/lib/mongodb';
import Email from '@/models/Email';
import { ratelimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: Request) {
  try {
    const ip = (await headers()).get('x-forwarded-for') || '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }

    const { email } = await req.json();

    if (!email || !email.includes('@')) {
      return new Response(
        JSON.stringify({ error: 'Please provide a valid email address' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await connectDB();

    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return new Response(
        JSON.stringify({ error: 'Email already subscribed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const newEmail = await Email.create({ email });
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail the subscription if email sending fails
    }

    return new Response(
      JSON.stringify({ message: 'Successfully subscribed!' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Subscription error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 