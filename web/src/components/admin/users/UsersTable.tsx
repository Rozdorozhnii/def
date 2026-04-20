"use client";

import { useState } from "react";

import { USER_ROLES, ROLE_LABEL } from "@contracts/auth";
import type { AuthUser, UserRole } from "@contracts/auth";

const ASSIGNABLE_ROLES: (UserRole | null)[] = [null, ...USER_ROLES];

type FilterValue = UserRole | "all" | "no_role";

interface Props {
  users: AuthUser[];
  supportedLocales: string[];
}

interface RoleModalState {
  userId: string;
  email: string;
  currentRole: UserRole | null;
  selectedRole: UserRole | null;
}

interface LocalesModalState {
  userId: string;
  email: string;
  selected: Set<string>;
}

const PAGE_SIZES = [10, 25, 50] as const;

const selectClass =
  "border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none text-sm bg-white";

export function UsersTable({ users, supportedLocales = [] }: Props) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);

  const [roles, setRoles] = useState<Map<string, UserRole | null>>(
    new Map(users.map((u) => [u.id, u.role])),
  );
  const [localesMap, setLocalesMap] = useState<Map<string, string[]>>(
    new Map(users.map((u) => [u.id, u.locales ?? []])),
  );

  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [roleModal, setRoleModal] = useState<RoleModalState | null>(null);
  const [localesModal, setLocalesModal] = useState<LocalesModalState | null>(
    null,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const filtered = users.filter((u) => {
    if (filter === "all") return true;
    if (filter === "no_role") return u.role === null;
    return u.role === filter;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  function openRoleModal(u: AuthUser) {
    const currentRole = roles.get(u.id) ?? null;
    setRoleModal({
      userId: u.id,
      email: u.email,
      currentRole,
      selectedRole: currentRole,
    });
    setSaveError(null);
  }

  function openLocalesModal(u: AuthUser) {
    const current = localesMap.get(u.id) ?? [];
    setLocalesModal({
      userId: u.id,
      email: u.email,
      selected: new Set(current),
    });
    setSaveError(null);
  }

  async function handleRoleConfirm() {
    if (!roleModal) return;
    setSaving((prev) => new Set(prev).add(roleModal.userId));
    setSaveError(null);

    const res = await fetch(`/api/admin/users/${roleModal.userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: roleModal.selectedRole }),
    });

    setSaving((prev) => {
      const next = new Set(prev);
      next.delete(roleModal.userId);
      return next;
    });

    if (res.ok) {
      setRoles((prev) =>
        new Map(prev).set(roleModal.userId, roleModal.selectedRole),
      );
      setRoleModal(null);
    } else {
      const data = await res.json();
      setSaveError(
        (data as { message?: string }).message ?? "Something went wrong",
      );
    }
  }

  async function handleLocalesConfirm() {
    if (!localesModal) return;
    setSaving((prev) => new Set(prev).add(localesModal.userId));
    setSaveError(null);

    const locales = [...localesModal.selected];

    const res = await fetch(`/api/admin/users/${localesModal.userId}/locales`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locales }),
    });

    setSaving((prev) => {
      const next = new Set(prev);
      next.delete(localesModal.userId);
      return next;
    });

    if (res.ok || res.status === 204) {
      setLocalesMap((prev) => new Map(prev).set(localesModal.userId, locales));
      setLocalesModal(null);
    } else {
      const data = await res.json();
      setSaveError(
        (data as { message?: string }).message ?? "Something went wrong",
      );
    }
  }

  function toggleLocale(code: string) {
    if (!localesModal) return;
    setLocalesModal((prev) => {
      if (!prev) return prev;
      const next = new Set(prev.selected);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return { ...prev, selected: next };
    });
  }

  return (
    <div>
      {/* Filter toolbar */}
      <div className="flex items-center gap-4 mb-4">
        <h2 className="text-lg font-bold">All users</h2>
        <select
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value as FilterValue);
            setPage(1);
          }}
          className={selectClass}
        >
          <option value="all">All roles</option>
          <option value="no_role">No role</option>
          {(["author", "translator", "admin", "super_admin"] as UserRole[]).map(
            (r) => (
              <option key={r} value={r}>
                {ROLE_LABEL[r]}
              </option>
            ),
          )}
        </select>
        <span className="text-sm text-gray-500">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Users table */}
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#dfdbd8]">
            <th className="py-2 pr-4 text-sm font-bold">Email</th>
            <th className="py-2 pr-4 text-sm font-bold">Role</th>
            <th className="py-2 pr-4 text-sm font-bold">Locales</th>
            <th className="py-2 pr-4 text-sm font-bold">Verified</th>
            <th className="py-2 text-sm font-bold" />
          </tr>
        </thead>
        <tbody>
          {paginated.map((u) => {
            const currentRole = roles.get(u.id) ?? null;
            const currentLocales = localesMap.get(u.id) ?? [];
            const isSaving = saving.has(u.id);

            return (
              <tr
                key={u.id}
                className="border-b border-[#dfdbd8] hover:bg-gray-50"
              >
                <td className="py-2 pr-4 text-sm">{u.email}</td>
                <td className="py-2 pr-4 text-sm">
                  {currentRole ? (
                    ROLE_LABEL[currentRole]
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-sm">
                  {currentLocales.length > 0 ? (
                    <span className="font-mono">
                      {currentLocales.join(", ")}
                    </span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-sm">
                  {u.isEmailVerified ? (
                    "✓"
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openRoleModal(u)}
                      disabled={isSaving}
                      className="cursor-pointer text-sm font-bold px-4 py-1.5 rounded text-white
                        border border-[#ff4102] bg-[#ff4102] shadow-sm
                        hover:bg-white hover:text-[#ff4102] transition duration-300
                        disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? "Saving…" : "Role"}
                    </button>
                    {currentRole === "translator" && (
                      <button
                        onClick={() => openLocalesModal(u)}
                        disabled={isSaving}
                        className="cursor-pointer text-sm font-bold px-4 py-1.5 rounded
                          border border-[#dfdbd8] hover:bg-gray-100 transition duration-300
                          disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Locales
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(
                Number(e.target.value) as (typeof PAGE_SIZES)[number],
              );
              setPage(1);
            }}
            className={selectClass}
          >
            {PAGE_SIZES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-3">
          <span>
            {(currentPage - 1) * pageSize + 1}–
            {Math.min(currentPage * pageSize, filtered.length)} of{" "}
            {filtered.length}
          </span>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={currentPage === 1}
            className="cursor-pointer font-bold px-3 py-1 rounded
              border border-[#ff4102] text-[#ff4102]
              hover:bg-[#ff4102] hover:text-white transition duration-300
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={currentPage === totalPages}
            className="cursor-pointer font-bold px-3 py-1 rounded
              border border-[#ff4102] text-[#ff4102]
              hover:bg-[#ff4102] hover:text-white transition duration-300
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      </div>

      {/* Role modal */}
      {roleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-md">
            <h3 className="font-bold text-lg mb-1">Change role</h3>
            <p className="text-sm text-gray-500 mb-4">{roleModal.email}</p>

            <div className="flex flex-col gap-1 mb-4">
              <label
                htmlFor="modal-role"
                className="mb-2.5 block font-bold text-sm"
              >
                New role
              </label>
              <select
                id="modal-role"
                value={roleModal.selectedRole ?? ""}
                onChange={(e) =>
                  setRoleModal({
                    ...roleModal,
                    selectedRole: (e.target.value as UserRole) || null,
                  })
                }
                className={selectClass + " w-full"}
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r ?? "null"} value={r ?? ""}>
                    {r ? ROLE_LABEL[r] : "No role"}
                  </option>
                ))}
              </select>
            </div>

            {roleModal.selectedRole === null &&
              roleModal.currentRole !== null && (
                <p className="text-amber-600 text-sm mb-4">
                  This will remove all staff access from this user.
                </p>
              )}

            {saveError && (
              <p className="text-red-500 text-sm mb-4">{saveError}</p>
            )}

            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setRoleModal(null)}
                className="cursor-pointer font-bold px-6 py-2 rounded text-sm
                  border border-[#dfdbd8] hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleRoleConfirm}
                disabled={roleModal.selectedRole === roleModal.currentRole}
                className="cursor-pointer font-bold px-6 py-2 rounded text-sm text-white
                  border border-[#ff4102] bg-[#ff4102] shadow-md
                  hover:bg-white hover:text-[#ff4102] transition duration-300
                  disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Locales modal */}
      {localesModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-md">
            <h3 className="font-bold text-lg mb-1">Translation locales</h3>
            <p className="text-sm text-gray-500 mb-4">{localesModal.email}</p>

            <div className="flex flex-col gap-2 mb-6">
              {supportedLocales.map((code) => (
                <label
                  key={code}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={localesModal.selected.has(code)}
                    onChange={() => toggleLocale(code)}
                    className="w-4 h-4 accent-[#ff4102]"
                  />
                  <span className="text-sm font-mono">{code}</span>
                </label>
              ))}
            </div>

            {saveError && (
              <p className="text-red-500 text-sm mb-4">{saveError}</p>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setLocalesModal(null)}
                className="cursor-pointer font-bold px-6 py-2 rounded text-sm
                  border border-[#dfdbd8] hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLocalesConfirm}
                className="cursor-pointer font-bold px-6 py-2 rounded text-sm text-white
                  border border-[#ff4102] bg-[#ff4102] shadow-md
                  hover:bg-white hover:text-[#ff4102] transition duration-300"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
