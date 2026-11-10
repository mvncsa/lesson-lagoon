import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_PRODUCTS } from '@/lib/data';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const userEmail = searchParams.get('email');
    const orderNo = searchParams.get('orderNo') || 'FREE-CLAIM';

    if (!productId) {
      return NextResponse.json({ error: 'productId is required' }, { status: 400 });
    }

    // 1. Check database for product via Prisma
    let productTitle = '';
    let productSlug = '';
    let productGrade = '';
    let productCat = '';

    const dbProduct = await prisma.product.findUnique({
      where: { id: productId },
      include: { category: true },
    });

    if (dbProduct) {
      productTitle = dbProduct.title;
      productSlug = dbProduct.slug;
      productGrade = dbProduct.grade;
      productCat = dbProduct.category?.name || dbProduct.categoryId;
    } else {
      const mockProduct = INITIAL_PRODUCTS.find((p) => p.id === productId);
      if (mockProduct) {
        productTitle = mockProduct.title;
        productSlug = mockProduct.slug;
        productGrade = mockProduct.grade;
        productCat = mockProduct.cat;
      } else {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
    }

    const customerEmail = userEmail || 'guest.teacher@lessonlagoon.mv';
    const stampDate = new Date().toISOString().slice(0, 10);
    const licenceStamp = `Licensed to ${customerEmail} · Order #${orderNo} · ${stampDate} · Single-Teacher Classroom Licence`;

    // Return licensing metadata and stamped download payload
    const mockPdfBytes = `%PDF-1.4\n% LessonLagoon Stamped Digital Resource\n% ${licenceStamp}\n% Title: ${productTitle}\n% Grade: ${productGrade} - Category: ${productCat}\n`;

    return new NextResponse(mockPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${productSlug || 'resource'}-licensed.pdf"`,
        'X-Licence-Stamp': encodeURIComponent(licenceStamp),
      },
    });
  } catch (err: any) {
    console.error('Download error:', err);
    return NextResponse.json({ error: err.message || 'Download failed' }, { status: 500 });
  }
}
