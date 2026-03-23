#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";

const MIME_TYPES = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".svg": "image/svg+xml",
};

async function uploadImagesToShelbyNet(imagePaths, account) {
  const apiKey = process.env.SHELBY_API_KEY;

  if (!apiKey) {
    throw new Error("Missing SHELBY_API_KEY");
  }

  if (!imagePaths || imagePaths.length === 0) {
    throw new Error("No image paths provided");
  }

  const client = new ShelbyNodeClient({
    network: Network.SHELBYNET,
    apiKey,
  });

  console.log(`Uploading ${imagePaths.length} images to ShelbyNet...`);

  const results = [];

  for (const imagePath of imagePaths) {
    if (!fs.existsSync(imagePath)) {
      console.warn(`File not found: ${imagePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || "application/octet-stream";
    const fileName = path.basename(imagePath, ext);
    const normalizedFileName = `${fileName}.webp`;

    console.log(`Processed: ${imagePath} (${fileBuffer.length} bytes)`);

    await client.upload({
      blobData: fileBuffer,
      signer: account,
      blobName: normalizedFileName,
      expirationMicros: Date.now() * 1000 + 365 * 24 * 60 * 60 * 1_000_000,
    });

    console.log(`Uploaded ${normalizedFileName}`);

    results.push({
      imagePath,
      filename: normalizedFileName,
      mimeType,
    });
  }

  if (results.length === 0) {
    throw new Error("No valid images to upload");
  }

  console.log("Uploads completed.");
  return results;
}

async function main() {
  const imagePaths = process.argv.slice(2);

  if (imagePaths.length === 0) {
    console.error("Usage: node scripts/upload-images-to-shelbynet.mjs <image-path-1> [image-path-2] ...");
    process.exit(1);
  }

  try {
    const privateKey = process.env.SHELBY_ACCOUNT_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("Missing SHELBY_ACCOUNT_PRIVATE_KEY");
    }

    const account = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKey),
    });
    console.log("Using account:", account.accountAddress.toString());

    const result = await uploadImagesToShelbyNet(imagePaths, account);
    console.log("Upload result:", result);
  } catch (error) {
    console.error("Upload failed:", error.message);
    process.exit(1);
  }
}

main();
