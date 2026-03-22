#!/usr/bin/env node

/**
 * Script to upload images directly to ShelbyNet network with transaction blob_metadata::register_multiple_blobs
 * 
 * Usage:
 * 1. Ensure you have the Aptos CLI installed
 * 2. Ensure you have a wallet with sufficient funds
 * 3. Run: node scripts/upload-images-to-shelbynet.js <image-path-1> [image-path-2] ...
 */

const { AptosClient, AptosAccount, TxnBuilderTypes, BCS } = require("aptos");
const fs = require("fs");
const path = require("path");

// Configuration
const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x1"; // Update with actual contract address

// MIME type mapping for common image formats
const MIME_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.svg': 'image/svg+xml'
};

async function uploadImagesToShelbyNet(imagePaths, account) {
  const client = new AptosClient(NODE_URL);
  
  // Validate that we have image paths
  if (!imagePaths || imagePaths.length === 0) {
    throw new Error("No image paths provided");
  }
  
  console.log(`Uploading ${imagePaths.length} images to ShelbyNet...`);
  
  // Process each image
  const blobData = [];
  
  for (const imagePath of imagePaths) {
    // Check if file exists
    if (!fs.existsSync(imagePath)) {
      console.warn(`File not found: ${imagePath}`);
      continue;
    }
    
    // Read file
    const fileBuffer = fs.readFileSync(imagePath);
    
    // Get file extension and MIME type
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    // Generate blob ID (using filename + timestamp)
    const fileName = path.basename(imagePath, ext);
    const blobId = `${fileName}_${Date.now()}`;
    const assetId = `asset_${fileName}_${Date.now()}`;
    
    // Convert to bytes
    const dataBytes = Array.from(fileBuffer);
    
    blobData.push({
      blob_id: blobId,
      asset_id: assetId,
      data: dataBytes,
      mime_type: mimeType
    });
    
    console.log(`Processed: ${imagePath} (${fileBuffer.length} bytes)`);
  }
  
  if (blobData.length === 0) {
    throw new Error("No valid images to upload");
  }
  
  try {
    // For multiple blobs, we need to call the register_multiple_blobs function
    // This assumes there's a function in the contract that can handle multiple blobs
    // If not, we'll need to call upload_blob multiple times
    
    console.log(`Registering ${blobData.length} blobs with blob_metadata::register_multiple_blobs...`);
    
    // Create payload for the transaction
    const payload = {
      type: "entry_function_payload",
      function: `${CONTRACT_ADDRESS}::blob_metadata::register_multiple_blobs`,
      type_arguments: [],
      arguments: [
        blobData.map(blob => blob.blob_id),
        blobData.map(blob => blob.asset_id),
        blobData.map(blob => blob.data),
        blobData.map(blob => blob.mime_type)
      ]
    };
    
    // Generate, sign, and submit transaction
    const transaction = await client.generateTransaction(account.address(), payload);
    const signedTxn = await client.signTransaction(account, transaction);
    const transactionRes = await client.submitTransaction(signedTxn);
    
    console.log("Transaction submitted. Waiting for confirmation...");
    await client.waitForTransaction(transactionRes.hash);
    
    console.log("Images uploaded successfully!");
    console.log("Transaction Hash:", transactionRes.hash);
    console.log(`View on Aptos Explorer: https://explorer.aptos.dev/txn/${transactionRes.hash}`);
    
    return transactionRes.hash;
    
  } catch (error) {
    if (error.message.includes("Function not found")) {
      console.warn("Function blob_metadata::register_multiple_blobs not found in contract. Falling back to individual uploads.");
      return await uploadImagesIndividually(blobData, account, client);
    } else {
      throw error;
    }
  }
}

async function uploadImagesIndividually(blobData, account, client) {
  console.log("Uploading images individually...");
  
  const transactionHashes = [];
  
  for (const blob of blobData) {
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${CONTRACT_ADDRESS}::blob_store::upload_blob`,
        type_arguments: [],
        arguments: [
          blob.blob_id,
          blob.asset_id,
          blob.data,
          blob.mime_type
        ]
      };
      
      const transaction = await client.generateTransaction(account.address(), payload);
      const signedTxn = await client.signTransaction(account, transaction);
      const transactionRes = await client.submitTransaction(signedTxn);
      
      await client.waitForTransaction(transactionRes.hash);
      
      console.log(`Uploaded ${blob.blob_id}: ${transactionRes.hash}`);
      transactionHashes.push(transactionRes.hash);
    } catch (error) {
      console.error(`Failed to upload ${blob.blob_id}:`, error.message);
    }
  }
  
  console.log("Individual uploads completed.");
  return transactionHashes;
}

// Main function
async function main() {
  // Get image paths from command line arguments
  const imagePaths = process.argv.slice(2);
  
  if (imagePaths.length === 0) {
    console.error("Usage: node upload-images-to-shelbynet.js <image-path-1> [image-path-2] ...");
    process.exit(1);
  }
  
  try {
    // In a real implementation, you would load the account from a wallet or private key
    // For now, we'll create a temporary account for testing
    const account = new AptosAccount();
    console.log("Using account:", account.address());
    
    // Note: In practice, you would need to fund this account first
    // This is just for demonstration
    
    const result = await uploadImagesToShelbyNet(imagePaths, account);
    console.log("Upload result:", result);
  } catch (error) {
    console.error("Upload failed:", error.message);
    process.exit(1);
  }
}

// Export for use in other modules
module.exports = { uploadImagesToShelbyNet };

// Run if called directly
if (require.main === module) {
  main();
}