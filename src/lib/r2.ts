import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || "";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || "";
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "";
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export const buildPdfKey = (studentId: string, originalName: string) => {
  const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const timestamp = Date.now();
  return `documents/${studentId}/${timestamp}-${safeName}`;
};

export const uploadPdfToR2 = async (buffer: Buffer, fileKey: string, mimeType: string) => {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    Body: buffer,
    ContentType: mimeType,
  });

  await s3Client.send(command);
  return fileKey;
};

export const deletePdfFromR2 = async (fileKey: string) => {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  });

  try {
    await s3Client.send(command);
  } catch (error) {
    console.error("Failed to delete from R2:", error);
    throw new Error("Failed to delete document from Cloudflare R2.");
  }
};

export const getSignedPdfDownloadUrl = async (fileKey: string, originalName: string) => {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ResponseContentDisposition: `inline; filename="${originalName}"`,
  });

  // Short-lived signed URL (60 seconds)
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  return signedUrl;
};
