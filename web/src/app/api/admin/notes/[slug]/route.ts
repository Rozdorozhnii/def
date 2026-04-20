import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// DELETE — removes an article entirely. SUPER_ADMIN only.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookieStore = await cookies();

  const res = await fetch(`${process.env.NOTES_URL}/notes/${slug}`, {
    method: "DELETE",
    headers: { cookie: cookieStore.toString() },
  });

  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

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
