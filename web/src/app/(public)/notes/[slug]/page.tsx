import axios from "axios";
import Link from "next/link";

import type { Note } from "@/shared/types";

export default async function Note({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const notesUrl = process.env.NOTES_URL;
  const response = await axios.get<Note>(`${notesUrl}/notes/${slug}`);

  return (
    <div>
      <h1 className="text-2xl font-bold">{response.data.title}</h1>
      <p className="mt-4">{response.data.content}</p>
      <small className="text-gray-500">
        {new Date(response.data.timestamp).toLocaleString()}
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
