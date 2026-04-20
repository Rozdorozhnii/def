"use client";

import { useState } from "react";

import { USER_ROLES, ROLE_LABEL } from "@contracts/auth";
import type { AuthUser, UserRole } from "@contracts/auth";

const ROLES = [
  { value: null, label: "No role" },
  ...USER_ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] })),
];

export function UserSearch() {
  const [email, setEmail] = useState("");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchError(null);
    setUser(null);
    setSaveSuccess(false);
    setSearching(true);

    const res = await fetch(
      `/api/admin/users?email=${encodeURIComponent(email)}`,
    );
    setSearching(false);

    if (res.status === 404) {
      setSearchError("User not found");
      return;
    }
    if (!res.ok) {
      setSearchError("Something went wrong");
      return;
    }

    const found: AuthUser = await res.json();
    setUser(found);
    setSelectedRole(found.role);
  }

  async function handleSave() {
    if (!user) return;
    setSaveError(null);
    setSaveSuccess(false);
    setSaving(true);

    const res = await fetch(`/api/admin/users/${user.id}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: selectedRole }),
    });
    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setSaveError(data.message ?? "Something went wrong");
      return;
    }

    setUser({ ...user, role: selectedRole });
    setSaveSuccess(true);
  }

  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold mb-3">Find user by email</h2>

      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <input
          type="email"
          required
          placeholder="user@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 border rounded px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={searching}
          className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>

      {searchError && <p className="text-red-500 text-sm">{searchError}</p>}

      {user && (
        <div className="border rounded p-4 flex flex-col gap-4">
          <div>
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Current role: {user.role ?? "none"}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="role" className="text-sm font-medium">
              New role
            </label>
            <select
              id="role"
              value={selectedRole ?? ""}
              onChange={(e) =>
                setSelectedRole((e.target.value as UserRole) || null)
              }
              className="border rounded px-3 py-2 text-sm"
            >
              {ROLES.map((r) => (
                <option key={r.value ?? "null"} value={r.value ?? ""}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
          {saveSuccess && (
            <p className="text-green-600 text-sm">Role updated.</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving || selectedRole === user.role}
            className="self-start bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </div>
  );
}
