import { refresh } from './refresh';

export async function serverFetch(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {

  const res = await fetch(input, {
    ...init,
    credentials: 'include',
  });

  if (res.status !== 401) {
    return res;
  }

  // ⚠️ access token expired
  const refreshed = await refresh();

  if (!refreshed) {
    return res;
  }

  // 🔁 retry original request
  return fetch(input, {
    ...init,
    credentials: 'include',
  });
}