import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

const authProviders = [];
if (googleClientId && googleClientSecret) {
  authProviders.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    'lessonlagoon-auth-secret-key-32chars-min-2026',
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  providers: authProviders,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        (session.user as any).role = (user as any).role || 'CUSTOMER';
        (session.user as any).points = (user as any).points ?? 50;
        (session.user as any).referralCode = (user as any).referralCode;
      }
      return session;
    },
    async signIn({ user }) {
      if (user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });
        if (dbUser?.isBlocked) {
          return false;
        }
      }
      return true;
    },
  },
  events: {
    async createUser({ user }) {
      if (user.id) {
        const base = (user.name || user.email || 'USER')
          .replace(/[^a-zA-Z]/g, '')
          .slice(0, 6)
          .toUpperCase() || 'USER';
        const rand = Math.floor(10 + Math.random() * 90);
        const referralCode = `${base}${rand}`;

        const adminEmails = (process.env.ADMIN_EMAILS || 'owner@lessonlagoon.mv')
          .split(',')
          .map((e) => e.trim().toLowerCase());
        const isAdmin = user.email && adminEmails.includes(user.email.toLowerCase());

        try {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              referralCode,
              points: 50,
              role: isAdmin ? 'ADMIN' : 'CUSTOMER',
            },
          });

          await prisma.pointsLedger.create({
            data: {
              userId: user.id,
              points: 50,
              type: 'SIGNUP_BONUS',
              balanceAfter: 50,
              status: 'available',
              source: 'Welcome sign-up reward bonus',
            },
          });
        } catch (e) {
          console.error('Error post-processing created user:', e);
        }
      }
    },
  },
});
