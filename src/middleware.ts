import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  const publicPrefixes = [
    "/login",
    "/signup",
    "/adminlogin",
    "/services",
    "/how-it-works",
    "/become-a-provider",
    "/support",
    "/faq",
    "/terms",
    "/privacy"
  ];
  return publicPrefixes.some(prefix => pathname.startsWith(prefix));
}

/**
 * Role-based route protection and automatic dashboard redirection.
 * - "/"          -> redirects logged-in users to their role dashboard
 * - "/admin/*"    -> only ADMIN or SUPER_ADMIN
 * - "/provider/*" -> only PROVIDER (except onboarding which is public-adjacent)
 * - "/customer/*" -> only CUSTOMER
 */
export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const role = req.nextauth.token?.role;
    const isProviderDraft = req.nextauth.token?.isProviderDraft;

    // 0. Enforce onboarding completion for draft providers.
    // They are locked out of all routes (except their onboarding page and API endpoints).
    if (role === "PROVIDER" && isProviderDraft && pathname !== "/provider/onboarding") {
      return NextResponse.redirect(new URL("/provider/onboarding", req.url));
    }

    // 1. Dashboard redirection for logged-in users visiting root page
    if (pathname === "/" && role) {
      if (role === "ADMIN" || role === "SUPER_ADMIN") {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      if (role === "PROVIDER") {
        return NextResponse.redirect(new URL("/provider", req.url));
      }
      if (role === "CUSTOMER") {
        return NextResponse.redirect(new URL("/customer", req.url));
      }
    }

    // 1b. Redirect admins away from all public/marketing pages to their dashboard
    // Admins should only ever see admin pages, not the public marketplace.
    if (role === "ADMIN" || role === "SUPER_ADMIN") {
      const adminOnlyRedirectPrefixes = [
        "/services",
        "/how-it-works",
        "/become-a-provider",
        "/login",
        "/signup",
        "/choose-role",
        "/faq",
        "/terms",
        "/privacy",
        "/support",
      ];
      if (adminOnlyRedirectPrefixes.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
    }

    // 2. Admin Protection
    if (
      (pathname === "/admin" || pathname.startsWith("/admin/")) &&
      role !== "ADMIN" &&
      role !== "SUPER_ADMIN"
    ) {
      if (!role) {
        const callbackUrl = encodeURIComponent(req.nextUrl.pathname + req.nextUrl.search);
        return NextResponse.redirect(new URL(`/adminlogin?callbackUrl=${callbackUrl}`, req.url));
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    // 3. Provider Protection
    if (
      pathname.startsWith("/provider") &&
      !pathname.startsWith("/provider/onboarding") &&
      role !== "PROVIDER"
    ) {
      return NextResponse.redirect(new URL("/become-a-provider", req.url));
    }

    // 4. Customer Protection
    if (pathname.startsWith("/customer") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", pathname);
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;
        // Allow public/guest access to public routes
        if (isPublicRoute(pathname)) {
          return true;
        }
        return !!token;
      },
    },
    pages: { signIn: "/login" },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - uploads (uploaded files so they can be viewed)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|uploads).*)",
  ],
};
