import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// GET — returns a single article by slug (any status, for the edit page)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NOTES_URL}/notes/${slug}`, {
    headers: {
      "Content-Type": "application/json",
      cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
