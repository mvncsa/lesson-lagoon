import { handlers } from '@/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // Never expose an unstyled NextAuth error page that could trigger Safe Browsing alerts
  if (req.nextUrl.pathname.endsWith('/error')) {
    return NextResponse.redirect(new URL('/', req.url));
  }
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  return handlers.POST(req);
}
