import NotesList from "@/components/NotesList";
import { serverFetch } from "@/lib/auth/serverFetch";
import { getBaseUrl } from "@/shared/server/getBaseUrl";

export default async function Account() {
  const baseUrl = await getBaseUrl();
  const response = await serverFetch(`${baseUrl}/api/notes`);

  const notes = await response.json();

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="">Account</div>
        <NotesList notes={notes} />
      </main>
    </div>
  );
}
