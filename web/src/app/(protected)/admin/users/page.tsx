import { serverFetch } from "@/lib/auth/serverFetch";
import { getBaseUrl } from "@/shared/server/getBaseUrl";
import type { AuthUser } from "@contracts/auth";
import { UserSearch } from "@/components/UserSearch";
import { UsersTable } from "@/components/UsersTable";

export default async function AdminUsersPage() {
  const baseUrl = await getBaseUrl();
  const res = await serverFetch(`${baseUrl}/api/admin/users`);
  const users: AuthUser[] = await res.json();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <UserSearch />
      <UsersTable users={users} />
    </div>
  );
}
