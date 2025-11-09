import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes (no auth needed)
const isPublicRoute = createRouteMatcher([
  '/',
  '/login(.*)',
  '/feedback',              // Redirects to /feedback/features
  '/feedback/features',     // Can VIEW feature requests
  '/feedback/bugs',         // Can VIEW bug reports
  '/feedback/[slug]',       // Can VIEW feedback detail
  '/feedback/roadmap',      // Can VIEW roadmap
  '/feedback/changelog',    // Can VIEW changelog
]);

// Feedback interaction routes (auth required, no tenant needed)
const isFeedbackRoute = createRouteMatcher([
  '/feedback/api(.*)',      // API routes for feedback actions
]);

export default clerkMiddleware(async (auth, request) => {
  // Public routes - allow everyone
  if (isPublicRoute(request)) {
    return;
  }

  // All other routes require authentication
  await auth.protect();

  // Note: We don't enforce tenant_id in middleware for feedback routes
  // because feedback-only users (tenant_id = null) should be able to interact
  // Tenant validation for dashboard routes is handled by RLS policies and server actions
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
