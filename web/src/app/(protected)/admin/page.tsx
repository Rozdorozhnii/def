import Link from "next/link";
import { Suspense } from "react";

import { serverFetch } from "@/lib/auth/serverFetch";
import { getBaseUrl } from "@/shared/server/getBaseUrl";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import type {
  Note,
  NoteStatus,
  SiteSettings,
  TranslationStatus,
} from "@contracts/notes";
import { DeleteNoteButton } from "@/components/admin/notes/DeleteNoteButton";
import { NotesFilters } from "@/components/admin/notes/NotesFilters";

const NOTE_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  review: "In Review",
  published: "Published",
};

const TRANSLATION_BADGE: Record<
  TranslationStatus,
  { label: string; cls: string }
> = {
  ai_draft: {
    label: "AI draft",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  draft: {
    label: "Draft",
    cls: "bg-gray-100 text-gray-500 border border-gray-200",
  },
  pending_review: {
    label: "Pending",
    cls: "bg-blue-50 text-blue-600 border border-blue-200",
  },
  approved: {
    label: "Approved",
    cls: "bg-green-50 text-green-700 border border-green-200",
  },
};

function TranslationBadges({
  note,
  locales,
}: {
  note: Note;
  locales: string[];
}) {
  if (locales.length === 0) return <span className="text-gray-400">—</span>;

  return (
    <div className="flex flex-wrap gap-1">
      {locales.map((locale) => {
        const t = note.translations[locale];
        const status = t?.status;
        const badge = status ? TRANSLATION_BADGE[status] : null;

        return (
          <span key={locale} className="flex items-center gap-1">
            <span className="text-xs text-gray-400 font-mono uppercase">
              {locale}
            </span>
            {badge ? (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${badge.cls}`}
              >
                {badge.label}
              </span>
            ) : (
              <span className="text-xs text-gray-300">—</span>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const statusFilter = (params.status ?? "all") as NoteStatus | "all";
  const translationFilter = (params.translation ?? "all") as
    | TranslationStatus
    | "all";

  const baseUrl = await getBaseUrl();
  const [res, settingsRes, user] = await Promise.all([
    serverFetch(`${baseUrl}/api/admin/notes`),
    serverFetch(`${baseUrl}/api/admin/settings/locales`),
    getCurrentUser(),
  ]);
  const allNotes: Note[] = await res.json();
  const settings: SiteSettings = settingsRes.ok
    ? ((await settingsRes.json()) as SiteSettings)
    : { knownLocales: [], supportedLocales: [] };

  const supportedLocales = settings.supportedLocales.filter((l) => l !== "uk");

  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isSuperAdmin = user?.role === "super_admin";
  const isTranslator = user?.role === "translator";
  const userLocales = (user?.locales ?? []).filter(
    (l) => l !== "uk" && supportedLocales.includes(l),
  );

  // Server-side filtering
  const notes = allNotes.filter((note) => {
    if (statusFilter !== "all" && note.status !== statusFilter) return false;

    if (translationFilter !== "all") {
      const locales = isAdmin
        ? supportedLocales.filter((l) => l in note.translations)
        : isTranslator
          ? userLocales
          : [];
      const hasMatch = locales.some(
        (l) => note.translations[l]?.status === translationFilter,
      );
      if (!hasMatch) return false;
    }

    return true;
  });

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Articles</h1>
        <Link
          href="/admin/notes/new"
          className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 text-sm"
        >
          New article
        </Link>
      </div>

      <Suspense>
        <NotesFilters
          isSuperAdmin={isSuperAdmin}
          showTranslationFilter={isAdmin || isTranslator}
          currentStatus={statusFilter}
          currentTranslationStatus={translationFilter}
          total={notes.length}
        />
      </Suspense>

      {notes.length === 0 ? (
        <p className="text-gray-500 mt-4">
          No articles match the selected filters.
        </p>
      ) : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b">
              <th className="py-2 pr-4 text-sm font-bold">Title</th>
              <th className="py-2 pr-4 text-sm font-bold">Status</th>
              <th className="py-2 pr-4 text-sm font-bold">Translations</th>
              <th className="py-2" />
            </tr>
          </thead>
          <tbody>
            {notes.map((note) => {
              const translationLocales = isAdmin
                ? supportedLocales.filter((l) => l in note.translations)
                : isTranslator
                  ? userLocales
                  : [];

              return (
                <tr key={note._id} className="border-b hover:bg-gray-50">
                  <td className="py-2 pr-4 text-sm">
                    {note.original?.title ?? (
                      <span className="font-mono text-gray-400">
                        {note.slug}
                      </span>
                    )}
                  </td>
                  <td className="py-2 pr-4 text-sm">
                    {NOTE_STATUS_LABEL[note.status]}
                  </td>
                  <td className="py-2 pr-4">
                    <TranslationBadges
                      note={note}
                      locales={translationLocales}
                    />
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/notes/${note.slug}`}
                        className="text-sm font-bold px-4 py-1.5 rounded
                          border border-[#ff4102] text-[#ff4102]
                          hover:bg-[#ff4102] hover:text-white transition duration-300"
                      >
                        Edit
                      </Link>
                      {isSuperAdmin && (
                        <DeleteNoteButton
                          slug={note.slug}
                          title={note.original?.title ?? note.slug}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
