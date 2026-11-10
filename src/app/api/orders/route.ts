import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const orderNo = searchParams.get('orderNo') || searchParams.get('no');
    const status = searchParams.get('status');

    const orders = await prisma.order.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(orderNo ? { no: orderNo } : {}),
        ...(status && status !== 'all' ? { status } : {}),
      },
      include: {
        items: {
          include: {
            printItem: true,
          },
        },
        slip: true,
        delivery: true,
        events: {
          orderBy: { createdAt: 'desc' },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const serialized = orders.map((o) => ({
      no: o.no,
      uid: o.userId,
      user: o.user,
      subtotal: Number(o.subtotal),
      discount: Number(o.discount),
      pointsUsed: o.pointsUsed,
      pointsDiscount: Number(o.pointsDiscount),
      printTotal: Number(o.printTotal),
      deliveryFee: Number(o.deliveryFee),
      total: Number(o.total),
      status: o.status,
      method: o.method,
      earned: o.earnedPoints,
      at: o.createdAt.toISOString().slice(0, 16),
      slip: o.slip
        ? {
            amount: Number(o.slip.amount),
            ref: o.slip.refNumber || '',
            sender: o.slip.senderName || '',
            date: o.slip.transferDate ? o.slip.transferDate.toISOString().slice(0, 10) : '',
            url: o.slip.fileUrl || undefined,
            fileHash: o.slip.fileHash || undefined,
            mismatchFlag: o.slip.mismatchFlag,
            duplicateFlag: o.slip.duplicateFlag,
          }
        : undefined,
      deliveryDetails: o.delivery
        ? {
            zoneId: o.delivery.zoneId,
            zoneName: o.delivery.zoneId,
            fee: Number(o.delivery.fee),
            recipient: o.delivery.recipient,
            phone: o.delivery.phone,
            island: o.delivery.island,
            address: o.delivery.address,
            notes: o.delivery.notes || undefined,
            isPickup: o.delivery.isPickup,
            status: o.delivery.status as any,
            trackingNote: o.delivery.trackingNote || undefined,
          }
        : undefined,
      items: o.items.map((i) => ({
        pid: i.productId,
        title: i.title,
        list: Number(i.listPrice),
        final: Number(i.finalPrice),
        format: i.format as 'digital' | 'print',
        printDetails: i.printItem
          ? {
              colour: i.printItem.colour as any,
              binding: i.printItem.binding as any,
              paper: i.printItem.paper as any,
              qty: i.printItem.qty,
              unitPrice: Number(i.printItem.unitPrice),
              lineTotal: Number(i.printItem.lineTotal),
            }
          : undefined,
      })),
      log: o.events.map((e) => ({
        at: e.createdAt.toISOString().slice(0, 16),
        ev: e.event,
      })),
    }));

    return NextResponse.json({ success: true, orders: serialized });
  } catch (error: any) {
    console.error('Error fetching orders:', error);
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

    let targetUserId = userId;
    if (!targetUserId) {
      const defaultUser = await prisma.user.findFirst();
      if (defaultUser) {
        targetUserId = defaultUser.id;
      } else {
        const guest = await prisma.user.create({
          data: {
            email: 'customer@lessonlagoon.mv',
            name: 'Guest Customer',
            role: 'CUSTOMER',
          },
        });
        targetUserId = guest.id;
      }
    }

    const orderStatus = status || 'AWAITING_TRANSFER';
    const isFree = orderStatus === 'COMPLETED_FREE' || Number(total || 0) === 0;

    // 1. Create order and relational child items
    const order = await prisma.order.create({
      data: {
        no,
        userId: targetUserId,
        subtotal: BigInt(subtotal || 0),
        discount: BigInt(discount || 0),
        pointsUsed: pointsUsed || 0,
        pointsDiscount: BigInt(pointsDiscount || 0),
        printTotal: BigInt(printTotal || 0),
        deliveryFee: BigInt(deliveryFee || 0),
        total: BigInt(total || 0),
        status: isFree ? 'COMPLETED_FREE' : orderStatus,
        method: method || (isFree ? 'Free' : 'Bank transfer'),
        earnedPoints: earnedPoints || 0,
        items: {
          create: (items || []).map((it: any) => ({
            productId: it.pid,
            title: it.title,
            listPrice: BigInt(it.list || 0),
            finalPrice: BigInt(it.final || 0),
            format: it.format || 'digital',
            printItem: it.printDetails
              ? {
                  create: {
                    colour: it.printDetails.colour || 'colour',
                    binding: it.printDetails.binding || 'stapled',
                    paper: it.printDetails.paper || 'standard',
                    qty: it.printDetails.qty || 1,
                    unitPrice: BigInt(it.printDetails.unitPrice || 0),
                    lineTotal: BigInt(it.printDetails.lineTotal || 0),
                  },
                }
              : undefined,
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
        events: {
          create: [
            {
              event: isFree
                ? 'Order completed free · classroom downloads immediately unlocked'
                : 'Order placed · awaiting BML bank transfer',
            },
          ],
        },
      },
      include: {
        items: {
          include: {
            printItem: true,
          },
        },
        delivery: true,
        events: true,
      },
    });

    // 2. If points were used, deduct them from user and record in ledger
    if (pointsUsed && pointsUsed > 0) {
      const user = await prisma.user.findUnique({ where: { id: targetUserId } });
      if (user) {
        const newBalance = Math.max(0, user.points - pointsUsed);
        await prisma.user.update({
          where: { id: targetUserId },
          data: { points: newBalance },
        });

        await prisma.pointsLedger.create({
          data: {
            userId: targetUserId,
            points: -pointsUsed,
            balanceAfter: newBalance,
            type: 'PURCHASE_SPENT',
            status: 'spent',
            source: `Redeemed on order ${order.no}`,
          },
        });
      }
    }

    // 3. If free order, immediately grant entitlements and increment sales
    if (isFree) {
      for (const it of items || []) {
        if (it.pid) {
          await prisma.entitlement.upsert({
            where: {
              userId_productId: {
                userId: targetUserId,
                productId: it.pid,
              },
            },
            update: {},
            create: {
              userId: targetUserId,
              productId: it.pid,
            },
          });

          await prisma.product
            .update({
              where: { id: it.pid },
              data: { salesCount: { increment: 1 } },
            })
            .catch(() => {});
        }
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        no: order.no,
        uid: order.userId,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        pointsDiscount: Number(order.pointsDiscount),
        printTotal: Number(order.printTotal),
        deliveryFee: Number(order.deliveryFee),
        total: Number(order.total),
        status: order.status,
      },
    });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, orderNo, ...payload } = body;

    if (!orderNo) {
      return NextResponse.json({ error: 'orderNo is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { no: orderNo },
      include: {
        items: true,
        user: true,
        slip: true,
        delivery: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // ACTION: UPLOAD SLIP
    if (action === 'upload_slip') {
      const { amount, refNumber, senderName, fileUrl, fileHash, transferDate } = payload;
      const slipAmount = BigInt(amount != null ? amount : Number(order.total));
      const isMismatch = slipAmount !== order.total;

      // Duplicate hash detection across orders
      let isDuplicate = false;
      if (fileHash) {
        const existingHash = await prisma.paymentSlip.findFirst({
          where: {
            fileHash,
            orderId: { not: order.id },
          },
        });
        if (existingHash) isDuplicate = true;
      }

      await prisma.paymentSlip.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          amount: slipAmount,
          refNumber: refNumber || null,
          senderName: senderName || null,
          fileUrl: fileUrl || null,
          fileHash: fileHash || null,
          mismatchFlag: isMismatch,
          duplicateFlag: isDuplicate,
          transferDate: transferDate ? new Date(transferDate) : new Date(),
        },
        update: {
          amount: slipAmount,
          refNumber: refNumber || null,
          senderName: senderName || null,
          fileUrl: fileUrl || null,
          fileHash: fileHash || null,
          mismatchFlag: isMismatch,
          duplicateFlag: isDuplicate,
          transferDate: transferDate ? new Date(transferDate) : new Date(),
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'AWAITING_VERIFICATION' },
      });

      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          event: `Transfer slip uploaded (${senderName || 'Customer'}, Ref: ${refNumber || 'None'}) · awaiting verification`,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Slip uploaded successfully and queued for approval',
        status: 'AWAITING_VERIFICATION',
      });
    }

    // ACTION: APPROVE ORDER
    if (action === 'approve') {
      const { note } = payload;

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });

      // 1. Grant entitlements for every product
      for (const item of order.items) {
        await prisma.entitlement.upsert({
          where: {
            userId_productId: {
              userId: order.userId,
              productId: item.productId,
            },
          },
          update: {},
          create: {
            userId: order.userId,
            productId: item.productId,
          },
        });

        await prisma.product
          .update({
            where: { id: item.productId },
            data: { salesCount: { increment: 1 } },
          })
          .catch(() => {});
      }

      // 2. Award loyalty points (1 MVR = 10 points)
      // Earn points calculation: earnedPoints stored or total (in laari)/100 * 10
      const pointsToAward =
        order.earnedPoints > 0
          ? order.earnedPoints
          : Math.floor(Number(order.total) / 100) * 10;

      if (pointsToAward > 0) {
        const user = await prisma.user.findUnique({ where: { id: order.userId } });
        const newBalance = (user?.points || 0) + pointsToAward;

        await prisma.user.update({
          where: { id: order.userId },
          data: { points: newBalance },
        });

        await prisma.pointsLedger.create({
          data: {
            userId: order.userId,
            points: pointsToAward,
            balanceAfter: newBalance,
            type: 'PURCHASE_EARN',
            status: 'available',
            source: `Order #${order.no} purchase rewards (1 MVR = 10 pts)`,
          },
        });
      }

      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          event: note || 'Payment verified & approved by admin · downloads unlocked and loyalty points awarded',
        },
      });

      return NextResponse.json({
        success: true,
        message: `Order ${order.no} approved, entitlements granted and points awarded`,
        status: 'PAID',
      });
    }

    // ACTION: REJECT ORDER
    if (action === 'reject') {
      const { reason } = payload;
      const rejectNote = reason || 'Amount mismatch or invalid transfer receipt';

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAYMENT_REJECTED' },
      });

      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          event: `Payment slip rejected: ${rejectNote}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Order ${order.no} marked rejected`,
        status: 'PAYMENT_REJECTED',
      });
    }

    // ACTION: UPDATE PRINT FULFILLMENT STATUS
    if (action === 'update_print') {
      const { printStatus, trackingNote } = payload;

      if (order.delivery) {
        await prisma.orderDelivery.update({
          where: { orderId: order.id },
          data: {
            status: printStatus,
            ...(trackingNote ? { trackingNote } : {}),
          },
        });
      }

      await prisma.orderEvent.create({
        data: {
          orderId: order.id,
          event: `Print status updated to ${printStatus}${trackingNote ? ` - Note: ${trackingNote}` : ''}`,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Print status updated to ${printStatus}`,
      });
    }

    // ACTION: GENERAL STATUS UPDATE
    if (action === 'status') {
      const { status: newStatus, note } = payload;

      await prisma.order.update({
        where: { id: order.id },
        data: { status: newStatus },
      });

      if (note) {
        await prisma.orderEvent.create({
          data: {
            orderId: order.id,
            event: note,
          },
        });
      }

      return NextResponse.json({ success: true, status: newStatus });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
