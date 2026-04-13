import { Note } from "@contracts/notes";
import NotesItem from "./NoteItem";

export default function NotesList({ notes }: { notes: Note[] }) {
  if (notes.length === 0) {
    return (
      <p className="text-gray-400 text-sm">No articles published yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {notes.map((note) => (
        <NotesItem key={note._id} {...note} />
      ))}
    </div>
  );
}
