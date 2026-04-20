import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// PATCH — assigns translation locales to a user. SUPER_ADMIN only.
// body: { locales: string[] }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const body = await req.json();

  const res = await fetch(`${process.env.AUTH_URL}/users/${id}/locales`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieStore.toString(),
    },
    body: JSON.stringify(body),
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
