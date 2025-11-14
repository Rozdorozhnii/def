import Link from "next/link";

export function Header() {
  return (
    <header className="flex items-center gap-6 p-4 border-b border-gray-300">
      <Link href="/" className="flex items-center gap-3">
        Home
      </Link>
      <Link href="/about" className="flex items-center gap-3">
        About
      </Link>
    </header>
  );
}
