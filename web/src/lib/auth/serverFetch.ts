import { cookies } from "next/headers";

export async function serverFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const cookieStore = await cookies();

  return fetch(input, {
    ...init,
    headers: {
      ...init?.headers,
      cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });
}
