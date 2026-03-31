import { NextResponse } from "next/server";
import { serverFetch } from "@/lib/auth/serverFetch";

function getSetCookies(headers: Headers): string[] {
  const headersWithSetCookie = headers as Headers & {
    getSetCookie?: () => string[];
  };

  if (typeof headersWithSetCookie.getSetCookie === "function") {
    return headersWithSetCookie.getSetCookie();
  }

  const setCookie = headers.get("set-cookie");
  return setCookie ? [setCookie] : [];
}

export async function GET() {
  const res = await serverFetch(`${process.env.AUTH_URL}/users`);

  if (res.status === 401) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const user = await res.json();
  const response = NextResponse.json({ user }, { status: 200 });
  const setCookies = getSetCookies(res.headers);

  for (const setCookie of setCookies) {
    response.headers.append("set-cookie", setCookie);
  }

  return response;
}
