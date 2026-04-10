import Link from "next/link";

import { AuthStatus } from "./AuthStatus";

export async function Header() {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-[#dfdbd8]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg tracking-tight hover:opacity-80 transition">
          🇺🇦 Pray for Ukraine
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/" className="text-gray-600 hover:text-black transition">
            Articles
          </Link>
          <Link href="/about" className="text-gray-600 hover:text-black transition">
            About
          </Link>
          <AuthStatus />
        </nav>
      </div>
    </header>
  );
}
