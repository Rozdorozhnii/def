"use client";

import { useState } from "react";

import type { NoteTranslation, TranslationStatus } from "@contracts/notes";
import { TranslationForm } from "./TranslationForm";

interface Props {
  slug: string;
  locales: string[];
  translations: Record<string, NoteTranslation>;
  isAdmin: boolean;
}

const selectClass =
  "border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none text-sm bg-white";

function statusBadge(status: TranslationStatus | undefined) {
  if (!status) return null;
  const cls =
    status === "ai_draft"
      ? "bg-amber-50 text-amber-700"
      : status === "approved"
        ? "bg-green-50 text-green-700"
        : status === "pending_review"
          ? "bg-blue-50 text-blue-600"
          : "bg-gray-100 text-gray-600";
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${cls}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function TranslationPanel({
  slug,
  locales,
  translations,
  isAdmin,
}: Props) {
  const [activeLocale, setActiveLocale] = useState(locales[0] ?? "");

  if (locales.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Translation</h2>
        <p className="text-sm text-gray-400">
          No translation locales assigned for this user.
        </p>
      </div>
    );
  }

  const activeTranslation = translations[activeLocale] as
    | NoteTranslation
    | undefined;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold">Translation</h2>
        {locales.length > 1 ? (
          <select
            value={activeLocale}
            onChange={(e) => setActiveLocale(e.target.value)}
            className={selectClass}
          >
            {locales.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm font-mono text-gray-500">
            {activeLocale.toUpperCase()}
          </span>
        )}
        {statusBadge(activeTranslation?.status)}
      </div>

      <TranslationForm
        key={activeLocale}
        slug={slug}
        locale={activeLocale}
        initial={activeTranslation}
        isAdmin={isAdmin}
      />
    </div>
  );
}
