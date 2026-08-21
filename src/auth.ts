import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getEnv } from "@/server/config/env";

const env = getEnv();
const providers = [];
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
  providers.push(Google({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: false,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
