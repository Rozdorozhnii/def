import Link from "next/link";
import { Note } from "@/shared/types";

export default function NotesItem(note: Note) {
  const translation = note.translations.en;

  return (
    <Link
      href={`/notes/${note.slug}`}
      className="group block p-6 rounded-xl border border-[#dfdbd8] bg-white hover:border-[#ff4102] hover:shadow-md transition duration-200"
    >
      <h2 className="text-lg font-semibold group-hover:text-[#ff4102] transition duration-200 line-clamp-2">
        {translation?.title}
      </h2>

      {translation?.description && (
        <p className="mt-2 text-sm text-gray-500 line-clamp-3">
          {translation.description}
        </p>
      )}

      {note.publishedAt && (
        <p className="mt-4 text-xs text-gray-400">
          {new Date(note.publishedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}
    </Link>
  );
}
