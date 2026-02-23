import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}

export const dynamic = "force-dynamic";
