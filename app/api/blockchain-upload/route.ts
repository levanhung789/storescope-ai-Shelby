import { NextResponse } from "next/server";
import { Account, Ed25519PrivateKey, Network } from "@aptos-labs/ts-sdk";
import { ShelbyNodeClient } from "@shelby-protocol/sdk/node";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type (images only for this example)
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    // Process the file (read as buffer)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Get environment variables
    const privateKey = process.env.SHELBY_ACCOUNT_PRIVATE_KEY;
    const apiKey = process.env.SHELBY_API_KEY;

    if (!privateKey || !apiKey) {
      return NextResponse.json({ error: "Missing Shelby configuration" }, { status: 500 });
    }

    // Initialize Shelby client
    const client = new ShelbyNodeClient({
      network: Network.SHELBYNET,
      apiKey,
    });

    // Create signer account
    const signer = Account.fromPrivateKey({
      privateKey: new Ed25519PrivateKey(privateKey),
    });

    // Generate a unique blob name
    const hash = crypto.createHash("sha256").update(buffer).digest("hex");
    const blobName = `sh-${hash.substring(0, 12)}-${Date.now()}-${file.name}`;

    // 1 year default TTL
    const TIME_TO_LIVE = 365 * 24 * 60 * 60 * 1_000_000;
    const expirationMicros = Date.now() * 1000 + TIME_TO_LIVE;

    // Upload to Shelby blockchain
    await client.upload({
      blobData: buffer,
      signer,
      blobName,
      expirationMicros,
    });

    // Get the actual transaction hash from the upload response
    // Note: The Shelby SDK's upload method doesn't directly return the transaction hash
    // We would need to modify the approach to capture the transaction hash properly
    // For now, we'll return a placeholder indicating where the hash would come from
    const transactionHash = "Transaction hash would be available here in a full implementation";

    return NextResponse.json({
      success: true,
      message: "File uploaded to Shelby blockchain successfully",
      transactionHash: transactionHash,
      blobName: blobName,
    });
  } catch (error) {
    console.error("Error uploading file to blockchain:", error);
    return NextResponse.json(
      { error: "Internal server error during blockchain upload" },
      { status: 500 }
    );
  }
}