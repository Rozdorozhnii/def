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
    <div>
      <h1 className="text-2xl font-bold">{translation?.title}</h1>
      <p className="mt-2 text-gray-500">{translation?.description}</p>
      <div
        className="mt-6 prose"
        dangerouslySetInnerHTML={{ __html: translation?.body ?? "" }}
      />
      {note.publishedAt && (
        <small className="text-gray-400">
          {new Date(note.publishedAt).toLocaleString()}
        </small>
      )}
      <div className="mt-8">
        <Link href="/" className="text-blue-500 hover:underline">
          Back to Notes
        </Link>
      </div>
    </div>
  );
}
