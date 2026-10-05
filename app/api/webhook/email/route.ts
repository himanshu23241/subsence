// app/api/webhook/email/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the Service Role Key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to extract merchant name from email address
function extractMerchant(from: string): string {
  // Input example: "Spotify <no-reply@spotify.com>"
  // Output: "Spotify"
  const match = from.match(/^([^<]+)/);
  if (match) {
    return match[1].trim().replace(/['"]/g, '');
  }
  // Fallback: use the email domain
  const domainMatch = from.match(/@([^.]+)\./);
  return domainMatch ? domainMatch[1] : 'Unknown';
}

// Helper to extract amount from text using Regex
function extractAmount(text: string): number {
  // Looks for $10.99, €9.99, ₹119, etc.
  const match = text.match(/(?:[\$€£₹])\s?(\d+(?:\.\d{2})?)/);
  return match ? parseFloat(match[1]) : 0;
}

// Helper to extract currency
function extractCurrency(text: string): string {
  if (text.includes('€')) return 'EUR';
  if (text.includes('£')) return 'GBP';
  if (text.includes('₹')) return 'INR';
  return 'USD';
}

export async function POST(request: Request) {
  try {
    // 1. Verify the secret token
    const authHeader = request.headers.get('authorization');
    const secret = process.env.WEBHOOK_SECRET;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the incoming email payload
    const body = await request.json();
    const { from, subject, text } = body;

    // 3. Extract data using Regex
    const merchant = extractMerchant(from);
    const amount = extractAmount(text);
    const currency = extractCurrency(text);

    // 4. Get the user ID (For now, we assume you are the only user. We'll make this dynamic later)
    // We query the public.users table for the first user (you)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)
      .single();

    if (userError || !userData) {
      console.error('No user found in database:', userError);
      return NextResponse.json({ error: 'No user found' }, { status: 400 });
    }

    // 5. Insert into the transactions table
    const { data, error } = await supabaseAdmin
      .from('transactions')
      .insert({
        user_id: userData.id,
        merchant_name: merchant,
        amount: amount,
        currency: currency,
        transaction_date: new Date().toISOString(),
        raw_subject: subject,
      })
      .select();

    if (error) {
      console.error('Database insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('✅ Transaction saved:', data);

    return NextResponse.json({ 
      success: true, 
      message: 'Email processed and saved',
      transaction: data 
    }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}