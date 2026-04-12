import { NextRequest } from "next/server";
import { apiRouteWithAuth } from "@/lib/auth/apiRouteWithAuth";

export async function PATCH(req: NextRequest) {
  const body = await req.json();

  return apiRouteWithAuth(req, (cookie) =>
    fetch(`${process.env.AUTH_URL}/users/me/email`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", cookie },
      body: JSON.stringify(body),
      cache: "no-store",
    }),
  );
}
