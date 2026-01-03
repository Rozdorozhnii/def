import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { slug: string } }
) {
  const res = await fetch(
    `${process.env.NOTES_URL}/notes/${params.slug}`,
    {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "Note not found" },
      { status: res.status }
    );
  }

  return new NextResponse(res.body, {
    status: res.status,
    headers: res.headers,
  });
}