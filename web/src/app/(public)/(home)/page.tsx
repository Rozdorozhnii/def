import NotesList from "@/components/NotesList";
import { getBaseUrl } from "@/shared/server/getBaseUrl";

export default async function Home() {
  const baseUrl = await getBaseUrl();
  const response = await fetch(`${baseUrl}/api/notes`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error("Failed to load notes");
  }

  const notes = await response.json();

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold mb-2">Latest articles</h1>
      <p className="text-gray-500 mb-8 text-sm">
        Stories, updates and reports from Ukraine.
      </p>
      <NotesList notes={notes} />
    </main>
  );
}
