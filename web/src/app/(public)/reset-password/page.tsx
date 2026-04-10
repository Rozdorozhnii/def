"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleConfirm, setIsVisibleConfirm] = useState(false);

  if (token === "") {
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center p-8 rounded-lg shadow-md bg-white border border-[#dfdbd8]">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold mb-2">Invalid reset link</h1>
          <p className="text-sm text-gray-500 mb-6">
            This link is invalid or has already been used. Request a new one from the login page.
          </p>
          <Link
            href="/login"
            className="cursor-pointer inline-block font-bold px-6 py-2.5 rounded text-sm text-white
              border border-[#ff4102] bg-[#ff4102] shadow-md
              hover:bg-white hover:text-[#ff4102] transition duration-300"
          >
            Back to login
          </Link>
        </div>
      </main>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Invalid or expired link");
      return;
    }

    router.push("/login");
  };

  return (
    <main className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md p-8 rounded-lg shadow-md bg-white border border-[#dfdbd8]">
        <h1 className="text-2xl font-bold mb-2">Set new password</h1>
        <p className="text-sm text-gray-500 mb-6">Choose a strong password for your account.</p>

        <form onSubmit={handleSubmit}>
          <div className="relative py-3">
            <label className="mb-2.5 block font-bold" htmlFor="password">
              New Password
            </label>
            <input
              className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none w-full"
              id="password"
              type={isVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
            />
            <span
              className={`block absolute cursor-pointer right-2 top-[51px] w-[30px] h-[30px] bg-no-repeat bg-center bg-[length:26px_26px]
                ${isVisible ? "bg-[url('/icons/icon-show.svg')]" : "bg-[url('/icons/icon-hide.svg')]"}`}
              onClick={() => setIsVisible(!isVisible)}
            />
          </div>

          <div className="relative py-3">
            <label className="mb-2.5 block font-bold" htmlFor="confirmPassword">
              Confirm Password
            </label>
            <input
              className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none w-full"
              id="confirmPassword"
              type={isVisibleConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <span
              className={`"block absolute cursor-pointer right-2 top-[51px] w-[30px] h-[30px] bg-no-repeat bg-center bg-[length:26px_26px]
                ${isVisibleConfirm ? "bg-[url('/icons/icon-show.svg')]" : "bg-[url('/icons/icon-hide.svg')]"}`}
              onClick={() => setIsVisibleConfirm(!isVisibleConfirm)}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={!password || !confirmPassword || loading}
              className="cursor-pointer font-bold w-full h-[50px] rounded-[38px] text-white
                border border-[#ff4102] bg-[#ff4102] shadow-md
                hover:bg-white hover:text-[#ff4102] hover:shadow-xl transition duration-300
                disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Saving…" : "Set new password"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="cursor-pointer text-sm text-gray-500 hover:text-black transition duration-200"
          >
            ← Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
