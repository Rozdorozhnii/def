import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET — returns notes filtered by the caller's role (backend handles filtering)
export async function GET() {
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NOTES_URL}/notes`, {
    headers: {
      "Content-Type": "application/json",
      cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST — creates a new draft article (AUTHOR / ADMIN only)
export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const body = await req.json();

  const res = await fetch(`${process.env.NOTES_URL}/notes`, {
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
