import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { AdminNav } from "@/components/admin/AdminNav";

// Any user with a role (non-null) is considered staff and can access the admin panel.
// Users with role: null are regular subscribers — redirect them to home.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user?.role) {
    redirect("/");
  }

  return (
    <>
      <header className="border-b border-gray-200">
        <AdminNav
        showManageRoles={user.role === "super_admin"}
        showSettings={user.role === "super_admin"}
      />
      </header>
      {children}
    </>
  );
}
