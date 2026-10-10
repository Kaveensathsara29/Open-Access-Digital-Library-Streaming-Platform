import { NextRequest, NextResponse } from "next/server";
import { signAdminToken } from "@/lib/jwt";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const limiter = rateLimit(ip, 10, 60_000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please wait a minute." },
        { status: 429 }
      );
    }

    const body: unknown = await req.json();
    if (
      !body ||
      typeof body !== "object" ||
      !("email" in body) ||
      !("password" in body) ||
      typeof body.email !== "string" ||
      typeof body.password !== "string" ||
      !body.email.trim() ||
      !body.password
    ) {
      return NextResponse.json(
        { error: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminEmail || !adminPassword || !process.env.JWT_SECRET) {
      console.error("ADMIN_EMAIL, ADMIN_PASSWORD, and JWT_SECRET must be configured.");
      return NextResponse.json(
        { error: "Admin authentication is not configured." },
        { status: 500 }
      );
    }

    if (
      body.email.trim().toLowerCase() !== adminEmail.trim().toLowerCase() ||
      body.password !== adminPassword
    ) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const token = await signAdminToken({ email: adminEmail, role: "admin" });
    const response = NextResponse.json({
      success: true,
      message: "Logged in successfully as administrator.",
    });

    response.cookies.set({
      name: "admin_token",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Internal server error during login." },
      { status: 500 }
    );
  }
}
