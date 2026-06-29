import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSession,
  getSessionMaxAge,
  isAdminConfigured,
  verifyAdminCredentials,
  verifyAdminSession,
} from "../../../lib/adminAuth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const cookieStore = await cookies();

  return NextResponse.json({
    authenticated: verifyAdminSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value),
    configured: isAdminConfigured(),
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Partial<{ password: string; username: string }>;
  const username = body.username || "";
  const result = verifyAdminCredentials({ password: body.password || "", username });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 401 });
  }

  const response = NextResponse.json({ message: result.message });

  response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSession(username), {
    httpOnly: true,
    maxAge: getSessionMaxAge(),
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ message: "Signed out." });

  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
