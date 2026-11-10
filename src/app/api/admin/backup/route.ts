import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [products, users, orders, reviews, requests, settings, coupons, campaigns] =
      await Promise.all([
        prisma.product.findMany({ include: { category: true, printOptions: true } }),
        prisma.user.findMany({ include: { entitlements: true, pointsLedger: true } }),
        prisma.order.findMany({ include: { items: true, slip: true, delivery: true, events: true } }),
        prisma.review.findMany(),
        prisma.resourceRequest.findMany(),
        prisma.pricingSetting.findMany(),
        prisma.coupon.findMany(),
        prisma.campaign.findMany(),
      ]);

    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      provider: 'Prisma ORM (SQLite / PostgreSQL ready)',
      counts: {
        products: products.length,
        users: users.length,
        orders: orders.length,
        reviews: reviews.length,
        requests: requests.length,
      },
      data: {
        products: products.map((p) => ({
          ...p,
          price: Number(p.price),
          minPrice: Number(p.minPrice),
        })),
        users: users.map((u) => ({
          ...u,
          orders: undefined,
        })),
        orders: orders.map((o) => ({
          ...o,
          subtotal: Number(o.subtotal),
          discount: Number(o.discount),
          pointsDiscount: Number(o.pointsDiscount),
          printTotal: Number(o.printTotal),
          deliveryFee: Number(o.deliveryFee),
          total: Number(o.total),
          slip: o.slip ? { ...o.slip, amount: Number(o.slip.amount) } : null,
          delivery: o.delivery ? { ...o.delivery, fee: Number(o.delivery.fee) } : null,
          items: o.items.map((i) => ({
            ...i,
            listPrice: Number(i.listPrice),
            finalPrice: Number(i.finalPrice),
          })),
        })),
        reviews,
        requests,
        settings,
        coupons,
        campaigns,
      },
    };

    const json = JSON.stringify(backupData, null, 2);
    const dateStr = new Date().toISOString().slice(0, 10);

    return new NextResponse(json, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="lessonlagoon-backup-${dateStr}.json"`,
      },
    });
  } catch (err: any) {
    console.error('Backup error:', err);
    return NextResponse.json({ error: err.message || 'Backup failed' }, { status: 500 });
  }
}
