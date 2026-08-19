import { auth } from '@/server/auth';
import { fail, ok } from '@/server/api/response';
import { createProperty, listProperties } from '@/server/services/propertyService';

export async function GET() {
  const session = await auth();
  if (!session?.user) return fail('UNAUTHENTICATED', 'Authentication required', 401);
  return ok(await listProperties(session.user.id));
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return fail('UNAUTHENTICATED', 'Authentication required', 401);

  try {
    return ok(await createProperty(session.user.id, await request.json()), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') return fail('VALIDATION_ERROR', error.message, 422);
    return fail('INTERNAL_ERROR', 'Unable to create property', 500);
  }
}
