import React from "react";
import Link from "next/link";
import { Note } from "@/shared/types";

export default function NotesItem(note: Note) {
  return (
    <div
      style={{
        border: "1px solid black",
        margin: "10px",
        padding: "10px",
      }}
    >
      <h3>
        <Link href={`notes/${note._id}`}>{note.title}</Link>
      </h3>
      <p>{note.content}</p>
      <small>{new Date(note.timestamp).toLocaleString()}</small>
    </div>
  );
}
