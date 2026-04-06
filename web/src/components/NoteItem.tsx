import React from "react";
import Link from "next/link";
import { Note } from "@/shared/types";

export default function NotesItem(note: Note) {
  const translation = note.translations.en;

  return (
    <div
      style={{
        border: "1px solid black",
        margin: "10px",
        padding: "10px",
      }}
    >
      <h3>
        <Link href={`notes/${note.slug}`}>{translation?.title}</Link>
      </h3>
      <p>{translation?.description}</p>
      {note.publishedAt && (
        <small>{new Date(note.publishedAt).toLocaleString()}</small>
      )}
    </div>
  );
}
