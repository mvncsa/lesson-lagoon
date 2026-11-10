import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const entitlements = await prisma.entitlement.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const ownedProducts = entitlements.map((ent) => {
      const p = ent.product;
      return {
        id: p.id,
        slug: p.slug,
        title: p.title,
        short: p.shortDesc,
        long: p.longDesc || '',
        cat: p.category ? p.category.name : p.categoryId,
        grade: p.grade,
        type: p.type as any,
        pages: p.pages,
        price: Number(p.price),
        minPrice: Number(p.minPrice),
        featured: p.featured,
        curriculum: p.curriculum,
        color: p.color,
        ic: p.icon,
        status: p.status as any,
        ver: p.version,
        rating: p.ratingAvg,
        reviewsCount: p.ratingCount,
        salesCount: p.salesCount,
        claimedAt: ent.createdAt.toISOString(),
      };
    });

    const serializedEntitlements = entitlements.map((e) => ({
      uid: e.userId,
      pid: e.productId,
      at: e.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      entitlements: serializedEntitlements,
      products: ownedProducts,
    });
  } catch (error: any) {
    console.error('Error fetching library entitlements:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
