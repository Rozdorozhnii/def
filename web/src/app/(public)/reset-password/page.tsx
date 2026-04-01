"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  if (token === "") {
    return (
      <main>
        <div className="container mx-auto px-4">
          <div className="mx-auto my-25 p-8 max-w-112 rounded-lg shadow-md bg-white text-center">
            <p className="text-red-500">Invalid reset link</p>
          </div>
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

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword: password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.message || "Invalid or expired link");
      return;
    }

    router.push("/login");
  };

  return (
    <main>
      <div className="container mx-auto px-4">
        <div className="mx-auto my-25 p-8 max-w-112 rounded-lg shadow-md bg-white">
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
              />
              <span
                className={`block absolute cursor-pointer right-2 top-[51px] w-[30px] h-[30px] bg-no-repeat bg-center bg-[length:26px_26px]
                  ${isVisible ? "bg-[url('/icons/icon-show.svg')]" : "bg-[url('/icons/icon-hide.svg')]"}`}
                onClick={() => setIsVisible(!isVisible)}
              />
            </div>

            <div className="py-3">
              <label className="mb-2.5 block font-bold" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none w-full"
                id="confirmPassword"
                type={isVisible ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="text-red-500">{error}</p>}

            <div className="py-3">
              <button
                type="submit"
                disabled={!password || !confirmPassword}
                className="cursor-pointer font-bold w-full h-[50px] rounded-[38px] text-white
                           border border-[#ff4102] bg-[#ff4102] shadow-md
                           hover:bg-white hover:text-[#ff4102] hover:shadow-xl transition duration-300
                           disabled:cursor-not-allowed"
              >
                Set new password
              </button>
            </div>
          </form>
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
