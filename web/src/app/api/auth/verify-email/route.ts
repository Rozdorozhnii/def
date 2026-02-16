import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const response = await fetch(`${process.env.AUTH_URL}/auth/verify-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

  const setCookie = response.headers.get("set-cookie");

  const res = new NextResponse(null, {
    status: response.status,
  });

  if (setCookie) {
    res.headers.set("set-cookie", setCookie);
  }

  return res;
}
