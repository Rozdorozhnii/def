import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Handler = (cookieHeader: string) => Promise<Response>;

// Wraps an API route handler with auth + automatic token refresh.
// If the first request returns 401, attempts a token refresh and retries once.
export async function apiRouteWithAuth(
  req: NextRequest,
  handler: Handler,
): Promise<NextResponse> {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await handler(cookieHeader);

  if (res.status !== 401) {
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return NextResponse.json(data, { status: res.status });
    }
    const contentLength = res.headers.get("content-length");
    if (!contentLength || contentLength === "0") {
      return new NextResponse(null, { status: res.status });
    }
    const data = await res.json().catch(() => null);
    return NextResponse.json(data, { status: res.status });
  }

  // 401 — try refresh
  const refreshToken = cookieStore.get("Refresh")?.value;
  if (!refreshToken) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const refreshRes = await fetch(`${process.env.AUTH_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      cookie: `Refresh=${refreshToken}`,
      "user-agent": req.headers.get("user-agent") ?? "unknown",
    },
    cache: "no-store",
  });

  if (!refreshRes.ok) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const newCookies = refreshRes.headers.getSetCookie();

  // Merge new cookies into the cookie header
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

  const retryRes = await handler(mergedCookie);

  if (!retryRes.ok) {
    const data = await retryRes.json().catch(() => ({}));
    const errResponse = NextResponse.json(data, { status: retryRes.status });
    for (const setCookie of newCookies) {
      errResponse.headers.append("set-cookie", setCookie);
    }
    return errResponse;
  }

  const contentLength = retryRes.headers.get("content-length");
  const response =
    !contentLength || contentLength === "0"
      ? new NextResponse(null, { status: retryRes.status })
      : NextResponse.json(await retryRes.json().catch(() => null), { status: retryRes.status });

  // Forward new cookies to the browser
  for (const setCookie of newCookies) {
    response.headers.append("set-cookie", setCookie);
  }

  return response;
}
