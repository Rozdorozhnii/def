"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/useAuth";

type AuthMode = "login" | "register" | "reset";

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisibleConfirmPassword, setIsVisibleConfirmPassword] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const endpointMap = {
      login: "/api/auth/login",
      register: "/api/auth/register",
      reset: "/api/auth/reset-password",
    };

    const body = mode === "reset" ? { email } : { email, password };

    const res = await fetch(endpointMap[mode], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.message || "Something went wrong");
      return;
    }

    if (mode === "reset") {
      setSuccess("Password reset email sent");
    } else {
      await refreshUser();
      router.push("/");
    }
  };

  return (
    <main>
      <div className="container mx-auto px-4">
        <div className="mx-auto my-25 p-8 max-w-112 rounded-lg shadow-md bg-white">
          <form onSubmit={handleSubmit}>
            <div className="py-3">
              <label className="mb-2.5 block font-bold" htmlFor="email">
                Email
              </label>
              <input
                className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none w-full"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* PASSWORD */}
            {mode !== "reset" && (
              <div className="relative w-full py-3">
                <label className="mb-2.5 block font-bold" htmlFor="password">
                  Password
                </label>
                <input
                  className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none w-full"
                  id="password"
                  type={isVisiblePassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span
                  className={`"block absolute cursor-pointer right-2 top-[51px] w-[30px] h-[30px] bg-no-repeat bg-center bg-[length:26px_26px]
                ${
                  isVisiblePassword
                    ? "bg-[url('/icons/icon-show.svg')]"
                    : "bg-[url('/icons/icon-hide.svg')]"
                }`}
                  onClick={() => setIsVisiblePassword(!isVisiblePassword)}
                />
              </div>
            )}

            {/* CONFIRM PASSWORD */}
            {mode === "register" && (
              <div className="relative py-3">
                <label
                  className="mb-2.5 block font-bold"
                  htmlFor="confirmPassword"
                >
                  Confirm Password
                </label>
                <input
                  className="border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none w-full"
                  id="confirmPassword"
                  type={isVisibleConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span
                  className={`"block absolute cursor-pointer right-2 top-[51px] w-[30px] h-[30px] bg-no-repeat bg-center bg-[length:26px_26px]
                ${
                  isVisibleConfirmPassword
                    ? "bg-[url('/icons/icon-show.svg')]"
                    : "bg-[url('/icons/icon-hide.svg')]"
                }`}
                  onClick={() =>
                    setIsVisibleConfirmPassword(!isVisibleConfirmPassword)
                  }
                />
              </div>
            )}

            {/* ERRORS / SUCCESS */}
            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            {/* SUBMIT */}
            <div className="py-3">
              <button
                type="submit"
                disabled={
                  mode === "register"
                    ? !email || !password || !confirmPassword
                    : mode === "login"
                      ? !email || !password
                      : !email
                }
                className="cursor-pointer font-bold w-full h-[50px] rounded-[38px] text-white
                          border border-[#ff4102] bg-[#ff4102] shadow-md
                        hover:bg-white hover:text-[#ff4102] hover:shadow-xl transition duration-300
                        disabled:cursor-not-allowed"
              >
                {mode === "login" && "Login"}
                {mode === "register" && "Register"}
                {mode === "reset" && "Reset password"}
              </button>
            </div>
          </form>

          {/* SWITCH MODE */}
          <div className="text-center space-y-2 text-sm">
            {mode !== "login" && (
              <button onClick={() => setMode("login")} className="link">
                Back to login
              </button>
            )}

            {mode === "login" && (
              <div className="flex justify-between">
                <button
                  onClick={() => setMode("register")}
                  className="link cursor-pointer"
                >
                  Create account
                </button>
                <button
                  onClick={() => setMode("reset")}
                  className="link cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
