// app/api/demo-data/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEMO_TRANSACTIONS = [
  { merchant_name: 'Spotify', amount: 10.99, currency: 'USD', daysAgo: 2 },
  { merchant_name: 'Netflix', amount: 15.99, currency: 'USD', daysAgo: 5 },
  { merchant_name: 'ChatGPT Plus', amount: 20.00, currency: 'USD', daysAgo: 8 },
  { merchant_name: 'Gym Membership', amount: 29.99, currency: 'USD', daysAgo: 12 },
  { merchant_name: 'Adobe Creative Cloud', amount: 54.99, currency: 'USD', daysAgo: 15 },
  { merchant_name: 'Amazon Prime', amount: 14.99, currency: 'USD', daysAgo: 20 },
  { merchant_name: 'YouTube Premium', amount: 11.99, currency: 'USD', daysAgo: 25 },
  { merchant_name: 'Notion', amount: 8.00, currency: 'USD', daysAgo: 30 },
];

export async function POST() {
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .select('id')
    .limit(1)
    .single();

  if (userError || !userData) {
    return NextResponse.json({ error: 'No user found' }, { status: 400 });
  }

  // Clear existing demo transactions for this user to avoid duplicates
  await supabaseAdmin
    .from('transactions')
    .delete()
    .eq('user_id', userData.id);

  const now = new Date();
  const toInsert = DEMO_TRANSACTIONS.map((t) => {
    const date = new Date(now);
    date.setDate(date.getDate() - t.daysAgo);
    return {
      user_id: userData.id,
      merchant_name: t.merchant_name,
      amount: t.amount,
      currency: t.currency,
      transaction_date: date.toISOString(),
      raw_subject: `Receipt from ${t.merchant_name}`,
    };
  });

  const { error } = await supabaseAdmin.from('transactions').insert(toInsert);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, inserted: toInsert.length });
}