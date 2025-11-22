
// import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// Configuration for Cloudflare R2 (S3 Compatible)
// Ensure you install: npm install @aws-sdk/client-s3
/*
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;
const PUBLIC_URL_BASE = process.env.R2_PUBLIC_URL; // e.g., https://pub-xxx.r2.dev

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID || "",
    secretAccessKey: SECRET_ACCESS_KEY || "",
  },
});
*/

export const StorageService = {
  /**
   * Uploads a file to storage and returns the public URL.
   */
  async uploadFile(file: File): Promise<string> {
    console.log(`[Storage Service] Uploading ${file.name} (${file.size} bytes)...`);

    // --- MOCK IMPLEMENTATION FOR DEVELOPMENT ---
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Return a fake URL or a placeholder based on file type
    const isImage = file.type.startsWith('image/');
    const mockId = Math.random().toString(36).substring(7);
    
    if (isImage) {
        // Return a random picsum image to simulate a successful image upload
        return `https://picsum.photos/seed/${mockId}/800/600`;
    }
    
    return `https://fake-storage-provider.com/files/${mockId}-${file.name}`;
    // -------------------------------------------

    /* 
    // --- REAL R2 IMPLEMENTATION ---
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const key = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;

    await S3.send(new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    }));

    return `${PUBLIC_URL_BASE}/${key}`;
    */
  },

  /**
   * Deletes a file from storage given its URL.
   */
  async deleteFile(url: string): Promise<void> {
    console.log(`[Storage Service] Deleting file at ${url}...`);
    
    // --- MOCK IMPLEMENTATION ---
    await new Promise((resolve) => setTimeout(resolve, 500));
    return;
    // --------------------------

    /*
    // --- REAL R2 IMPLEMENTATION ---
    const key = url.split('/').pop(); // Naive key extraction
    if (!key) return;

    await S3.send(new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
    }));
    */
  }
};
