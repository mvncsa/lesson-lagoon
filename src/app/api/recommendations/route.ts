import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getRecommendations } from '@/lib/recommender';
import { Product, Order } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId') || undefined;
    const userId = searchParams.get('userId') || undefined;
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    const [dbProducts, dbOrders, dbEntitlements] = await Promise.all([
      prisma.product.findMany({ where: { status: 'Published' } }),
      prisma.order.findMany({ include: { items: true } }),
      prisma.entitlement.findMany(),
    ]);

    const formattedProducts: Product[] = dbProducts.map((p) => ({
      ...p,
      type: p.type as any,
      price: Number(p.price),
      min: Number(p.minPrice),
      rating: p.ratingAvg,
      rc: p.ratingCount,
      sales: p.salesCount,
      curr: p.curriculum,
      ver: p.version,
      pv: p.previewPagesCount,
      color: p.color,
      ic: p.icon,
      short: p.shortDesc,
      long: p.longDesc || undefined,
      cat: p.categoryId,
      status: p.status as any,
    }));

    const formattedOrders: Order[] = dbOrders.map((o) => ({
      no: o.no,
      uid: o.userId,
      items: o.items.map((i) => ({
        pid: i.productId,
        title: i.title,
        list: Number(i.listPrice),
        final: Number(i.finalPrice),
      })),
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      pointsUsed: o.pointsUsed,
      pointsDiscount: Number(o.pointsDiscount),
      printTotal: Number(o.printTotal),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
      status: o.status as any,
      at: o.createdAt.toISOString(),
      method: o.method as any,
      earned: o.earnedPoints,
    }));

    const formattedEntitlements = dbEntitlements.map((e) => ({
      uid: e.userId,
      pid: e.productId,
      at: e.createdAt.toISOString(),
    }));

    const viewerOwnedIds = userId
      ? formattedEntitlements.filter((e) => e.uid === userId).map((e) => e.pid)
      : [];

    const recs = getRecommendations(formattedProducts, formattedOrders, formattedEntitlements, {
      currentProductId: productId,
      viewerOwnedIds,
      limit,
    });

    return NextResponse.json({ success: true, recommendations: recs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
