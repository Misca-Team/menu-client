import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/login", "/auth/signOtp", "/auth/register"];
const apiRoutes = ["/api/"];
const privateRoutes = ["/workspace/", "/dashboard/", "/profile/"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const sessionId = req.cookies.get("sessionId")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;
  const hasValidTokens = !!(sessionId && refreshToken);

  if (hasValidTokens) {
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      const redirectUrl = new URL("/workspace/business", req.url);
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.next();
  } else {
    if (publicRoutes.some((route) => pathname.startsWith(route))) {
      return NextResponse.next();
    }

    const redirectUrl = new URL("/auth/login", req.url);

    redirectUrl.searchParams.set("redirect", pathname);

    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
