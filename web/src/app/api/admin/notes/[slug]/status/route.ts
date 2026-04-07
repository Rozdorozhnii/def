import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// PATCH — moves an article through the workflow (draft → review → published)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const cookieStore = await cookies();
  const body = await req.json();

  const res = await fetch(`${process.env.NOTES_URL}/notes/${slug}/status`, {
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
