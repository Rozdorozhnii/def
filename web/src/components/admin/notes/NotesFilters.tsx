"use client";

import { useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

const selectClass =
  "border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none text-sm bg-white";

interface Props {
  isSuperAdmin: boolean;
  showTranslationFilter: boolean;
  currentStatus: string;
  currentTranslationStatus: string;
  total: number;
}

export function NotesFilters({
  isSuperAdmin,
  showTranslationFilter,
  currentStatus,
  currentTranslationStatus,
  total,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <div className="flex items-center gap-3 mb-4">
      <select
        value={currentStatus}
        onChange={(e) => update("status", e.target.value)}
        className={selectClass}
      >
        <option value="all">All statuses</option>
        {isSuperAdmin && <option value="draft">Draft</option>}
        <option value="review">In Review</option>
        <option value="published">Published</option>
      </select>

      {showTranslationFilter && (
        <select
          value={currentTranslationStatus}
          onChange={(e) => update("translation", e.target.value)}
          className={selectClass}
        >
          <option value="all">All translations</option>
          <option value="ai_draft">AI draft</option>
          <option value="draft">Draft</option>
          <option value="pending_review">Pending review</option>
          <option value="approved">Approved</option>
        </select>
      )}

      <span className="text-sm text-gray-500">
        {total} article{total !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
