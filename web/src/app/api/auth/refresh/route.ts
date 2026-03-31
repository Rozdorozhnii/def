import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const res = await fetch(`${process.env.AUTH_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      cookie: cookieHeader,
    },
  });

  const nextRes = new NextResponse(null, {
    status: res.status,
  });

  const setCookie = res.headers.get("set-cookie");

  if (setCookie) {
    nextRes.headers.set("set-cookie", setCookie);
  }

  return nextRes;
}
