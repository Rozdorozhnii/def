import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const token = (await cookies()).get("Authentication")?.value;
  if (!token) return NextResponse.json(null, { status: 401 });

  const res = await fetch(`${process.env.AUTH_URL}/users`, {
    headers: { Cookie: `Authentication=${token}` },
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });
}