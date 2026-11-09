import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySliderResponse } from '@/lib/sliderCaptcha';

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

    return NextResponse.json({ success: true, request: newRequest });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
