"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth/useAuth";
import { isPasswordValid } from "@/lib/password";
import { PasswordRequirements } from "@/components/PasswordRequirements";

type AuthMode = "login" | "register" | "reset";

const inputClass = "border border-[#dfdbd8] rounded-lg px-2.5 py-[7px] outline-none w-full";
const labelClass = "mb-2.5 block font-bold";
const eyeClass = (visible: boolean) =>
  `block absolute cursor-pointer right-2 top-[51px] w-[30px] h-[30px] bg-no-repeat bg-center bg-[length:26px_26px] ${
    visible ? "bg-[url('/icons/icon-show.svg')]" : "bg-[url('/icons/icon-hide.svg')]"
  }`;

export default function LoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isVisibleConfirmPassword, setIsVisibleConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (mode === "register") {
      if (!isPasswordValid(password)) {
        setError("Password does not meet requirements");
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    const endpointMap = {
      login: "/api/auth/login",
      register: "/api/auth/register",
      reset: "/api/auth/forgot-password",
    };

    const body =
      mode === "reset"
        ? { email }
        : mode === "register"
          ? {
              email,
              password,
              firstName: firstName.trim() || undefined,
              lastName: lastName.trim() || undefined,
            }
          : { email, password };

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
    } else if (mode === "register") {
      setSuccess("Check your email to verify your account");
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
              <label className={labelClass} htmlFor="email">Email</label>
              <input
                className={inputClass}
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* FIRST NAME + LAST NAME */}
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-4 py-3">
                <div>
                  <label className={labelClass} htmlFor="firstName">
                    First name{" "}
                    <span className="text-gray-400 font-normal text-sm">(optional)</span>
                  </label>
                  <input
                    className={inputClass}
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass} htmlFor="lastName">
                    Last name{" "}
                    <span className="text-gray-400 font-normal text-sm">(optional)</span>
                  </label>
                  <input
                    className={inputClass}
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* PASSWORD */}
            {mode !== "reset" && (
              <div className="relative py-3">
                <label className={labelClass} htmlFor="password">Password</label>
                <input
                  className={inputClass}
                  id="password"
                  type={isVisiblePassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span className={eyeClass(isVisiblePassword)} onClick={() => setIsVisiblePassword(!isVisiblePassword)} />
                {mode === "register" && <PasswordRequirements password={password} />}
              </div>
            )}

            {/* CONFIRM PASSWORD */}
            {mode === "register" && (
              <div className="relative py-3">
                <label className={labelClass} htmlFor="confirmPassword">Confirm Password</label>
                <input
                  className={inputClass}
                  id="confirmPassword"
                  type={isVisibleConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <span className={eyeClass(isVisibleConfirmPassword)} onClick={() => setIsVisibleConfirmPassword(!isVisibleConfirmPassword)} />
              </div>
            )}

            {error && <p className="text-red-500">{error}</p>}
            {success && <p className="text-green-600">{success}</p>}

            <div className="py-3">
              <button
                type="submit"
                disabled={
                  mode === "register"
                    ? !email || !isPasswordValid(password) || !confirmPassword
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

          <div className="mt-6 text-center space-y-2 text-sm">
            {mode !== "login" && (
              <button onClick={() => switchMode("login")} className="cursor-pointer text-gray-500 hover:text-black transition duration-200">
                ← Back to login
              </button>
            )}
            {mode === "login" && (
              <div className="flex justify-between">
                <button onClick={() => switchMode("register")} className="cursor-pointer text-gray-500 hover:text-black transition duration-200">
                  Create account
                </button>
                <button onClick={() => switchMode("reset")} className="cursor-pointer text-gray-500 hover:text-black transition duration-200">
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
