import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// PATCH — assigns or revokes a role for a user. SUPER_ADMIN only.
// body: { role: 'author' | 'translator' | 'admin' | 'super_admin' | null }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const cookieStore = await cookies();
  const body = await req.json();

  const res = await fetch(`${process.env.AUTH_URL}/users/${id}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      cookie: cookieStore.toString(),
    },
    body: JSON.stringify(body),
  });

  // Backend returns 204 No Content on success — res.json() would throw on empty body
  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
