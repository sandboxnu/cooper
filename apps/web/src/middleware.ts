import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Session validation and route protection is handled in layouts.
// This middleware exists as a placeholder for future middleware needs
// (e.g. rate limiting, geolocation, A/B testing).
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
