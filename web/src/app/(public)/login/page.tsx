"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisiblePassword, setIsVisiblePassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      router.push("/");
    } else {
      const data = await res.json();
      setError(data.message);
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

            {error && <p style={{ color: "red" }}>{error}</p>}
            <div className="py-3">
              <button
                type="submit"
                disabled={!email || !password}
                className="cursor-pointer font-bold w-full h-[50px] rounded-[38px] text-white
                          border border-[#ff4102] bg-[#ff4102] shadow-md
                        hover:bg-white hover:text-[#ff4102] hover:shadow-xl transition duration-300
                        disabled:cursor-not-allowed"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
