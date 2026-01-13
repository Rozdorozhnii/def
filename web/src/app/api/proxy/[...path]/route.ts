import { serverFetch } from '@/lib/auth/serverFetch';

export async function GET(
  req: Request,
  { params }: { params: { path: string[] } },
) {
  const url = `${process.env.API_URL}/${params.path.join('/')}`;

  const res = await serverFetch(url, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  });

  return new Response(res.body, {
    status: res.status,
    headers: res.headers,
  });
}