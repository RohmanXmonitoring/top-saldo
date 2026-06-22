import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/firebase/admin';

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const path = request.nextUrl.pathname;
  
  // Public paths
  const publicPaths = ['/login', '/register', '/forgot-password'];
  const isPublicPath = publicPaths.includes(path);
  
  // Admin paths
  const isAdminPath = path.startsWith('/admin');
  
  // API paths
  const isApiPath = path.startsWith('/api');
  
  // Redirect to login if no session and trying to access protected route
  if (!session && !isPublicPath && !isApiPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(loginUrl);
  }
  
  // Validate session
  if (session && !isApiPath) {
    try {
      const decodedToken = await auth.verifyIdToken(session);
      
      // Check if user is admin for admin routes
      if (isAdminPath) {
        const userRecord = await auth.getUser(decodedToken.uid);
        const claims = userRecord.customClaims || {};
        
        if (claims.role !== 'admin') {
          return NextResponse.redirect(new URL('/dashboard', request.url));
        }
      }
      
      // Redirect to dashboard if logged in and trying to access public page
      if (isPublicPath) {
        const userRecord = await auth.getUser(decodedToken.uid);
        const claims = userRecord.customClaims || {};
        
        if (claims.role === 'admin') {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      
      return NextResponse.next();
    } catch (error) {
      // Invalid session
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('session');
      return response;
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/topup/:path*',
    '/transactions/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/forgot-password',
  ],
};
