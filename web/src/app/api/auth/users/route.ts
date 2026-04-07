import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${process.env.AUTH_URL}/users/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (res.status !== 401) {
    if (!res.ok) return NextResponse.json({ user: null }, { status: 200 });
    const user = await res.json();
    return NextResponse.json({ user }, { status: 200 });
  }

  // Access token expired — try refresh with browser UA
  const refreshToken = cookieStore.get("Refresh")?.value;
  if (!refreshToken) return NextResponse.json({ user: null }, { status: 200 });

  const refreshRes = await fetch(`${process.env.AUTH_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      cookie: `Refresh=${refreshToken}`,
      "user-agent": req.headers.get("user-agent") ?? "unknown",
    },
    cache: "no-store",
  });

  if (!refreshRes.ok) return NextResponse.json({ user: null }, { status: 200 });

  const newCookies = refreshRes.headers.getSetCookie();

  // Build updated cookie header for the retry request
  const cookieMap = new Map<string, string>();
  for (const raw of cookieHeader.split(";")) {
    const eq = raw.trim().indexOf("=");
    if (eq < 0) continue;
    cookieMap.set(raw.trim().substring(0, eq), raw.trim().substring(eq + 1));
  }
  for (const setCookie of newCookies) {
    const [pair] = setCookie.split(";");
    const eq = pair.indexOf("=");
    if (eq < 0) continue;
    cookieMap.set(pair.substring(0, eq).trim(), pair.substring(eq + 1).trim());
  }
  const mergedCookie = Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");

  const retryRes = await fetch(`${process.env.AUTH_URL}/users/me`, {
    headers: { cookie: mergedCookie },
    cache: "no-store",
  });

  if (!retryRes.ok) return NextResponse.json({ user: null }, { status: 200 });

  const user = await retryRes.json();
  const response = NextResponse.json({ user }, { status: 200 });

  // Forward new cookies to the browser
  for (const setCookie of newCookies) {
    response.headers.append("set-cookie", setCookie);
  }

  return response;
}
