"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import type { NoteStatus } from "@contracts/notes";

interface Props {
  slug: string;
  currentStatus: NoteStatus;
  hasEnTranslation: boolean;
  isAdmin: boolean;
  isAuthor: boolean;
  needsRepublish: boolean;
}

export function StatusPanel({
  slug,
  currentStatus,
  hasEnTranslation,
  isAdmin,
  isAuthor,
  needsRepublish,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function changeStatus(status: NoteStatus) {
    setError(null);
    setLoading(true);

    const res = await fetch(`/api/admin/notes/${slug}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.message ?? "Something went wrong");
      return;
    }

    // Refresh the page to reflect the new status
    router.refresh();
  }

  return (
    <section>
      <h2 className="text-lg font-semibold mb-4">Workflow</h2>

      <div className="flex gap-3 flex-wrap">
        {/* Non-admin: send draft to review */}
        {!isAdmin && currentStatus === "draft" && (
          <button
            onClick={() => changeStatus("review")}
            disabled={loading}
            className="border px-4 py-2 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Send to review
          </button>
        )}

        {/* Author: revoke review back to draft */}
        {isAuthor && currentStatus === "review" && (
          <button
            onClick={() => changeStatus("draft")}
            disabled={loading}
            className="border px-4 py-2 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            Revoke review
          </button>
        )}

        {/* Admin: publish directly from draft */}
        {isAdmin && currentStatus === "draft" && (
          <button
            onClick={() => changeStatus("published")}
            disabled={loading || !hasEnTranslation}
            title={
              !hasEnTranslation ? "English translation required" : undefined
            }
            className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
          >
            Publish
          </button>
        )}

        {/* Admin: publish or reject from review */}
        {isAdmin && currentStatus === "review" && (
          <>
            <button
              onClick={() => changeStatus("published")}
              disabled={loading || !hasEnTranslation}
              title={
                !hasEnTranslation ? "English translation required" : undefined
              }
              className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 disabled:opacity-50"
            >
              Publish
            </button>
            <button
              onClick={() => changeStatus("draft")}
              disabled={loading}
              className="border px-4 py-2 rounded text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Back to draft
            </button>
          </>
        )}

        {/* Admin only: republish / unpublish */}
        {isAdmin && currentStatus === "published" && (
          <>
            {needsRepublish && (
              <button
                onClick={() => changeStatus("published")}
                disabled={loading}
                className="border border-blue-500 text-blue-600 px-4 py-2 rounded text-sm hover:bg-blue-50 disabled:opacity-50"
              >
                Republish
              </button>
            )}
            <button
              onClick={() => changeStatus("draft")}
              disabled={loading}
              className="border border-amber-500 text-amber-600 px-4 py-2 rounded text-sm hover:bg-amber-50 disabled:opacity-50"
            >
              Unpublish
            </button>
          </>
        )}
        <Link
          href="/admin"
          className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
        >
          ← Back to admin
        </Link>
      </div>

      {!hasEnTranslation && currentStatus === "review" && (
        <p className="text-gray-500 text-sm mt-2">
          Add an English translation before publishing.
        </p>
      )}

      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
    </section>
  );
}
