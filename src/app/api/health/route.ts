import { ok } from '@/server/api/response';

export function GET() {
  return ok({ service: 'nivasa', phase: '0' });
}
