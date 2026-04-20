"use client";

import { useState } from "react";

import type { NoteOriginal } from "@contracts/notes";
import { Editor } from "@/components/Editor";

interface Props {
  slug: string;
  initial: NoteOriginal;
}

export function OriginalForm({ slug, initial }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [body, setBody] = useState(initial.body);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const form = new FormData(e.currentTarget);

    const res = await fetch(`/api/admin/notes/${slug}/original`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.get("title"),
        description: form.get("description"),
        body,
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
    <section className="flex flex-col gap-4">
      <div className="flex items-center min-h-[36px]">
        <h2 className="text-lg font-semibold">Ukrainian (original)</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="uk-title" className="font-medium text-sm">
            Title
          </label>
          <input
            id="uk-title"
            name="title"
            type="text"
            required
            defaultValue={initial.title}
            className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="uk-description" className="font-medium text-sm">
            Description
          </label>
          <input
            id="uk-description"
            name="description"
            type="text"
            required
            defaultValue={initial.description}
            className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm">Body</label>
          <Editor
            value={body}
            onChange={setBody}
            placeholder="Write the article in Ukrainian..."
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Saved.</p>}

        <button
          type="submit"
          disabled={loading}
          className="cursor-pointer self-start font-bold px-6 py-2 rounded text-sm text-white
            border border-[#ff4102] bg-[#ff4102] shadow-md
            hover:bg-white hover:text-[#ff4102] transition duration-300
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </form>
    </section>
  );
}
