import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const segment = searchParams.get('segment');
    const search = searchParams.get('search')?.toLowerCase().trim();

    const users = await prisma.user.findMany({
      where: {
        role: 'CUSTOMER',
      },
      include: {
        orders: {
          select: {
            id: true,
            no: true,
            total: true,
            status: true,
            createdAt: true,
          },
        },
        entitlements: true,
        pointsLedger: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = users.map((u) => {
      const paidOrders = u.orders.filter((o) => o.status === 'PAID');
      const hasPaid = paidOrders.length > 0;
      const totalSpentLaari = paidOrders.reduce((acc, o) => acc + Number(o.total), 0);

      return {
        id: u.id,
        name: u.name || 'Teacher Customer',
        email: u.email,
        role: u.role,
        points: u.points,
        pending: u.pendingPoints,
        held: u.heldPoints,
        code: u.referralCode || '',
        joined: u.createdAt.toISOString().slice(0, 10),
        source: 'Google Auth / Direct',
        consent: u.marketingConsent,
        paid: hasPaid,
        blocked: u.isBlocked,
        totalSpent: totalSpentLaari,
        ordersCount: u.orders.length,
        entitlementsCount: u.entitlements.length,
        recentLedger: u.pointsLedger.map((l) => ({
          id: l.id,
          points: l.points,
          type: l.type,
          status: l.status,
          source: l.source,
          date: l.createdAt.toISOString().slice(0, 10),
        })),
        welcome: {
          status: 'active' as const,
          pct: 20,
          expires: Date.now() + 7 * 86400000,
        },
      };
    });

    let filtered = serialized;
    if (segment === 'consent') {
      filtered = filtered.filter((c) => c.consent);
    } else if (segment === 'nobuy') {
      filtered = filtered.filter((c) => !c.paid);
    } else if (segment === 'pts200') {
      filtered = filtered.filter((c) => c.points >= 200);
    }

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.email.toLowerCase().includes(search) ||
          c.code.toLowerCase().includes(search)
      );
    }

    return NextResponse.json({ success: true, customers: filtered });
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { action, userId, pointsDelta, reason, isBlocked, marketingConsent } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ACTION: ADJUST LOYALTY POINTS
    if (action === 'adjust_points') {
      const delta = Number(pointsDelta) || 0;
      const newPoints = Math.max(0, targetUser.points + delta);

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { points: newPoints },
      });

      await prisma.pointsLedger.create({
        data: {
          userId,
          points: delta,
          balanceAfter: newPoints,
          type: 'ADMIN_ADJUSTMENT',
          status: 'available',
          source: reason || 'Admin manual points adjustment',
        },
      });

      return NextResponse.json({
        success: true,
        points: updatedUser.points,
        message: `Points updated by ${delta >= 0 ? '+' : ''}${delta}. New balance: ${updatedUser.points}`,
      });
    }

    // ACTION: TOGGLE BLOCKED STATUS
    if (action === 'toggle_block') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isBlocked: Boolean(isBlocked) },
      });

      return NextResponse.json({
        success: true,
        isBlocked: updatedUser.isBlocked,
        message: `User ${updatedUser.isBlocked ? 'suspended' : 'reactivated'}`,
      });
    }

    // ACTION: UPDATE MARKETING CONSENT
    if (action === 'update_consent') {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { marketingConsent: Boolean(marketingConsent) },
      });

      return NextResponse.json({
        success: true,
        marketingConsent: updatedUser.marketingConsent,
      });
    }

    // ACTION: UPDATE USER PROFILE & BIRTHDAY
    if (action === 'update_profile') {
      const { birthDay, birthMonth, fieldKey, fieldValue } = body;
      let ptsToAdd = 0;

      if (birthDay && birthMonth && !targetUser.birthDay) {
        ptsToAdd += 10;
      }

      if (fieldKey && fieldValue) {
        await prisma.userProfileValue.upsert({
          where: { userId_fieldKey: { userId, fieldKey } },
          create: { userId, fieldKey, value: String(fieldValue) },
          update: { value: String(fieldValue) },
        });
        ptsToAdd += 10;
      }

      const newBal = targetUser.points + ptsToAdd;
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          points: newBal,
          ...(birthDay ? { birthDay: Number(birthDay), birthMonth: Number(birthMonth), birthdaySetAt: new Date() } : {}),
        },
      });

      if (ptsToAdd > 0) {
        await prisma.pointsLedger.create({
          data: {
            userId,
            points: ptsToAdd,
            balanceAfter: newBal,
            type: 'PROFILE_REWARD',
            status: 'available',
            source: 'Profile completion reward',
          },
        });
      }

      return NextResponse.json({ success: true, user: updatedUser, points: updatedUser.points });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating customer:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
