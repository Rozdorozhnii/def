"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  slug: string;
  title: string;
}

export function DeleteNoteButton({ slug, title }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/admin/notes/${slug}`, { method: "DELETE" });

    setLoading(false);

    if (!res.ok && res.status !== 204) {
      const data = await res.json().catch(() => ({}));
      setError((data as { message?: string }).message ?? "Something went wrong");
      return;
    }

    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-sm font-bold px-4 py-1.5 rounded
          bg-red-600 text-white hover:bg-red-700 transition duration-300"
      >
        Delete
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-sm shadow-md">
            <h3 className="font-bold text-lg mb-1">Delete article</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-black">&ldquo;{title}&rdquo;</span>?
              This action cannot be undone.
            </p>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="cursor-pointer font-bold px-6 py-2 rounded text-sm
                  border border-[#dfdbd8] hover:bg-gray-50 transition duration-300
                  disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="cursor-pointer font-bold px-6 py-2 rounded text-sm
                  text-white bg-red-600 hover:bg-red-700 transition duration-300
                  disabled:opacity-50"
              >
                {loading ? "Deleting…" : "Yes, delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
