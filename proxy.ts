import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// Route protection is NOT done here: every page under app/(app) calls
// `await auth.protect()` itself (Clerk v7 guidance). The proxy only reads the
// session and sends signed-in visitors from the landing straight to the app.
export default clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname !== '/') return;

  const { isAuthenticated } = await auth();
  if (isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for Clerk's auto-proxy path
    '/__clerk/:path*',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
