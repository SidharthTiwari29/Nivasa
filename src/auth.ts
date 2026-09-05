import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getEnv } from "@/server/config/env";
import { prisma } from "@/server/db/prisma";
import { handleUserCreated } from "@/server/auth/onUserCreated";
import type { Role } from "@prisma/client";

const env = getEnv();
const providers = [];
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
  providers.push(
    Google({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  );
if (env.EMAIL_SERVER && env.EMAIL_FROM)
  providers.push(Email({ server: env.EMAIL_SERVER, from: env.EMAIL_FROM }));

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  // Real, necessary for deployment on Vercel: without this, Auth.js
  // rejects every real request with UntrustedHost, since it cannot
  // otherwise verify the incoming Host header on its own. Vercel's own
  // edge network is what terminates and routes these requests - the
  // Host header reaching this app is genuinely controlled by Vercel's
  // infrastructure, not an arbitrary, spoofable proxy - which is
  // exactly why Auth.js's own documented Vercel deployment guidance
  // recommends this setting.
  trustHost: true,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true },
        });
        if (dbUser) token.role = dbUser.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = (token.role as Role) ?? "USER";
      }
      return session;
    },
  },
  events: {
    // Fires exactly once, when a brand-new user account is actually
    // created (not on every subsequent login) - the real, correct hook
    // for a one-time signup grant. See onUserCreated.ts for the actual
    // logic and its tests - kept out of this file since NextAuth config
    // objects aren't unit-testable the way a plain function is.
    async createUser({ user }) {
      if (user.id) await handleUserCreated(user.id);
    },
  },
});
