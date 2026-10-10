import { jwtVerify, SignJWT } from "jose";
import { NextRequest } from "next/server";

export interface AdminTokenPayload {
  email: string;
  role: "admin";
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured.");
  }

  return new TextEncoder().encode(secret);
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(getJwtSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.email !== "string" || payload.role !== "admin") {
      return null;
    }

    return { email: payload.email, role: "admin" };
  } catch {
    return null;
  }
}

export async function getAdminSession(req: NextRequest): Promise<AdminTokenPayload | null> {
  const cookieToken = req.cookies.get("admin_token")?.value;
  const authorization = req.headers.get("authorization");
  const bearerToken = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : undefined;
  const token = cookieToken || bearerToken;

  return token ? verifyAdminToken(token) : null;
}
