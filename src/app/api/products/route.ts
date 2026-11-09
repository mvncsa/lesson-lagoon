import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('category');
    const grade = searchParams.get('grade');
    const search = searchParams.get('search');
    const status = searchParams.get('status') || 'Published';

    const where: any = {};
    if (status !== 'all') where.status = status;
    if (categoryId && categoryId !== 'all') where.categoryId = categoryId;
    if (grade && grade !== 'all') where.grade = grade;
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { shortDesc: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: true,
        printOptions: true,
      },
      orderBy: { salesCount: 'desc' },
    });

    // Convert BigInt to number for JSON serialization
    const serialized = products.map((p) => ({
      ...p,
      price: Number(p.price),
      minPrice: Number(p.minPrice),
      printOptions: p.printOptions
        ? {
            ...p.printOptions,
            fixedPrice: p.printOptions.fixedPrice ? Number(p.printOptions.fixedPrice) : null,
          }
        : null,
    }));

    return NextResponse.json({ success: true, products: serialized });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
