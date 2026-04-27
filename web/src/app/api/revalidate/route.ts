import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  const { secret } = await req.json();

  if (secret !== process.env.ISR_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  revalidateTag("notes");
  revalidateTag("active-jar");

  return NextResponse.json({ revalidated: true });
}