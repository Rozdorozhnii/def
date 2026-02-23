import Link from "next/link";

import { AuthStatus } from "./AuthStatus";

export async function Header() {
  return (
    <header>
      <nav className="flex items-center gap-6 p-4 border-b border-gray-300">
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>

        <AuthStatus />
      </nav>
    </header>
  );
}
