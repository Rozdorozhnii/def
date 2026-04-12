"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/useAuth";

export function AuthStatus() {
  const router = useRouter();
  const { user, refreshUser, isLoading } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    await refreshUser();
    router.push("/");
  };

  if (isLoading) {
    return <div className="h-5 w-5 rounded-full border-2 border-[#ff4102] border-t-transparent animate-spin" />;
  }

  if (!user.user) {
    return (
      <a href="/login" className="text-gray-600 hover:text-black transition">
        Login
      </a>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-gray-600 hover:text-black transition cursor-pointer"
      >
        <span className="w-7 h-7 rounded-full bg-[#ff4102] text-white text-xs flex items-center justify-center font-bold select-none">
          {[user.user.firstName, user.user.lastName]
            .filter(Boolean)
            .map((n) => n![0].toUpperCase())
            .join("") || user.user.email[0].toUpperCase()}
        </span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-44 rounded-lg shadow-lg border border-[#dfdbd8] bg-white py-1 z-50">
          <p className="px-4 py-2 text-xs text-gray-400 truncate border-b border-[#dfdbd8]">
            {user.user.email}
          </p>
          <a
            href="/profile"
            onClick={() => setOpen(false)}
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
          >
            Profile
          </a>
          {user.user.role && (
            <a
              href="/admin"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
            >
              Admin
            </a>
          )}
          <button
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-50 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
