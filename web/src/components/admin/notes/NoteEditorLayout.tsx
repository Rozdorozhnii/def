"use client";

import { useState } from "react";

interface Props {
  left: React.ReactNode;
  right: React.ReactNode;
  footer?: React.ReactNode;
}

export function NoteEditorLayout({ left, right, footer }: Props) {
  const [splitScroll, setSplitScroll] = useState(false);

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button
          type="button"
          onClick={() => setSplitScroll((v) => !v)}
          className={`text-sm font-bold px-4 py-1.5 rounded border transition duration-300
            ${
              splitScroll
                ? "bg-[#ff4102] text-white border-[#ff4102]"
                : "border-[#dfdbd8] text-gray-600 hover:bg-gray-100"
            }`}
        >
          {splitScroll ? "Split scroll: on" : "Split scroll: off"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-8 items-start">
        <div
          className={
            splitScroll ? "overflow-y-auto h-[calc(100vh-12rem)] pr-2" : ""
          }
        >
          {left}
        </div>
        <div
          className={
            splitScroll ? "overflow-y-auto h-[calc(100vh-12rem)] pr-2" : ""
          }
        >
          {right}
        </div>
      </div>

      {footer && <div className="mt-8">{footer}</div>}
    </div>
  );
}
