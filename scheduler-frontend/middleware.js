import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up',
    '/privacy',
    '/terms',
  ];

  // Dynamic public routes (username/event pages)
  const isDynamicPublicRoute = pathname.match(/^\/[^\/]+\/[^\/]+$/);
  const isUsernameRoute = pathname.match(/^\/[^\/]+$/) &&
                          !pathname.startsWith('/dashboard') &&
                          !pathname.startsWith('/events') &&
                          !pathname.startsWith('/meetings') &&
                          !pathname.startsWith('/availability') &&
                          !pathname.startsWith('/sign-in') &&
                          !pathname.startsWith('/sign-up');

  // Check if the route is public
  const isPublicRoute = publicRoutes.includes(pathname) ||
                        isDynamicPublicRoute ||
                        isUsernameRoute;

  // For non-public routes, the authentication check happens on the client side
  // via the AuthContext and useAuth hook
  // This middleware is primarily for routing logic

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
