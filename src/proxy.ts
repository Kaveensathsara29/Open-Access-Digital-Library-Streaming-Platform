import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/jwt";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const authorization = req.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const token =
    req.cookies.get("admin_token")?.value ||
    (pathname.startsWith("/api/admin/") ? bearerToken : undefined);
  const session = token ? await verifyAdminToken(token) : null;
  if (session) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    return NextResponse.json(
      { error: "Administrator authentication required." },
      { status: 401 }
    );
  }

  return NextResponse.redirect(new URL("/admin/login", req.url));
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};


