import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

  if (!token && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!token && pathname.startsWith("/employee")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/employee/:path*",
    "/hr/:path*",
    "/manager/:path*",
    "/finance/:path*",
  ],
};
