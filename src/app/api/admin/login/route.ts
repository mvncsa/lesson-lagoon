import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    const expectedUser = process.env.ADMIN_USERNAME || 'admin';
    const expectedPass = process.env.ADMIN_PASSWORD || 'Lagoon@12#';

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (username.trim() !== expectedUser || password !== expectedPass) {
      return NextResponse.json(
        { error: 'Invalid admin username or password' },
        { status: 401 }
      );
    }

    const adminEmail = 'owner@lessonlagoon.mv';

    // Upsert admin user in database
    const dbAdmin = await prisma.user.upsert({
      where: { email: adminEmail },
      create: {
        name: 'LessonLagoon Owner',
        email: adminEmail,
        role: 'ADMIN',
        points: 1000,
      },
      update: {
        role: 'ADMIN',
      },
    });

    // Authentication succeeded
    const adminToken =
      'adm_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);

    const response = NextResponse.json({
      success: true,
      user: {
        id: dbAdmin.id,
        name: dbAdmin.name || 'LessonLagoon Owner',
        email: dbAdmin.email,
        role: 'ADMIN',
      },
    });

    // Set secure cookie
    response.cookies.set('admin_session', adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (err: any) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { error: err.message || 'Authentication error' },
      { status: 500 }
    );
  }
}
