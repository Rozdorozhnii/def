"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setError(true);
      return;
    }

    const verify = async () => {
      try {
        const res = await fetch("/api/auth/verify-email", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          throw new Error();
        }

        setTimeout(() => {
          router.push("/");
        }, 800);
      } catch {
        setError(true);
      }
    };

    verify();
  }, [searchParams, router]);

  if (error) {
    return <div>Verification failed</div>;
  }

  return <div>Verifying your email...</div>;
}
