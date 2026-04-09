import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { s3 } from "@/lib/s3";

// Only these MIME types are accepted — prevents uploading arbitrary files
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// 5MB limit — prevents storage abuse
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  // Use cookies() from next/headers — reads the updated cookies set by middleware
  // after token refresh, unlike getCurrentUser() which may read stale cookies
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  const userRes = await fetch(`${process.env.AUTH_URL}/users/me`, {
    headers: { cookie: cookieHeader },
    cache: "no-store",
  });

  if (!userRes.ok) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await userRes.json();
  if (!user?.role) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();

  // formData.get() returns File | string | null depending on the field type
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ message: "No file provided" }, { status: 400 });
  }

  // file.type is a standard browser File API field — returns MIME type e.g. "image/jpeg"
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ message: "Invalid file type" }, { status: 400 });
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ message: "File too large (max 5MB)" }, { status: 400 });
  }

  // Build date-based path: uploads/2026/04/09/uuid.jpg
  // Keeps files organized and prevents thousands of files in one folder
  const now = new Date();
  const datePath = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  const ext = file.name.split(".").pop();
  const key = `uploads/${datePath}/${randomUUID()}.${ext}`;

  // Convert browser File to Node.js Buffer that AWS SDK can send
  const buffer = Buffer.from(await file.arrayBuffer());

  // PutObjectCommand uploads a single file to S3-compatible storage
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,  // "defenders"
      Key: key,                        // path inside the bucket
      Body: buffer,
      ContentType: file.type,          // tells browser how to render the file
    }),
  );

  // Public URL that will be embedded in the article HTML as <img src="...">
  const url = `${process.env.S3_PUBLIC_URL}/${process.env.S3_BUCKET}/${key}`;
  return NextResponse.json({ url });
}
