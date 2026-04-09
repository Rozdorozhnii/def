import { notFound } from "next/navigation";

import { serverFetch } from "@/lib/auth/serverFetch";
import { getBaseUrl } from "@/shared/server/getBaseUrl";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { Note } from "@/shared/types";
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

  return (
    <div className="p-8 mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">{note.slug}</h1>
        <p className="text-sm text-gray-500 mt-1">Status: {note.status}</p>
      </div>

      {/* UK translation — only author and admin see this */}
      {(user?.role === "author" || user?.role === "admin" || user?.role === "super_admin") && (
        <TranslationForm slug={slug} locale="uk" initial={note.translations.uk} />
      )}

      {/* EN translation — translator, author, and admin */}
      {(user?.role === "translator" || user?.role === "author" || user?.role === "admin" || user?.role === "super_admin") && (
        <TranslationForm slug={slug} locale="en" initial={note.translations.en} />
      )}

      {/* Status controls — admin only */}
      {(user?.role === "admin" || user?.role === "super_admin") && (
        <StatusPanel slug={slug} currentStatus={note.status} hasEnTranslation={!!note.translations.en} />
      )}
    </div>
  );
}
