import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${process.env.AUTH_URL}/users/me/email/confirm`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  }

  return new NextResponse(null, { status: 204 });
}
