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
}

// 1 year default TTL
const TIME_TO_LIVE = 365 * 24 * 60 * 60 * 1_000_000;

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

  // Using a hash + timestamp for a unique blob name
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const blobName = `sh-${hash.substring(0, 12)}-${Date.now()}-${filename}`;

  await client.upload({
    blobData: buffer,
    signer,
    blobName,
    expirationMicros: Date.now() * 1000 + TIME_TO_LIVE,
  });

  console.log(`[Shelby] Upload complete. Blob Name: ${blobName}`);

  return {
    id: blobName,
    url: `https://shelby.internal/storage/assets/${blobName}`, // Replace with actual Shelby viewing URL if applicable
    filename,
    mimeType,
    size: buffer.length,
    metadata,
    uploadedAt: new Date().toISOString(),
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
  const hash = crypto.createHash("sha256").update(buffer).digest("hex");
  const assetId = `sh-${hash.substring(0, 12)}-${Date.now()}`;
  return {
    id: assetId,
    url: `https://shelby.internal/storage/assets/${assetId}`,
    filename,
    mimeType,
    size: buffer.length,
    metadata,
    uploadedAt: new Date().toISOString(),
  };
}

export async function getAssetFromShelby(assetId: string): Promise<ShelbyAsset | null> {
  console.log(`[Shelby] Fetching asset: ${assetId}`);
  return null;
}
