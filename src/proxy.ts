import { NextRequest, NextResponse } from "next/server";

/** Stamps the request path on a header so layouts can enforce per-path rules (e.g. admin MFA). */
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-pathname", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}
