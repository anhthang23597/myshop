import jwt from "jsonwebtoken";

export const SESSION_COOKIE_NAME = "admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 2; // 2 hours

const SESSION_SECRET =
  process.env.SESSION_SECRET || process.env.JWT_SECRET || "dev-session-secret";

export function createAdminSessionToken() {
  return jwt.sign({ role: "admin" }, SESSION_SECRET, {
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function isValidAdminSessionToken(token?: string) {
  if (!token) return false;

  try {
    const decoded = jwt.verify(token, SESSION_SECRET) as { role?: string };
    return decoded?.role === "admin";
  } catch {
    return false;
  }
}

export function getAdminSessionCookieValue(req: Request) {
  const cookieHeader = req.headers.get("cookie") || "";
  const cookies = cookieHeader.split(";").map((item) => item.trim());
  const target = cookies.find((item) =>
    item.startsWith(`${SESSION_COOKIE_NAME}=`)
  );
  return target ? decodeURIComponent(target.split("=").slice(1).join("=")) : "";
}

export function isAdminSession(req: Request) {
  return isValidAdminSessionToken(getAdminSessionCookieValue(req));
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  };
}
