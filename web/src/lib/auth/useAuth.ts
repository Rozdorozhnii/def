import useSWR, { mutate } from "swr";

const fetcher = async (url: string) => {
  const res = await fetch(url, { credentials: "include" });

  if (res.status === 401) {
    return null;
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
