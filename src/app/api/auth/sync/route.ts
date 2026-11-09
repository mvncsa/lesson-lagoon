import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, name, image, marketingConsent } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user is blocked
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existing?.isBlocked) {
      return NextResponse.json(
        { error: 'This account has been suspended.' },
        { status: 403 }
      );
    }

    const adminEmails = (process.env.ADMIN_EMAILS || 'mvncsa@gmail.com,owner@lessonlagoon.mv')
      .split(',')
      .map((e) => e.trim().toLowerCase());
    const isAdmin = adminEmails.includes(cleanEmail);

    let user = existing;

    if (!user) {
      // P1-AUTH-05: First sign-in creates customer, generates referral code, awards 50 points
      const base =
        (name || cleanEmail)
          .replace(/[^a-zA-Z]/g, '')
          .slice(0, 6)
          .toUpperCase() || 'USER';
      const rand = Math.floor(10 + Math.random() * 90);
      const referralCode = `${base}${rand}`;

      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          image: image || null,
          role: isAdmin ? 'ADMIN' : 'CUSTOMER',
          points: 50,
          referralCode,
          marketingConsent: Boolean(marketingConsent),
        },
      });

      // Record in points_ledger
      await prisma.pointsLedger.create({
        data: {
          userId: user.id,
          points: 50,
          type: 'SIGNUP_BONUS',
          balanceAfter: 50,
          status: 'available',
          source: 'Welcome sign-up reward bonus',
        },
      });
    } else {
      // Existing user: check if email is on admin allowlist
      if (isAdmin && user.role !== 'ADMIN') {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' },
        });
      }
    }

    // Persist session to SQLite `sessions` table (30 days validity)
    const sessionToken =
      'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        points: user.points,
        referralCode: user.referralCode,
        sessionToken,
      },
    });
  } catch (err: any) {
    console.error('Failed to sync auth session with SQLite database:', err);
    return NextResponse.json(
      { error: err.message || 'Database error' },
      { status: 500 }
    );
  }
}
