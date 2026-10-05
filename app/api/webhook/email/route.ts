// app/api/webhook/email/route.ts
import { NextResponse } from 'next/server';

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

    // 3. Log it (We will save to DB in Phase 1)
    console.log('📧 Received email webhook:');
    console.log('From:', body.from);
    console.log('Subject:', body.subject);
    console.log('Date:', body.date);
    console.log('Body preview:', body.text.substring(0, 100) + '...');

    // 4. Return success
    return NextResponse.json({ 
      success: true, 
      message: 'Email received' 
    }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}