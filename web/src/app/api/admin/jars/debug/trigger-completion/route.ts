import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const res = await fetch(
    `${process.env.JARS_URL}/jars/debug/trigger-completion`,
    {
      method: "POST",
      headers: { cookie: cookieStore.toString() },
    },
  );
  return NextResponse.json(
    res.status === 200 ? { ok: true } : await res.json(),
    { status: res.status },
  );
}
