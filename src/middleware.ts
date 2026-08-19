import { auth } from '@/server/auth';

export default auth((request) => {
  const pathname = request.nextUrl.pathname;
  const protectedRoute = pathname.startsWith('/app') || pathname.startsWith('/api/protected');
  if (protectedRoute && !request.auth?.user) {
    return Response.json({ ok: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required' } }, { status: 401 });
  }
});

export const config = {
  matcher: ['/app/:path*', '/api/protected/:path*'],
};
