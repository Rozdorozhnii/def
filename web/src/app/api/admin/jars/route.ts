import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.JARS_URL}/jars`, {
    headers: { cookie: cookieStore.toString() },
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const body = await req.json();
  const res = await fetch(`${process.env.JARS_URL}/jars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieStore.toString(),
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}