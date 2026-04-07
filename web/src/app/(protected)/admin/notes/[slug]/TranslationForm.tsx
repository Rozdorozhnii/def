"use client";

import { useState } from "react";
import type { NoteTranslation, NoteLocale } from "@/shared/types";

interface Props {
  slug: string;
  locale: NoteLocale;
  initial?: NoteTranslation;
}

export function TranslationForm({ slug, locale, initial }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/admin/notes/${slug}/translations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        title: form.get("title"),
        description: form.get("description"),
        body: form.get("body"),
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Something went wrong");
      return;
    }

    setSuccess(true);
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">
        {locale === "uk" ? "Ukrainian (original)" : "English (translation)"}
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${locale}-title`} className="font-medium text-sm">Title</label>
          <input
            id={`${locale}-title`}
            name="title"
            type="text"
            required
            defaultValue={initial?.title ?? ""}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${locale}-description`} className="font-medium text-sm">Description</label>
          <input
            id={`${locale}-description`}
            name="description"
            type="text"
            required
            defaultValue={initial?.description ?? ""}
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor={`${locale}-body`} className="font-medium text-sm">Body (HTML)</label>
          <textarea
            id={`${locale}-body`}
            name="body"
            required
            rows={8}
            defaultValue={initial?.body ?? ""}
            className="border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Saved.</p>}

        <button
          type="submit"
          disabled={loading}
          className="self-start bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 text-sm"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </form>
    </section>
  );
}
