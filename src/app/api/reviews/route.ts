import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_REVIEWS } from '@/lib/data';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status') || 'approved';

    const dbReviews = await prisma.review.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });

    if (dbReviews.length === 0) {
      const filtered = INITIAL_REVIEWS.filter((r) => {
        if (productId && r.pid !== productId) return false;
        if (status && r.status !== status) return false;
        return true;
      });
      return NextResponse.json({ success: true, reviews: filtered });
    }

    const reviews = dbReviews.map((r) => ({
      id: r.id,
      pid: r.productId,
      userId: r.userId,
      userName: r.name || r.user?.name || 'Verified Teacher',
      rating: r.rating,
      date: r.createdAt.toISOString().slice(0, 10),
      text: r.text,
      verified: r.verifiedType !== 'unverified',
      helpful: r.helpfulCount,
      status: r.status,
      photos: r.tags ? JSON.parse(r.tags) : [],
      ownerReply: r.ownerReply || undefined,
    }));

    return NextResponse.json({ success: true, reviews });
  } catch (err: any) {
    console.error('Error fetching reviews:', err);
    return NextResponse.json({ error: err.message || 'Database error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, userId, userName, rating, text, photos } = body;

    if (!productId || !rating || !text) {
      return NextResponse.json(
        { error: 'productId, rating, and text are required' },
        { status: 400 }
      );
    }

    let isVerified = false;
    if (userId) {
      const entitlement = await prisma.entitlement.findFirst({
        where: { userId, productId },
      });
      isVerified = Boolean(entitlement);
    }

    const review = await prisma.review.create({
      data: {
        productId,
        userId: userId || null,
        name: userName || 'Teacher',
        rating: Number(rating),
        text,
        tags: photos ? JSON.stringify(photos) : null,
        verifiedType: isVerified ? 'paid' : 'free',
        status: 'pending',
        helpfulCount: 0,
      },
    });

    return NextResponse.json({
      success: true,
      review: {
        id: review.id,
        pid: review.productId,
        rating: review.rating,
        text: review.text,
        status: review.status,
        verified: review.verifiedType !== 'unverified',
      },
    });
  } catch (err: any) {
    console.error('Error creating review:', err);
    return NextResponse.json({ error: err.message || 'Error creating review' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { reviewId, action, reply, status } = body;

    if (!reviewId || !action) {
      return NextResponse.json({ error: 'reviewId and action required' }, { status: 400 });
    }

    if (action === 'vote_helpful') {
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
      return NextResponse.json({ success: true, helpfulVotes: updated.helpfulCount });
    }

    if (action === 'reply' && reply) {
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: {
          ownerReply: reply,
          repliedAt: new Date(),
        },
      });
      return NextResponse.json({ success: true, ownerReply: updated.ownerReply });
    }

    if (action === 'moderate' && status) {
      const updated = await prisma.review.update({
        where: { id: reviewId },
        data: { status },
      });
      return NextResponse.json({ success: true, status: updated.status });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating review:', err);
    return NextResponse.json({ error: err.message || 'Error updating review' }, { status: 500 });
  }
}
