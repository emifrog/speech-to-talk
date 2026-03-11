import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// ===========================================
// Middleware Next.js — Session refresh + routing
// ===========================================

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

  // Refresh session cookies (important pour garder la session active)
  const { supabaseResponse } = await updateSession(request);

  // Rediriger la racine vers /translate
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/translate', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav|js|css|json)$).*)',
  ],
};
