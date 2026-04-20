"use client";

import { useEffect, useState } from "react";

import type { AuthUser } from "@contracts/auth";
import type { SiteSettings } from "@contracts/notes";
import { UserSearch } from "@/components/admin/users/UserSearch";
import { UsersTable } from "@/components/admin/users/UsersTable";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [supportedLocales, setSupportedLocales] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/settings/locales").then((r) => r.json()),
    ]).then(([usersData, settingsData]: [AuthUser[], SiteSettings]) => {
      setUsers(usersData);
      setSupportedLocales(settingsData.supportedLocales ?? []);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-gray-500">Loading…</div>;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <UserSearch />
      <UsersTable users={users} supportedLocales={supportedLocales} />
    </div>
  );
}
