import Link from "next/link";

import { serverFetch } from "@/lib/auth/serverFetch";
import { getBaseUrl } from "@/shared/server/getBaseUrl";
import type { Note } from "@/shared/types";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  review: "In Review",
  published: "Published",
};

export default async function AdminPage() {
  const baseUrl = await getBaseUrl();
  const res = await serverFetch(`${baseUrl}/api/admin/notes`);
  const notes: Note[] = await res.json();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link
          href="/admin/notes/new"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          New article
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="text-gray-500">No articles yet.</p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4">Slug</th>
              <th className="py-2 pr-4">Title (EN)</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => (
              <tr key={note._id} className="border-b hover:bg-gray-50">
                <td className="py-2 pr-4 font-mono text-sm">{note.slug}</td>
                <td className="py-2 pr-4">
                  {note.translations.en?.title ?? (
                    <span className="text-gray-400 italic">No EN translation</span>
                  )}
                </td>
                <td className="py-2 pr-4">
                  <span className="text-sm">{STATUS_LABEL[note.status]}</span>
                </td>
                <td className="py-2">
                  <Link
                    href={`/admin/notes/${note.slug}`}
                    className="text-blue-500 hover:underline text-sm"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
