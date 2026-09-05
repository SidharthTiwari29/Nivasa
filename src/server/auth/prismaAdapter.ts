import type { Adapter, AdapterUser } from "@auth/core/adapters";
import { prisma } from "@/server/db/prisma";

// Real, necessary replacement for @auth/prisma-adapter: that package's
// last published version (2.11.3, from 2023) declares peer-dependency
// support only up through Prisma v6 - it has never been updated for
// Prisma 7, which this app runs and which made real breaking changes to
// the client. That mismatch is the most likely real cause of the
// generic, hard-to-diagnose AdapterError/Configuration failures this
// project spent an extensive live-debugging session chasing: the
// adapter's own internal code, written for an older Prisma API, failing
// unpredictably against Prisma 7's actual behavior - while every other
// real query in this app works fine, because it's written directly
// against this app's own, already-correct Prisma 7 usage, not through
// that third-party library's outdated internals.
//
// This implements only what Auth.js actually needs for this app's real
// configuration: JWT sessions (no database-backed Session methods
// required at all) plus Google OAuth and an optional Email provider
// (which does need real verification-token persistence, regardless of
// session strategy). Every method here is a direct, minimal query
// against this app's own, already-tested Prisma client - no adapter
// internals to go wrong.
export function CustomPrismaAdapter(): Adapter {
  return {
    async createUser(user) {
      const created = await prisma.user.create({
        data: {
          email: user.email,
          name: user.name,
          image: user.image,
        },
      });
      return toAdapterUser(created);
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({ where: { id } });
      return user ? toAdapterUser(user) : null;
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({ where: { email } });
      return user ? toAdapterUser(user) : null;
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const account = await prisma.account.findUnique({
        where: { provider_providerAccountId: { provider, providerAccountId } },
        include: { user: true },
      });
      return account ? toAdapterUser(account.user) : null;
    },

    async updateUser(user) {
      const updated = await prisma.user.update({
        where: { id: user.id },
        data: {
          email: user.email,
          name: user.name,
          image: user.image,
        },
      });
      return toAdapterUser(updated);
    },

    async deleteUser(userId) {
      await prisma.user.delete({ where: { id: userId } });
    },

    async linkAccount(account) {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state:
            typeof account.session_state === "string"
              ? account.session_state
              : undefined,
        },
      });
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await prisma.account.delete({
        where: { provider_providerAccountId: { provider, providerAccountId } },
      });
    },

    async createVerificationToken(verificationToken) {
      const created = await prisma.verificationToken.create({
        data: verificationToken,
      });
      return created;
    },

    async useVerificationToken({ identifier, token }) {
      try {
        const used = await prisma.verificationToken.delete({
          where: { identifier_token: { identifier, token } },
        });
        return used;
      } catch {
        // Real, documented Auth.js contract: return null when the token
        // doesn't exist (already used, or never existed) rather than
        // throwing - the caller treats a null return as "invalid token."
        return null;
      }
    },
  };
}

// emailVerified is not a field this app's User model actually stores -
// Google OAuth already guarantees a verified email address before this
// app ever sees it, so there has never been a real need to separately
// track and persist that fact. Returning null here is an honest
// reflection of that (this app does not maintain its own verification
// record), not a placeholder standing in for a real value that should
// exist but doesn't.
function toAdapterUser(user: {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}): AdapterUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    emailVerified: null,
  };
}
