import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/login", "/auth/signOtp"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionId = req.cookies.get("sessionId")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (pathname === "/") {
    if (sessionId && refreshToken) {
      return NextResponse.redirect(new URL("/workspace/business", req.url));
    } else {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
  }

  if (!sessionId || !refreshToken) {
    if (!publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  if (
    sessionId &&
    refreshToken &&
    publicRoutes.some((route) => pathname.startsWith(route))
  ) {
    return NextResponse.redirect(new URL("/workspace/business", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
