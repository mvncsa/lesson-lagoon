import { NextResponse } from 'next/server';
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

    const product = INITIAL_PRODUCTS.find((p) => p.id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const customerEmail = userEmail || 'guest.teacher@lessonlagoon.mv';
    const stampDate = new Date().toISOString().slice(0, 10);
    const licenceStamp = `Licensed to ${customerEmail} · Order #${orderNo} · ${stampDate} · Single-Teacher Classroom Licence`;

    // Return licensing metadata and stamped download payload
    const mockPdfBytes = `\n%PDF-1.4\n% LessonLagoon Stamped Digital Resource\n% ${licenceStamp}\n% Title: ${product.title}\n% Grade: ${product.grade} - Category: ${product.cat}\n`;

    return new NextResponse(mockPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${product.slug}-licensed.pdf"`,
        'X-Licence-Stamp': encodeURIComponent(licenceStamp),
      },
    });
  } catch (err: any) {
    console.error('Download error:', err);
    return NextResponse.json({ error: err.message || 'Download failed' }, { status: 500 });
  }
}
