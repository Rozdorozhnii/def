import Link from "next/link";
import { notFound } from "next/navigation";

import type { Note } from "@/shared/types";
import { getBaseUrl } from "@/shared/server/getBaseUrl";

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = await getBaseUrl();

  const response = await fetch(`${baseUrl}/api/notes/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (response.status === 404) notFound();
  if (!response.ok) throw new Error("Failed to load note");

  const note: Note = await response.json();
  const translation = note.translations.en;

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-black transition mb-8"
      >
        ← Back to articles
      </Link>

      {/* Article header */}
      <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-4">
        {translation?.title}
      </h1>

      {translation?.description && (
        <p className="text-lg text-gray-500 mb-6 leading-relaxed">
          {translation.description}
        </p>
      )}

      {note.publishedAt && (
        <p className="text-xs text-gray-400 mb-10 pb-10 border-b border-[#dfdbd8]">
          {new Date(note.publishedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}

      {/* Article body — prose styles raw HTML from Tiptap */}
      <div
        className="prose prose-neutral max-w-none"
        dangerouslySetInnerHTML={{ __html: translation?.body ?? "" }}
      />
    </main>
  );
}
