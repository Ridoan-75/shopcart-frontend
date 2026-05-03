import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = [
  "/",
  "/products",
  "/categories",
  "/brands",
  "/flash-sale",
  "/blog",
  "/about",
  "/contact",
  "/faq",
];

const AUTH_ROUTES = [
  "/login",
  "/register",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

const USER_ROUTES = ["/user"];
const SELLER_ROUTES = ["/seller"];
const ADMIN_ROUTES = ["/admin"];

function getTokenFromRequest(request: NextRequest): {
  accessToken: string | null;
  user: { role: string } | null;
} {
  try {
    const authStorage = request.cookies.get("auth-storage")?.value;
    if (!authStorage) return { accessToken: null, user: null };

    const parsed = JSON.parse(decodeURIComponent(authStorage));
    const state = parsed?.state;

    return {
      accessToken: state?.accessToken ?? null,
      user: state?.user ?? null,
    };
  } catch {
    return { accessToken: null, user: null };
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { accessToken, user } = getTokenFromRequest(request);

  const isAuthenticated = !!accessToken && !!user;
  const role = user?.role;

  // Auth routes — already logged in হলে dashboard এ পাঠাও
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isAuthRoute && isAuthenticated) {
    if (role === "ADMIN") {
      return NextResponse.redirect(
        new URL("/admin/overview", request.url)
      );
    }
    if (role === "SELLER") {
      return NextResponse.redirect(
        new URL("/seller/overview", request.url)
      );
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // User routes
  const isUserRoute = USER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isUserRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${pathname}`, request.url)
      );
    }
    if (role !== "USER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Seller routes
  const isSellerRoute = SELLER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isSellerRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${pathname}`, request.url)
      );
    }
    if (role !== "SELLER") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Admin routes
  const isAdminRoute = ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${pathname}`, request.url)
      );
    }
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Dashboard route
  if (pathname === "/dashboard") {
    if (!isAuthenticated) {
      return NextResponse.redirect(
        new URL("/login?redirect=/dashboard", request.url)
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|icons|fonts).*)",
  ],
};