import { NextResponse } from "next/server";
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.json();
  const userAgent = (await headers()).get('user-agent');

  const res = await fetch(`${process.env.AUTH_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent": userAgent ?? "unknown"
    },
    body: JSON.stringify(body),
    credentials: "include",
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });
}