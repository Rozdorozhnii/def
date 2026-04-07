import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET — returns all users, or a single user if ?email= is provided. SUPER_ADMIN only.
export async function GET(req: NextRequest) {
  const cookieStore = await cookies();
  const email = req.nextUrl.searchParams.get("email");

  const url = new URL(`${process.env.AUTH_URL}/users`);
  if (email) url.searchParams.set("email", email);

  const res = await fetch(url.toString(), {
    headers: {
      "Content-Type": "application/json",
      cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
