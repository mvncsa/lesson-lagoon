import { NextResponse } from 'next/server';
import { calculateOrderPricing } from '@/lib/pricing';
import { INITIAL_PRODUCTS, INITIAL_CAMPAIGNS, INITIAL_COUPONS } from '@/lib/data';
import { CartItem, Product, Coupon, Campaign } from '@/lib/types';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, couponCode, pointsToUse, deliveryZoneId, isPickup, user } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    const itemIds = items.map((it: any) => it.pid).filter(Boolean);

    // Fetch products from database
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: itemIds } },
      include: { category: true },
    });

    const productsMap = new Map<string, Product>();

    // Seed map with initial products first
    INITIAL_PRODUCTS.forEach((p) => productsMap.set(p.id, p));

    // Overlay database products
    dbProducts.forEach((p) => {
      productsMap.set(p.id, {
        id: p.id,
        slug: p.slug,
        title: p.title,
        short: p.shortDesc,
        long: p.longDesc || undefined,
        cat: p.category?.name || p.categoryId,
        grade: p.grade,
        type: p.type as any,
        pages: p.pages,
        price: Number(p.price),
        min: Number(p.minPrice),
        featured: p.featured,
        rating: p.ratingAvg,
        rc: p.ratingCount,
        color: p.color,
        ic: p.icon,
        status: p.status as any,
        sales: p.salesCount,
        curr: p.curriculum,
        ver: p.version,
        pv: p.previewPagesCount,
      });
    });

    const resolvedItems: CartItem[] = items.map((it: any) => {
      const prod = productsMap.get(it.pid) || it.product;
      if (prod && !productsMap.has(prod.id)) {
        productsMap.set(prod.id, prod);
      }
      return {
        pid: it.pid,
        format: it.format || 'digital',
        product: prod,
        printConfig: it.printConfig,
      };
    });

    // Check campaigns from DB
    const now = new Date();
    const dbCampaign = await prisma.campaign.findFirst({
      where: {
        active: true,
        startAt: { lte: now },
        endAt: { gte: now },
      },
    });

    const activeCampaign: Campaign | null = dbCampaign
      ? {
          id: dbCampaign.id,
          name: dbCampaign.name,
          type: dbCampaign.type,
          pct: dbCampaign.discountPct,
          scope: dbCampaign.scope,
          mult: dbCampaign.pointsMultiplier,
          active: dbCampaign.active,
          start: dbCampaign.startAt.getTime(),
          end: dbCampaign.endAt.getTime(),
          accent: dbCampaign.accentColor,
          banner: dbCampaign.bannerText,
        }
      : INITIAL_CAMPAIGNS.find(
          (c) => c.active && Date.now() >= c.start && Date.now() <= c.end
        ) || null;

    // Check coupons from DB
    let coupon: Coupon | null = null;
    if (couponCode) {
      const upper = couponCode.trim().toUpperCase();
      const dbCoupon = await prisma.coupon.findUnique({
        where: { code: upper },
      });

      if (dbCoupon && dbCoupon.active && dbCoupon.expiresAt >= now) {
        coupon = {
          code: dbCoupon.code,
          pct: dbCoupon.discountPct || undefined,
          fixedMvr: dbCoupon.fixedMvr || undefined,
          limit: dbCoupon.usageLimit,
          used: dbCoupon.usageCount,
          expires: dbCoupon.expiresAt.toISOString().slice(0, 10),
          active: dbCoupon.active,
          applyToPrint: dbCoupon.applyToPrint,
        };
      } else {
        coupon =
          INITIAL_COUPONS.find(
            (c) => c.code.toUpperCase() === upper && c.active
          ) || null;
      }
    }

    const pricing = calculateOrderPricing(resolvedItems, productsMap, {
      user: user || null,
      activeCampaign,
      coupon,
      pointsToUse: Number(pointsToUse) || 0,
      deliveryZoneId,
      isPickup: Boolean(isPickup),
    });

    return NextResponse.json({
      success: true,
      pricing,
    });
  } catch (err: any) {
    console.error('Pricing calculation error:', err);
    return NextResponse.json({ error: err.message || 'Pricing error' }, { status: 500 });
  }
}
