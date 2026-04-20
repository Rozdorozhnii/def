import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET — returns current site settings (supportedLocales).
export async function GET() {
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NOTES_URL}/notes/settings`, {
    headers: { cookie: cookieStore.toString() },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// PATCH — updates supported locales. SUPER_ADMIN only.
// body: { supportedLocales: string[] }
export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies();
  const body = await req.json();

  const res = await fetch(`${process.env.NOTES_URL}/notes/settings/locales`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieStore.toString(),
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}