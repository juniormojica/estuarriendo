import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedPaths = [
  '/publicar',
  '/editar-propiedad',
  '/dashboard',
  '/mis-propiedades',
  '/perfil',
  '/mi-perfil',
  '/busco-inmueble',
  '/payment-success',
  '/oportunidades',
  '/admin',
  '/super-admin',
];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('estuarriendo_token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/publicar/:path*',
    '/editar-propiedad/:path*',
    '/dashboard/:path*',
    '/mis-propiedades/:path*',
    '/perfil/:path*',
    '/mi-perfil/:path*',
    '/busco-inmueble/:path*',
    '/payment-success/:path*',
    '/oportunidades/:path*',
    '/admin/:path*',
    '/super-admin/:path*',
  ],
};
