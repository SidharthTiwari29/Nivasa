import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Email from "next-auth/providers/email";
import { getEnv } from "@/server/config/env";

const env = getEnv();
const providers = [];
if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) providers.push(Google({ clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET }));
if (env.EMAIL_SERVER && env.EMAIL_FROM) providers.push(Email({ server: env.EMAIL_SERVER, from: env.EMAIL_FROM }));

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  trustHost: false,
  session: { strategy: "jwt" },
});
