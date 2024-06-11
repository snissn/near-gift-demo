import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const TURN_OFF_APPS = process?.env?.turnOffApps === "true" ?? true

export function middleware(request: NextRequest) {
  if (TURN_OFF_APPS) {
    return NextResponse.redirect(new URL("/", request.url))
  }
}

export const config = {
  matcher: [
    "/swap/:path*",
    "/deposit/:path*",
    "/withdraw/:path*",
    "/wallet/:path*",
  ],
}
