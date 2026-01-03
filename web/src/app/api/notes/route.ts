import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(`${process.env.NOTES_URL}/notes`, {
    headers: { "Content-Type": "application/json" },
  });

  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });
}