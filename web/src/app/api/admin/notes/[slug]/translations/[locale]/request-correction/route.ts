import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// PATCH — admin requests a correction on an approved translation (APPROVED → DRAFT)
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ slug: string; locale: string }> },
) {
  const { slug, locale } = await params;
  const cookieStore = await cookies();

  const res = await fetch(
    `${process.env.NOTES_URL}/notes/${slug}/translations/${locale}/request-correction`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        cookie: cookieStore.toString(),
      },
    },
  );

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}