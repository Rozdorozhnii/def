import { cookies } from "next/headers";

import { serverFetch } from "./serverFetch";
import type { AuthUser } from "@contracts/auth";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();

    const res = await serverFetch(`${process.env.AUTH_URL}/users`, {
      headers: {
        cookie: cookieStore.toString(),
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}
