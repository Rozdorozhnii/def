import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const res = await fetch(`${process.env.JARS_URL}/jars/${id}`, {
    method: "DELETE",
    headers: { cookie: cookieStore.toString() },
  });
  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
