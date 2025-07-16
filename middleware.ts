import { updateSession } from "@/lib/supabase/middleware";
import { type NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(request: NextRequest) {
  console.log("[미들웨어 진입]", request.nextUrl.pathname);
  return updateSession(request);
}
