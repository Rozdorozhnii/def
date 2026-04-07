"use client";

import { useState } from "react";
import { USER_ROLES, ROLE_LABEL } from "@contracts/auth";
import type { AuthUser, UserRole } from "@contracts/auth";

const ASSIGNABLE_ROLES: (UserRole | null)[] = [null, ...USER_ROLES];

type FilterValue = UserRole | "all" | "no_role";

interface Props {
  users: AuthUser[];
}

interface ModalState {
  userId: string;
  email: string;
  currentRole: UserRole | null;
  selectedRole: UserRole | null;
}

const PAGE_SIZES = [10, 25, 50] as const;

const selectClass =
  "border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none text-sm bg-white";

export function UsersTable({ users }: Props) {
  const [filter, setFilter] = useState<FilterValue>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<(typeof PAGE_SIZES)[number]>(10);

  // Tracks the current role for each user (updated after successful save)
  const [roles, setRoles] = useState<Map<string, UserRole | null>>(
    new Map(users.map((u) => [u.id, u.role])),
  );

  const [saving, setSaving] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<ModalState | null>(null);
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

  function openModal(u: AuthUser) {
    const currentRole = roles.get(u.id) ?? null;
    setModal({
      userId: u.id,
      email: u.email,
      currentRole,
      selectedRole: currentRole,
    });
    setSaveError(null);
  }

  async function handleConfirm() {
    if (!modal) return;
    setSaving((prev) => new Set(prev).add(modal.userId));
    setSaveError(null);

    const res = await fetch(`/api/admin/users/${modal.userId}/role`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role: modal.selectedRole }),
    });

    setSaving((prev) => {
      const next = new Set(prev);
      next.delete(modal.userId);
      return next;
    });

    if (res.ok) {
      setRoles((prev) => new Map(prev).set(modal.userId, modal.selectedRole));
      setModal(null);
    } else {
      const data = await res.json();
      setSaveError(data.message ?? "Something went wrong");
    }
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
            <th className="py-2 pr-4 text-sm font-bold">Verified</th>
            <th className="py-2 text-sm font-bold" />
          </tr>
        </thead>
        <tbody>
          {paginated.map((u) => {
            const currentRole = roles.get(u.id) ?? null;
            const isSaving = saving.has(u.id);

            return (
              <tr key={u.id} className="border-b border-[#dfdbd8] hover:bg-gray-50">
                <td className="py-2 pr-4 text-sm">{u.email}</td>
                <td className="py-2 pr-4 text-sm">
                  {currentRole ? (
                    ROLE_LABEL[currentRole]
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
                  <button
                    onClick={() => openModal(u)}
                    disabled={isSaving}
                    className="cursor-pointer text-sm font-bold px-4 py-1.5 rounded text-white
                      border border-[#ff4102] bg-[#ff4102] shadow-sm
                      hover:bg-white hover:text-[#ff4102] transition duration-300
                      disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : "Change role"}
                  </button>
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

      {/* Confirmation modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-md">
            <h3 className="font-bold text-lg mb-1">Change role</h3>
            <p className="text-sm text-gray-500 mb-4">{modal.email}</p>

            <div className="flex flex-col gap-1 mb-4">
              <label htmlFor="modal-role" className="mb-2.5 block font-bold text-sm">
                New role
              </label>
              <select
                id="modal-role"
                value={modal.selectedRole ?? ""}
                onChange={(e) =>
                  setModal({
                    ...modal,
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

            {/* Warning shown when role is about to be removed */}
            {modal.selectedRole === null && modal.currentRole !== null && (
              <p className="text-amber-600 text-sm mb-4">
                This will remove all staff access from this user.
              </p>
            )}

            {saveError && (
              <p className="text-red-500 text-sm mb-4">{saveError}</p>
            )}

            <div className="flex gap-3 justify-end mt-2">
              <button
                onClick={() => setModal(null)}
                className="cursor-pointer font-bold px-6 py-2 rounded text-sm
                  border border-[#dfdbd8] hover:bg-gray-50 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={modal.selectedRole === modal.currentRole}
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
    </div>
  );
}
