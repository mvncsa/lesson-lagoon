import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySliderResponse } from '@/lib/sliderCaptcha';

export async function GET() {
  try {
    const requests = await prisma.resourceRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const serialized = requests.map((r) => ({
      id: r.id,
      email: r.email,
      text: r.text,
      grade: r.grade || 'Primary (Grades 1-5)',
      type: r.type || 'Worksheets & Printables',
      status: r.status,
      count: r.count,
      linkedProductId: r.linkedProductId || undefined,
      note: r.note || undefined,
      createdAt: r.createdAt.toISOString().slice(0, 10),
    }));

    return NextResponse.json({ success: true, requests: serialized });
  } catch (error: any) {
    console.error('Error fetching resource requests:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      text,
      subjectId,
      grade,
      type,
      notify,
      marketingConsent,
      captchaToken,
      captchaPosition,
      captchaTimeTakenMs,
    } = body;

    // Verify Slider CAPTCHA
    if (captchaToken && captchaPosition != null) {
      const captchaResult = verifySliderResponse(captchaToken, captchaPosition, captchaTimeTakenMs || 1500);
      if (!captchaResult.valid) {
        return NextResponse.json(
          { success: false, error: captchaResult.reason || 'CAPTCHA verification failed' },
          { status: 400 }
        );
      }
    }

    const newRequest = await prisma.resourceRequest.create({
      data: {
        email,
        text,
        subjectId,
        grade,
        type,
        notify: notify ?? true,
        marketingConsent: marketingConsent ?? false,
        status: 'New',
        count: 1,
      },
    });

    return NextResponse.json({
      success: true,
      request: {
        id: newRequest.id,
        email: newRequest.email,
        text: newRequest.text,
        grade: newRequest.grade,
        type: newRequest.type,
        status: newRequest.status,
        count: newRequest.count,
        createdAt: newRequest.createdAt.toISOString().slice(0, 10),
      },
    });
  } catch (error: any) {
    console.error('Error creating resource request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, linkedProductId, note } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updated = await prisma.resourceRequest.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(linkedProductId !== undefined ? { linkedProductId } : {}),
        ...(note !== undefined ? { note } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      request: {
        id: updated.id,
        status: updated.status,
        linkedProductId: updated.linkedProductId,
        note: updated.note,
      },
    });
  } catch (error: any) {
    console.error('Error updating resource request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
