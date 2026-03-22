import crypto from "crypto";
import { Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";

export interface ShelbyAsset {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  size: number;
  metadata: Record<string, unknown>;
  uploadedAt: string;
  accountAddress?: string;
  blobName?: string;
  explorerUrl?: string;
}

// 1 year default TTL
const TIME_TO_LIVE = 365 * 24 * 60 * 60 * 1_000_000;

function normalizeBlobFileName(filename: string) {
  const baseName = filename.replace(/\.[^/.]+$/, "");
  const sanitized = baseName.replace(/[^a-zA-Z0-9-_ ]/g, "").trim() || "upload";
  return `${sanitized}.webp`;
}

export async function uploadAssetToShelby(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  metadata: Record<string, unknown> = {}
): Promise<ShelbyAsset> {
  const privateKey = process.env.SHELBY_ACCOUNT_PRIVATE_KEY;
  const apiKey = process.env.SHELBY_API_KEY;

  if (!privateKey || !apiKey) {
    console.warn("[Shelby] Missing API keys. Using mock fallback mode for development.");
    return mockUploadAsset(buffer, filename, mimeType, metadata);
  }

  console.log(`[Shelby] Uploading asset via official SDK: ${filename} (${buffer.length} bytes)`);

  const client = new ShelbyNodeClient({
    network: Network.SHELBYNET,
    apiKey,
  });

  const signer = Account.fromPrivateKey({
    privateKey: new Ed25519PrivateKey(privateKey),
  });

  const normalizedFileName = normalizeBlobFileName(filename);
  const accountAddress = signer.accountAddress.toString();

  await client.upload({
    blobData: buffer,
    signer,
    blobName: normalizedFileName,
    expirationMicros: Date.now() * 1000 + TIME_TO_LIVE,
  });

  console.log(`[Shelby] Upload complete. Blob Name: ${normalizedFileName}`);

  return {
    id: normalizedFileName,
    url: `https://api.shelbynet.shelby.xyz/shelby/v1/blobs/${accountAddress}/${normalizedFileName}`,
    filename,
    mimeType,
    size: buffer.length,
    metadata,
    uploadedAt: new Date().toISOString(),
    accountAddress,
    blobName: normalizedFileName,
    explorerUrl: `https://explorer.shelby.xyz/shelbynet/account/${accountAddress}/blobs?name=${encodeURIComponent(normalizedFileName)}`,
  };
}

async function mockUploadAsset(
  buffer: Buffer,
  filename: string,
  mimeType: string,
  metadata: Record<string, unknown> = {}
): Promise<ShelbyAsset> {
  console.log(`[Shelby Mock] Uploading asset: ${filename}`);
  await new Promise((resolve) => setTimeout(resolve, 500));
  const assetId = normalizeBlobFileName(filename);
  
  // Save file to mock storage for development
  const fs = require("fs");
  const path = require("path");
  const MOCK_STORAGE_DIR = path.join(process.cwd(), "data", "mock-uploads");
  
  // Ensure the mock storage directory exists
  if (!fs.existsSync(MOCK_STORAGE_DIR)) {
    fs.mkdirSync(MOCK_STORAGE_DIR, { recursive: true });
  }
  
  // Save the file
  const filePath = path.join(MOCK_STORAGE_DIR, assetId);
  fs.writeFileSync(filePath, buffer);
  
  return {
    id: assetId,
    url: `http://localhost:3000/api/assets/${assetId}`,
    filename,
    mimeType,
    size: buffer.length,
    metadata,
    uploadedAt: new Date().toISOString(),
    blobName: assetId,
    explorerUrl: `https://explorer.shelby.xyz/shelbynet/account/mock/blobs?name=${encodeURIComponent(assetId)}`,
  };
}

export async function getAssetFromShelby(assetId: string): Promise<ShelbyAsset | null> {
  console.log(`[Shelby] Fetching asset: ${assetId}`);
  return null;
}
