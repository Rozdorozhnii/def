"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { mutate } from "swr";

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const confirm = async () => {
      try {
        const res = await fetch("/api/profile/email/confirm", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) throw new Error();

        await mutate("/api/auth/users");
        setStatus("success");
        setTimeout(() => router.push("/profile"), 2000);
      } catch {
        setStatus("error");
      }
    };

    confirm();
  }, [searchParams, router]);

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center p-8 rounded-lg shadow-md bg-white border border-[#dfdbd8]">
        {status === "verifying" && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 rounded-full border-4 border-[#ff4102] border-t-transparent animate-spin" />
            <h1 className="text-xl font-bold mb-2">Confirming your new email…</h1>
            <p className="text-sm text-gray-500">Please wait a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 text-4xl">✅</div>
            <h1 className="text-xl font-bold mb-2">Email updated!</h1>
            <p className="text-sm text-gray-500">Redirecting to your profile…</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-4 text-4xl">❌</div>
            <h1 className="text-xl font-bold mb-2">Confirmation failed</h1>
            <p className="text-sm text-gray-500 mb-6">The link may be invalid or expired.</p>
            <Link
              href="/profile"
              className="cursor-pointer inline-block font-bold px-6 py-2.5 rounded text-sm text-white border border-[#ff4102] bg-[#ff4102] shadow-md hover:bg-white hover:text-[#ff4102] transition duration-300"
            >
              Back to profile
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
