import { mkdir, writeFile, readFile } from "fs/promises";
import { randomBytes } from "crypto";
import path from "path";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const MAX_BYTES = 25 * 1024 * 1024; // 25MB — documents only
const ALLOWED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/zip",
  "application/x-zip-compressed",
  "text/csv",
  "text/plain",
  "text/html",
  "image/png",
  "image/jpeg",
];

// Neon object storage is S3-compatible; when its env vars are present we store
// there instead of the local disk (serverless runtimes have no writable fs).
const s3 = process.env.AWS_ENDPOINT_URL_S3
  ? new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })
  : null;
const BUCKET = process.env.S3_BUCKET || "assets";

function checkName(name: string) {
  const ext = path.extname(name).toLowerCase();
  if ([".fastq", ".fq", ".bam", ".vcf", ".fasta", ".fa", ".sam", ".gz"].includes(ext))
    throw new Error("Raw genomic data is never hosted on the Gateway");
  return ext;
}

export async function saveUpload(file: File): Promise<{ key: string; size: number }> {
  if (file.size > MAX_BYTES) throw new Error("Max 25MB — documents only");
  if (!ALLOWED.includes(file.type)) throw new Error("PDF, DOCX, XLSX, ZIP, CSV or images only — no raw genomic data");
  const ext = checkName(file.name);
  return saveBuffer(`${Date.now()}-${randomBytes(8).toString("hex")}${ext}`, Buffer.from(await file.arrayBuffer()), file.type);
}

// seed + internal callers that already have bytes
export async function saveBuffer(key: string, buf: Buffer, contentType = "application/octet-stream") {
  if (s3) {
    await s3.send(new PutObjectCommand({ Bucket: BUCKET, Key: key, Body: buf, ContentType: contentType }));
  } else {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, key), buf);
  }
  return { key, size: buf.length };
}

export async function readUpload(key: string) {
  const safe = path.basename(key); // prevent traversal
  if (s3) {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: safe }));
    return Buffer.from(await res.Body!.transformToByteArray());
  }
  return readFile(path.join(UPLOAD_DIR, safe));
}
