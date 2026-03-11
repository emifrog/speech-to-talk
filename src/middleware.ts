import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// ===========================================
// Middleware Next.js — Protection des routes
// ===========================================

// Routes protégées (nécessitent une authentification)
const protectedRoutes = [
  '/translate',
  '/conversation',
  '/scan',
  '/emergency',
  '/contact',
  '/settings',
  '/history',
];

// Routes publiques (accessibles sans authentification)
const publicRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignorer les fichiers statiques et API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/sw.js') ||
    pathname.startsWith('/manifest.json') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const { user, supabaseResponse } = await updateSession(request);

  // Si l'utilisateur est sur une route protégée sans être connecté
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Si l'utilisateur est connecté et accède à une page auth, rediriger vers /translate
  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + '/')
  );

  if (isPublicRoute && user) {
    return NextResponse.redirect(new URL('/translate', request.url));
  }

  // Rediriger la racine vers /translate si connecté, /auth/login sinon
  if (pathname === '/') {
    if (user) {
      return NextResponse.redirect(new URL('/translate', request.url));
    }
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav|js|css|json)$).*)',
  ],
};
