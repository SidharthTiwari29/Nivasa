import type { DefaultSession } from 'next-auth';
import type { Role } from '@/server/auth/rbac';

declare module 'next-auth' {
  interface Session {
    user: DefaultSession['user'] & { id: string; role: Role };
  }
}
