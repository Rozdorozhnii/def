"use client";

import { useState } from "react";
import Link from "next/link";

interface NavLink {
  href: string;
  label: string;
}

export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex flex-col justify-center items-center w-8 h-8 gap-1.5 cursor-pointer outline-none"
        aria-label="Menu"
      >
        <span className={`block h-[3px] w-5 bg-gray-700 transition-all ${open ? "rotate-45 translate-y-[9px]" : ""}`} />
        <span className={`block h-[3px] w-5 bg-gray-700 transition-all ${open ? "opacity-0" : ""}`} />
        <span className={`block h-[3px] w-5 bg-gray-700 transition-all ${open ? "-rotate-45 -translate-y-[9px]" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-10 left-0 w-44 rounded-lg shadow-lg border border-[#dfdbd8] bg-white py-1 z-50">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
