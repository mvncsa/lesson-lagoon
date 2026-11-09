import { NextResponse } from 'next/server';
import { calculateOrderPricing } from '@/lib/pricing';
import { INITIAL_PRODUCTS, INITIAL_CAMPAIGNS, INITIAL_COUPONS } from '@/lib/data';
import { CartItem, Product } from '@/lib/types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, couponCode, pointsToUse, deliveryZoneId, isPickup, user } = body;

    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'items array is required' }, { status: 400 });
    }

    const productsMap = new Map<string, Product>();
    INITIAL_PRODUCTS.forEach((p) => productsMap.set(p.id, p));

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

    const activeCampaign = INITIAL_CAMPAIGNS.find(
      (c) => c.active && Date.now() >= c.start && Date.now() <= c.end
    ) || null;

    const coupon = couponCode
      ? INITIAL_COUPONS.find((c) => c.code.toUpperCase() === couponCode.trim().toUpperCase()) || null
      : null;

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
