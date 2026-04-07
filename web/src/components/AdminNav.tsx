"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  showManageRoles: boolean;
}

export function AdminNav({ showManageRoles }: Props) {
  const pathname = usePathname();

  function linkClass(href: string, exact = false) {
    const active = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");
    return `text-sm ${active ? "font-semibold text-black underline underline-offset-4" : "text-gray-500 hover:text-black"}`;
  }

  return (
    <nav className="flex items-center gap-6 p-4 max-w-4xl mx-auto">
      <Link href="/admin" className={linkClass("/admin", true)}>
        Admin
      </Link>
      {showManageRoles && (
        <Link href="/admin/users" className={linkClass("/admin/users")}>
          Manage roles
        </Link>
      )}
      <Link href="/" className="text-sm text-gray-500 hover:text-black ml-auto">
        ← Back to site
      </Link>
    </nav>
  );
}
