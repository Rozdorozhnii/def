"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewNotePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/admin/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
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

    const note = await res.json();
    // Redirect to edit page to add EN translation and manage status
    router.push(`/admin/notes/${note.slug}`);
  }

  return (
    <div className="p-8 mx-auto">
      <h1 className="text-2xl font-bold mb-6">New article</h1>
      <p className="text-gray-500 text-sm mb-6">
        Write the Ukrainian original. English translation can be added on the next step.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="font-medium text-sm">
            Title (UK)
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="font-medium text-sm">
            Description (UK) — SEO summary, 150–160 chars
          </label>
          <input
            id="description"
            name="description"
            type="text"
            required
            className="border rounded px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="body" className="font-medium text-sm">
            Body (UK) — HTML
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={10}
            className="border rounded px-3 py-2 text-sm font-mono"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-50 text-sm"
          >
            {loading ? "Creating…" : "Create draft"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 rounded border text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
