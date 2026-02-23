"use client";

import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/useAuth";

export function AuthStatus() {
  const router = useRouter();
  const { user, refreshUser, isLoading } = useAuth();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });

    await refreshUser();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
    );
  }

  if (!user) return <a href="/login">Login</a>;

  return (
    <button onClick={handleLogout} className="text-red-500 hover:underline">
      Logout
    </button>
  );
}
