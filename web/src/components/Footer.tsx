export function Footer() {
  return (
    <footer className="border-t border-[#dfdbd8] mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-center gap-4 text-sm text-gray-500">
        <span>© {new Date().getFullYear()} Pray for Ukraine</span>
        <span>|</span>
        <a href="/about" className="hover:text-black transition">About</a>
        <span>|</span>
        <a href="/contact" className="hover:text-black transition">Contact</a>
      </div>
    </footer>
  );
}
