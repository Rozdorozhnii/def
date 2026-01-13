export async function refresh(): Promise<boolean> {
  const res = await fetch(
    `${process.env.AUTH_URL}/auth/refresh`,
    {
      method: 'POST',
      credentials: 'include',
    },
  );

  return res.ok;
}