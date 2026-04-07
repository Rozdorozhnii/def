import { type NextRequest, NextResponse } from "next/server";

function isTokenExpired(token: string): boolean {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const accessToken = request.cookies.get("Authentication")?.value;
  const refreshToken = request.cookies.get("Refresh")?.value;

  // Access token present and not expired → no action needed
  if (accessToken && !isTokenExpired(accessToken)) return NextResponse.next();

  // No refresh token either → redirect to login
  if (!refreshToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Access token missing but Refresh present → try to refresh
  const refreshRes = await fetch(`${process.env.AUTH_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      cookie: `Refresh=${refreshToken}`,
      "user-agent": request.headers.get("user-agent") ?? "unknown",
    },
    cache: "no-store",
  });

  if (!refreshRes.ok) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const setCookies = refreshRes.headers.getSetCookie();

  // Build updated cookie header for the forwarded page request
  const cookieMap = new Map<string, string>();
  request.cookies
    .getAll()
    .forEach(({ name, value }) => cookieMap.set(name, value));
  for (const setCookie of setCookies) {
    const [pair] = setCookie.split(";");
    const eqIdx = pair.indexOf("=");
    if (eqIdx < 0) continue;
    const name = pair.substring(0, eqIdx).trim();
    const value = pair.substring(eqIdx + 1).trim();
    cookieMap.set(name, value);
  }
  const newCookieHeader = Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  // Forward the page request with updated cookies in the headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("cookie", newCookieHeader);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Set new cookies on the browser response
  for (const setCookie of setCookies) {
    response.headers.append("set-cookie", setCookie);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/api/admin/:path*",
    "/api/account/:path*",
  ],
};
