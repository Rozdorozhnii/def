import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const res = await fetch(`${process.env.NOTES_URL}/notes/${slug}`, {
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    const errorText = await res.text();

    return NextResponse.json(
      { message: errorText || "Upstream error" },
      { status: res.status },
    );
  }

  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });
}
