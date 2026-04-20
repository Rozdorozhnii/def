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

  async function revokeReview() {
    setError(null);
    setActioning(true);

    const res = await fetch(
      `/api/admin/notes/${slug}/translations/${locale}/revoke`,
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

  async function requestCorrection() {
    setError(null);
    setActioning(true);

    const res = await fetch(
      `/api/admin/notes/${slug}/translations/${locale}/request-correction`,
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
  const isLocked = !isAdmin && status === "approved";

  return (
    <section>
      {isLocked ? (
        <div className="flex flex-col gap-4">
          <div className="border border-green-200 bg-green-50 rounded-lg px-4 py-3 text-sm text-green-700">
            This translation has been approved and is locked for editing.
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm text-gray-500">Title</span>
            <p className="text-sm">{initial?.title}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm text-gray-500">
              Description
            </span>
            <p className="text-sm">{initial?.description}</p>
          </div>
          <div className="flex flex-col gap-1">
            <span className="font-medium text-sm text-gray-500">Body</span>
            <div
              className="prose prose-sm max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: initial?.body ?? "" }}
            />
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${locale}-title`} className="font-medium text-sm">
              Title
            </label>
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
            <label
              htmlFor={`${locale}-description`}
              className="font-medium text-sm"
            >
              Description
            </label>
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
            <Editor
              value={body}
              onChange={setBody}
              placeholder="Write the translation..."
            />
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

            {/* Translator: submit draft or AI draft for review */}
            {!isAdmin &&
              (status === "draft" || status === "ai_draft") &&
              initial && (
                <button
                  type="button"
                  onClick={submitForReview}
                  disabled={actioning}
                  className="border px-4 py-2 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
                >
                  {actioning ? "Submitting…" : "Submit for review"}
                </button>
              )}

            {/* Translator: revoke pending review back to draft */}
            {!isAdmin && status === "pending_review" && (
              <button
                type="button"
                onClick={revokeReview}
                disabled={actioning}
                className="border px-4 py-2 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                {actioning ? "Revoking…" : "Revoke review"}
              </button>
            )}

            {/* Admin: approve draft, AI draft, or pending review */}
            {isAdmin &&
              (status === "draft" ||
                status === "ai_draft" ||
                status === "pending_review") && (
                <button
                  type="button"
                  onClick={approve}
                  disabled={actioning}
                  className="bg-green-600 text-white px-4 py-2 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {actioning ? "Approving…" : "Approve"}
                </button>
              )}

            {/* Admin: request correction on approved translation */}
            {isAdmin && status === "approved" && (
              <button
                type="button"
                onClick={requestCorrection}
                disabled={actioning}
                className="border border-amber-500 text-amber-600 px-4 py-2 rounded text-sm hover:bg-amber-50 disabled:opacity-50"
              >
                {actioning ? "Requesting…" : "Request correction"}
              </button>
            )}
          </div>
        </form>
      )}

      {error && isLocked && (
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </section>
  );
}
