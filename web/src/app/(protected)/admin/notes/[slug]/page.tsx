import { notFound } from "next/navigation";

import { serverFetch } from "@/lib/auth/serverFetch";
import { getBaseUrl } from "@/shared/server/getBaseUrl";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type { Note, SiteSettings } from "@contracts/notes";
import { OriginalForm } from "@/components/admin/notes/OriginalForm";
import { OriginalReadOnly } from "@/components/admin/notes/OriginalReadOnly";
import { TranslationPanel } from "@/components/admin/notes/TranslationPanel";
import { NoteEditorLayout } from "@/components/admin/notes/NoteEditorLayout";
import { StatusPanel } from "@/components/admin/notes/StatusPanel";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const baseUrl = await getBaseUrl();

  const [res, settingsRes, user] = await Promise.all([
    serverFetch(`${baseUrl}/api/admin/notes/${slug}`),
    serverFetch(`${baseUrl}/api/admin/settings/locales`),
    getCurrentUser(),
  ]);

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to load article");

  const note: Note = await res.json();
  const settings: SiteSettings = settingsRes.ok
    ? ((await settingsRes.json()) as SiteSettings)
    : { knownLocales: ["en"], supportedLocales: ["en"] };

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isAuthor = user?.role === "author";
  const isTranslator = user?.role === "translator";

  const userLocales = user?.locales ?? [];

  const canWriteOriginal =
    isAdmin || isAuthor || (isTranslator && userLocales.includes("uk"));

  // Locales available in the translation panel
  const translationLocales: string[] = isAdmin
    ? [
        ...new Set([
          ...settings.supportedLocales.filter((l) => l !== "uk"),
          ...Object.keys(note.translations),
        ]),
      ]
    : isTranslator
      ? userLocales.filter(
          (l) => l !== "uk" && settings.supportedLocales.includes(l),
        )
      : [];

  const statusPanel = (
    <StatusPanel
      slug={slug}
      currentStatus={note.status}
      hasEnTranslation={!!note.translations.en}
      isAdmin={isAdmin}
      isAuthor={isAuthor}
    />
  );

  // Two-column layout: original on the left, translation panel on the right
  if (translationLocales.length > 0) {
    const leftPanel =
      canWriteOriginal && note.original ? (
        <OriginalForm slug={slug} initial={note.original} />
      ) : note.original ? (
        <OriginalReadOnly original={note.original} />
      ) : null;

    const rightPanel = (
      <TranslationPanel
        slug={slug}
        locales={translationLocales}
        translations={note.translations}
        isAdmin={isAdmin}
      />
    );

    return (
      <div className="p-8 mx-auto flex flex-col gap-6">
        <div>
          <h1 className="text-2xl font-bold">
            {note.original?.title ?? note.slug}
          </h1>
          <p className="text-sm text-gray-500 mt-1 capitalize">
            Status: {note.status.replace("_", " ")}
          </p>
        </div>

        <NoteEditorLayout
          left={leftPanel}
          right={rightPanel}
          footer={statusPanel}
        />
      </div>
    );
  }

  // Single-column layout: author or translator with only 'uk'
  return (
    <div className="p-8 mx-auto flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-bold">
          {note.original?.title ?? note.slug}
        </h1>
        <p className="text-sm text-gray-500 mt-1 capitalize">
          Status: {note.status.replace("_", " ")}
        </p>
      </div>

      {canWriteOriginal && note.original && (
        <OriginalForm slug={slug} initial={note.original} />
      )}

      {statusPanel}
    </div>
  );
}
