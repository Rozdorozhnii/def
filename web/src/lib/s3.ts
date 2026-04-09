import { S3Client } from "@aws-sdk/client-s3";

// Single instance reused across all requests — avoids creating
// a new HTTP connection pool on every upload.
// Dev → MinIO (http://minio:9000), Prod → Cloudflare R2
export const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT,
  region: process.env.S3_REGION ?? "auto",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_KEY!,
  },
  // MinIO and R2 use path-style URLs: host/bucket/key
  // Without this flag SDK would try bucket.host/key which doesn't exist
  forcePathStyle: true,
});
