import { serverFetch } from "./serverFetch";
import type { AuthUser } from "@contracts/auth";

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const res = await serverFetch(`${process.env.AUTH_URL}/users/me`);

    if (!res.ok) return null;

    return res.json();
  } catch {
    return null;
  }
}
