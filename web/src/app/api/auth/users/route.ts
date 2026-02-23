import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.AUTH_URL}/users`, {
    headers: {
      cookie: cookieStore.toString(),
    },
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });
}
