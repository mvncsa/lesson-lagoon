import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.upsert({
      where: { email: cleanEmail },
      create: {
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
        role: 'CUSTOMER',
        marketingConsent: true,
        points: 50,
      },
      update: {
        marketingConsent: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to curriculum dispatches!',
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error('Newsletter subscribe error:', err);
    return NextResponse.json({ error: err.message || 'Subscription failed' }, { status: 500 });
  }
}
