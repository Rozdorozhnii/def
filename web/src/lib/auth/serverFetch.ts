export async function serverFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    credentials: "include",
  });

  if (res.status !== 401) {
    return res;
  }

  // Access expired → refresh
  const refreshRes = await fetch(`${process.env.AUTH_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });

  if (!refreshRes.ok) {
    return res;
  }

  // 🔁 retry original request
  return fetch(input, {
    ...init,
    credentials: "include",
  });
}
