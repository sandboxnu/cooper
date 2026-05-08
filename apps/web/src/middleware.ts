import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Session validation and route protection is handled in layouts.
// This middleware exists as a placeholder for future middleware needs
// (e.g. rate limiting, geolocation, A/B testing).
export function middleware(request: NextRequest) {
  if (request.headers.get("host") === "www.coopernu.com") {
    const url = request.url.replace(
      "https://www.coopernu.com",
      "https://coopernu.com",
    );
    return NextResponse.redirect(url, 308);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
