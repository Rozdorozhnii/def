import Link from "next/link";

import type { Note } from "@/shared/types";
import { getBaseUrl } from "@/shared/server/getBaseUrl";

export default async function Note({ params }: { params: { slug: string } }) {
  const baseUrl = await getBaseUrl();

  const response = await fetch(`${baseUrl}/api/notes/${(await params).slug}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Failed to load note");
  }

  const note: Note = await response.json();

  return (
    <div>
      <h1 className="text-2xl font-bold">{note.title}</h1>
      <p className="mt-4">{note.content}</p>
      <small className="text-gray-500">
        {new Date(note.timestamp).toLocaleString()}
      </small>
      <div className="mt-8">
        <Link
          href="/"
          className="mt-4 inline-block text-blue-500 hover:underline"
        >
          Back to Notes
        </Link>
      </div>
    </div>
  );
}
