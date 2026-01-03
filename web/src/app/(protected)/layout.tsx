import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getBaseUrl } from "@/shared/server/getBaseUrl";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const baseUrl = await getBaseUrl();
  const cookieStore = cookies();
  const authCookie = (await cookieStore).get("Authentication")?.value;

  if (!authCookie) redirect("/login");

  const res = await fetch(`${baseUrl}/api/auth/users`, {
    headers: {
      Cookie: `Authentication=${authCookie}`,
    },
    cache: "no-store",
  });

  if (!res.ok) redirect("/login");

  return children;
}
