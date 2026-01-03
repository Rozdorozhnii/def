import { headers } from "next/headers";

export async function getBaseUrl() {
  const headersList = headers();
  const host = (await headersList).get("host");

  if (!host) {
    throw new Error("Host header is missing");
  }

  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

  return `${protocol}://${host}`;
}