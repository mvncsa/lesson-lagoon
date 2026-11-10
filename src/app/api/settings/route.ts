import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const settings = await prisma.pricingSetting.findMany();
    const map: Record<string, any> = {};

    settings.forEach((s) => {
      try {
        map[s.key] = JSON.parse(s.value);
      } catch {
        map[s.key] = s.value;
      }
    });

    return NextResponse.json({ success: true, settings: map });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { settings } = body;

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'settings object required' }, { status: 400 });
    }

    const updates = Object.entries(settings).map(([key, val]) => {
      const strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      return prisma.pricingSetting.upsert({
        where: { key },
        create: {
          key,
          value: strVal,
          defaultValue: strVal,
        },
        update: {
          value: strVal,
        },
      });
    });

    await prisma.$transaction(updates);

    return NextResponse.json({ success: true, message: 'Settings saved successfully' });
  } catch (error: any) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
