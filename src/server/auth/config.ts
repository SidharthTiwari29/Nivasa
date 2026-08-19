import Google from 'next-auth/providers/google';
import Email from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { NextAuthConfig } from 'next-auth';
import { prisma } from '@/server/db/prisma';
import type { Role } from '@/server/auth/rbac';

const providers: NonNullable<NextAuthConfig['providers']> = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.EMAIL_SERVER && process.env.EMAIL_FROM) {
  providers.push(
    Email({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  );
}

export function assertAuthConfigured(): void {
  if (providers.length === 0) {
    throw new Error('NOT_CONFIGURED: no Auth.js provider credentials are configured');
  }
  if (!process.env.NEXTAUTH_SECRET || process.env.NEXTAUTH_SECRET.length < 32) {
    throw new Error('NOT_CONFIGURED: NEXTAUTH_SECRET must be at least 32 characters');
  }
}

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 30 },
  trustHost: true,
  providers,
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role as Role;
      }
      return session;
    },
  },
};
