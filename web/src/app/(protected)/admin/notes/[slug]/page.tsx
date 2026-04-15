import { notFound } from "next/navigation";

import { serverFetch } from "@/lib/auth/serverFetch";
import { getBaseUrl } from "@/shared/server/getBaseUrl";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { Note } from "@contracts/notes";
import { OriginalForm } from "./OriginalForm";
import { TranslationForm } from "./TranslationForm";
import { StatusPanel } from "./StatusPanel";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = await getBaseUrl();

  const [res, user] = await Promise.all([
    serverFetch(`${baseUrl}/api/admin/notes/${slug}`),
    getCurrentUser(),
  ]);

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to load article");

  const note: Note = await res.json();

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isAuthor = user?.role === "author";
  const isTranslator = user?.role === "translator";

  return (
    <div className="p-8 mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">{note.original?.title ?? note.slug}</h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">Status: {note.status.replace("_", " ")}</p>
      </div>

      {/* Ukrainian original — author and admin only */}
      {(isAdmin || isAuthor) && note.original && (
        <OriginalForm slug={slug} initial={note.original} />
      )}

      {/* Translations — translator, author, admin */}
      {(isAdmin || isAuthor || isTranslator) &&
        Object.entries(note.translations).map(([locale, translation]) => (
          <TranslationForm
            key={locale}
            slug={slug}
            locale={locale}
            initial={translation}
            isAdmin={isAdmin}
          />
        ))}

      {/* If no translations exist yet, show a placeholder EN form */}
      {(isAdmin || isAuthor || isTranslator) &&
        Object.keys(note.translations).length === 0 && (
          <TranslationForm
            slug={slug}
            locale="en"
            initial={undefined}
            isAdmin={isAdmin}
          />
        )}

      {/* Workflow controls — author can send to review; admin can do all */}
      {(isAdmin || isAuthor) && (
        <StatusPanel
          slug={slug}
          currentStatus={note.status}
          hasEnTranslation={!!note.translations.en}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
}
