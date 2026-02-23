import useSWR, { mutate } from "swr";
import { NextResponse } from "next/dist/server/web/spec-extension/response";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });

  if (res.status === 401) {
    return NextResponse.json({ user: null });
  }

  if (!res.ok) {
    throw new Error("Failed to fetch");
  }

  return res.json();
};

export function useAuth() {
  const { data, isLoading } = useSWR("/api/auth/users", fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
  });

  const refreshUser = async () => {
    await mutate("/api/auth/users");
  };

  return {
    user: data,
    isLoading,
    refreshUser,
  };
}
