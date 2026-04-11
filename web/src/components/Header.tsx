import Link from "next/link";

import { AuthStatus } from "./AuthStatus";
import { MobileNav } from "./MobileNav";

const NAV_LINKS = [
  { href: "/", label: "Articles" },
  { href: "/about", label: "About" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[#dfdbd8]">
      {/* Top row: burger left, logo center, auth right */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center">
        <div className="flex-1 flex items-center">
          <MobileNav links={NAV_LINKS} />
        </div>
        <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition whitespace-nowrap">
          🇺🇦 Pray for Ukraine
        </Link>
        <div className="flex-1 flex justify-end text-sm">
          <AuthStatus />
        </div>
      </div>

      {/* Desktop nav — centered below */}
      <div className="hidden md:block border-t border-[#dfdbd8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-center gap-8 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-gray-600 hover:text-black transition"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
