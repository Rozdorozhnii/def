import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookieHeader = req.headers.get("cookie");

  const authResponse = await fetch(`${process.env.AUTH_URL}/auth/logout`, {
    method: "POST",
    headers: {
      cookie: cookieHeader ?? "",
    },
  });

  if (!authResponse.ok) {
    return NextResponse.json(
      { message: "Logout failed" },
      { status: authResponse.status },
    );
  }

  const response = NextResponse.json({ success: true });

  response.cookies.set("Refresh", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  response.cookies.set("Authentication", "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });

  return response;
}
