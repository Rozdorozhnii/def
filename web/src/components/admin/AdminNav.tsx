"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  showManageRoles: boolean;
  showSettings: boolean;
}

export function AdminNav({ showManageRoles, showSettings }: Props) {
  const pathname = usePathname();

  function linkClass(href: string, exact = false) {
    const active = exact
      ? pathname === href
      : pathname === href || pathname.startsWith(href + "/");
    return `text-sm ${active ? "font-semibold text-black underline underline-offset-4" : "text-gray-500 hover:text-black"}`;
  }

  return (
    <nav className="max-w-4xl mx-auto flex items-center gap-6 p-4">
      <Link href="/admin" className={linkClass("/admin", true)}>
        Admin
      </Link>
      {showManageRoles && (
        <Link href="/admin/users" className={linkClass("/admin/users")}>
          Manage roles
        </Link>
      )}
      {showSettings && (
        <Link href="/admin/settings" className={linkClass("/admin/settings")}>
          Settings
        </Link>
      )}
      <Link href="/" className="text-sm text-gray-500 hover:text-black ml-auto">
        ← Back to site
      </Link>
    </nav>
  );
}
