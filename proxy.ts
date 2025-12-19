import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/login", "/auth/signOtp"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionId = req.cookies.get("sessionId")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  if (!sessionId || !refreshToken) {
    if (!publicRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  if (sessionId && refreshToken && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/workspace/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
