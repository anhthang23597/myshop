import { isAdmin } from "@/lib/auth";
import {
  createAdminSessionToken,
  getSessionCookieOptions,
  SESSION_COOKIE_NAME,
} from "@/lib/session";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (!isAdmin(username, password)) {
    return Response.json(
      { ok: false, error: "Sai tài khoản hoặc mật khẩu." },
      { status: 401 }
    );
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(
    SESSION_COOKIE_NAME,
    createAdminSessionToken(),
    getSessionCookieOptions()
  );
  return res;
}