import { isAdminSession } from "@/lib/session";

export async function GET(req: Request) {
  return Response.json({ authenticated: isAdminSession(req) });
}
