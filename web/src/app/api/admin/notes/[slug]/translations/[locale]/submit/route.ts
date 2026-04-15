import { NextResponse } from "next/server";
import { cookies } from "next/headers";

// PATCH — submits a translation for admin review (DRAFT → PENDING_REVIEW)
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ slug: string; locale: string }> },
) {
  const { slug, locale } = await params;
  const cookieStore = await cookies();

  const res = await fetch(
    `${process.env.NOTES_URL}/notes/${slug}/translations/${locale}/submit`,
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
