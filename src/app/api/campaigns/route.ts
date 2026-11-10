import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_CAMPAIGNS, INITIAL_COUPONS } from '@/lib/data';

export async function GET() {
  try {
    const [dbCampaigns, dbCoupons] = await Promise.all([
      prisma.campaign.findMany({ orderBy: { startAt: 'desc' } }),
      prisma.coupon.findMany({ orderBy: { code: 'asc' } }),
    ]);

    // If DB is empty, provide initial data
    const campaigns =
      dbCampaigns.length > 0
        ? dbCampaigns.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            pct: c.discountPct,
            scope: c.scope,
            mult: c.pointsMultiplier,
            active: c.active,
            start: c.startAt.getTime(),
            end: c.endAt.getTime(),
            accent: c.accentColor,
            banner: c.bannerText,
          }))
        : INITIAL_CAMPAIGNS;

    const coupons =
      dbCoupons.length > 0
        ? dbCoupons.map((c) => ({
            code: c.code,
            pct: c.discountPct || undefined,
            fixedMvr: c.fixedMvr || undefined,
            limit: c.usageLimit,
            used: c.usageCount,
            expires: c.expiresAt.toISOString().slice(0, 10),
            active: c.active,
            applyToPrint: c.applyToPrint,
          }))
        : INITIAL_COUPONS;

    return NextResponse.json({ success: true, campaigns, coupons });
  } catch (error: any) {
    console.error('Error fetching campaigns:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kind } = body;

    if (kind === 'coupon') {
      const { code, pct, fixedMvr, limit, expires, applyToPrint } = body;
      if (!code) {
        return NextResponse.json({ error: 'code is required' }, { status: 400 });
      }

      const created = await prisma.coupon.upsert({
        where: { code: code.toUpperCase() },
        create: {
          code: code.toUpperCase(),
          discountPct: pct ? Number(pct) : null,
          fixedMvr: fixedMvr ? Number(fixedMvr) : null,
          usageLimit: limit ? Number(limit) : 100,
          usageCount: 0,
          expiresAt: expires ? new Date(expires) : new Date(Date.now() + 90 * 86400000),
          active: true,
          applyToPrint: Boolean(applyToPrint),
        },
        update: {
          discountPct: pct ? Number(pct) : null,
          fixedMvr: fixedMvr ? Number(fixedMvr) : null,
          usageLimit: limit ? Number(limit) : 100,
          active: true,
        },
      });

      return NextResponse.json({ success: true, coupon: created });
    }

    if (kind === 'campaign') {
      const { name, type, pct, scope, mult, start, end, accent, banner } = body;
      if (!name) {
        return NextResponse.json({ error: 'name is required' }, { status: 400 });
      }

      const created = await prisma.campaign.create({
        data: {
          name,
          type: type || 'Flash Sale',
          discountPct: Number(pct || 15),
          scope: scope || 'all',
          pointsMultiplier: Number(mult || 1),
          active: true,
          startAt: start ? new Date(start) : new Date(),
          endAt: end ? new Date(end) : new Date(Date.now() + 7 * 86400000),
          accentColor: accent || '#DB2777',
          bannerText: banner || `${name} is live!`,
        },
      });

      return NextResponse.json({ success: true, campaign: created });
    }

    return NextResponse.json({ error: 'kind must be coupon or campaign' }, { status: 400 });
  } catch (error: any) {
    console.error('Error creating campaign or coupon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { kind, id, code, active } = body;

    if (kind === 'campaign' && id) {
      const updated = await prisma.campaign.update({
        where: { id },
        data: { active: Boolean(active) },
      });
      return NextResponse.json({ success: true, campaign: updated });
    }

    if (kind === 'coupon' && code) {
      const updated = await prisma.coupon.update({
        where: { code: code.toUpperCase() },
        data: { active: Boolean(active) },
      });
      return NextResponse.json({ success: true, coupon: updated });
    }

    return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating campaign or coupon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
