import React from "react";

import { Note } from "@/shared/types";
import NotesItem from "./NoteItem";

export default function NotesList({ notes }: { notes: Note[] }) {
  return (
    <div>
      <p>NotesList</p>
      <div>
        {notes.map((note) => (
          <NotesItem key={note._id} {...note} />
        ))}
      </div>
    </div>
  );
}
