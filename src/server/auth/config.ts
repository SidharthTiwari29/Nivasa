import Google from 'next-auth/providers/google';
import Email from 'next-auth/providers/email';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { NextAuthConfig } from 'next-auth';
import { prisma } from '@/server/db/prisma';
import { parseEnv, requireConfigured } from '@/server/config/env';
import type { Role } from '@/server/auth/rbac';

const env = parseEnv();

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database', maxAge: 60 * 60 * 24 * 30 },
  trustHost: true,
  providers: [
    Google({
      clientId: requireConfigured(env.GOOGLE_CLIENT_ID, 'GOOGLE_CLIENT_ID'),
      clientSecret: requireConfigured(env.GOOGLE_CLIENT_SECRET, 'GOOGLE_CLIENT_SECRET'),
    }),
    Email({
      server: requireConfigured(env.EMAIL_SERVER, 'EMAIL_SERVER'),
      from: requireConfigured(env.EMAIL_FROM, 'EMAIL_FROM'),
    }),
  ],
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
