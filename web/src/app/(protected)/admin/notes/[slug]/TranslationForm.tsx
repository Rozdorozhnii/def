"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NoteTranslation } from "@contracts/notes";
import { Editor } from "@/components/Editor";

interface Props {
  slug: string;
  locale: string;
  initial?: NoteTranslation;
  isAdmin: boolean;
}

export function TranslationForm({ slug, locale, initial, isAdmin }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [saving, setSaving] = useState(false);
  const [actioning, setActioning] = useState(false);
  const [body, setBody] = useState(initial?.body ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/admin/notes/${slug}/translations`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locale,
        title: form.get("title"),
        description: form.get("description"),
        body,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Something went wrong");
      return;
    }

    setSuccess(true);

    const updated = await res.json();
    if (updated.slug && updated.slug !== slug) {
      router.push(`/admin/notes/${updated.slug}`);
    } else {
      router.refresh();
    }
  }

  async function submitForReview() {
    setError(null);
    setActioning(true);

    const res = await fetch(
      `/api/admin/notes/${slug}/translations/${locale}/submit`,
      { method: "PATCH" },
    );

    setActioning(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Something went wrong");
      return;
    }

    router.refresh();
  }

  async function approve() {
    setError(null);
    setActioning(true);

    const res = await fetch(
      `/api/admin/notes/${slug}/translations/${locale}/approve`,
      { method: "PATCH" },
    );

    setActioning(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Something went wrong");
      return;
    }

    router.refresh();
  }

  const status = initial?.status;

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold">
          {locale.toUpperCase()} translation
        </h2>
        {status && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
            {status.replace("_", " ")}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor={`${locale}-title`} className="font-medium text-sm">Title</label>
          <input
            id={`${locale}-title`}
            name="title"
            type="text"
            required
            defaultValue={initial?.title ?? ""}
            className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none text-sm"
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
            className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm">Body</label>
          <Editor value={body} onChange={setBody} placeholder="Write the translation..." />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Saved.</p>}

        <div className="flex gap-3 flex-wrap">
          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer font-bold px-6 py-2 rounded text-sm text-white
              border border-[#ff4102] bg-[#ff4102] shadow-md
              hover:bg-white hover:text-[#ff4102] transition duration-300
              disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>

          {/* Translator: submit draft for review */}
          {!isAdmin && status === "draft" && initial && (
            <button
              type="button"
              onClick={submitForReview}
              disabled={actioning}
              className="border px-4 py-2 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              {actioning ? "Submitting…" : "Submit for review"}
            </button>
          )}

          {/* Admin: approve directly (skip submit step) */}
          {isAdmin && status === "draft" && initial && (
            <button
              type="button"
              onClick={approve}
              disabled={actioning}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {actioning ? "Approving…" : "Approve"}
            </button>
          )}

          {/* Admin: approve pending review */}
          {isAdmin && status === "pending_review" && (
            <button
              type="button"
              onClick={approve}
              disabled={actioning}
              className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
            >
              {actioning ? "Approving…" : "Approve"}
            </button>
          )}
        </div>
      </form>
    </section>
  );
}