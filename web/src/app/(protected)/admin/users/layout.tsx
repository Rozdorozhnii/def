import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";

export default async function AdminUsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (user?.role !== "super_admin") {
    redirect("/admin");
  }

  return <>{children}</>;
}
