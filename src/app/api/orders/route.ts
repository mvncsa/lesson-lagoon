import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        slip: true,
        delivery: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = orders.map((o) => ({
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
    }));

    return NextResponse.json({ success: true, orders: serialized });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      no,
      userId,
      subtotal,
      discount,
      pointsUsed,
      pointsDiscount,
      printTotal,
      deliveryFee,
      total,
      status,
      method,
      earnedPoints,
      items,
      deliveryDetails,
    } = body;

    const order = await prisma.order.create({
      data: {
        no,
        userId: userId || 'u1',
        subtotal: BigInt(subtotal || 0),
        discount: BigInt(discount || 0),
        pointsUsed: pointsUsed || 0,
        pointsDiscount: BigInt(pointsDiscount || 0),
        printTotal: BigInt(printTotal || 0),
        deliveryFee: BigInt(deliveryFee || 0),
        total: BigInt(total || 0),
        status: status || 'AWAITING_TRANSFER',
        method: method || 'Bank transfer',
        earnedPoints: earnedPoints || 0,
        items: {
          create: (items || []).map((it: any) => ({
            productId: it.pid,
            title: it.title,
            listPrice: BigInt(it.list || 0),
            finalPrice: BigInt(it.final || 0),
            format: it.format || 'digital',
          })),
        },
        delivery: deliveryDetails
          ? {
              create: {
                zoneId: deliveryDetails.zoneId,
                fee: BigInt(deliveryDetails.fee || 0),
                recipient: deliveryDetails.recipient,
                phone: deliveryDetails.phone,
                island: deliveryDetails.island,
                address: deliveryDetails.address,
                notes: deliveryDetails.notes,
                isPickup: deliveryDetails.isPickup || false,
                status: 'PRINT_QUEUED',
              },
            }
          : undefined,
      },
      include: {
        items: true,
        delivery: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        pointsDiscount: Number(order.pointsDiscount),
        printTotal: Number(order.printTotal),
        deliveryFee: Number(order.deliveryFee),
        total: Number(order.total),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
