# Direct Image Upload to ShelbyNet

This document explains how to upload images directly to the ShelbyNet network using the `blob_metadata::register_multiple_blobs` transaction.

## Overview

The new functionality allows uploading multiple images directly to the ShelbyNet blockchain without using the traditional API endpoint. This provides a more decentralized approach to image storage and ensures that images are stored immutably on the blockchain.

## Prerequisites

1. Node.js installed (v14 or higher)
2. Aptos CLI installed
3. A funded wallet account
4. The ShelbyBlobStore contract deployed to the network

## Usage

### Using npm scripts

```bash
# Upload images using Node.js
npm run move:upload-images path/to/image1.jpg path/to/image2.png

# On Windows
npm run move:upload-images:win
```

### Using the script directly

```bash
# Direct Node.js execution
node scripts/upload-images-to-shelbynet.js path/to/image1.jpg path/to/image2.png
```

### Using PowerShell (Windows)

```powershell
# PowerShell execution
.\scripts\upload-images-to-shelbynet.ps1 -ImagePaths @("path\to\image1.jpg", "path\to\image2.png")
```

## How it works

1. The script processes each image file, converting it to bytes
2. It generates appropriate metadata including MIME types
3. It creates a transaction with the `blob_metadata::register_multiple_blobs` function call
4. The transaction is signed and submitted to the Aptos network
5. The script waits for transaction confirmation and provides the transaction hash

## Supported Image Formats

- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)
- BMP (.bmp)
- SVG (.svg)

## Configuration

The script uses the following environment variables:

- `APTOS_NODE_URL`: The Aptos node URL (defaults to Devnet)
- `CONTRACT_ADDRESS`: The deployed contract address (defaults to 0x1)

Example:
```bash
export APTOS_NODE_URL="https://fullnode.testnet.aptoslabs.com"
export CONTRACT_ADDRESS="0xYourContractAddress"
npm run move:upload-images path/to/image.jpg
```

## Error Handling

The script includes error handling for:

- Missing files
- Unsupported file formats
- Network issues
- Insufficient funds
- Contract errors

If the `blob_metadata::register_multiple_blobs` function is not found, the script will fall back to individual uploads using `upload_blob`.

## Transaction Details

After successful upload, you'll receive:

1. Transaction hash
2. Link to view the transaction on Aptos Explorer
3. Confirmation of successful upload

## Security Considerations

- Always use a funded wallet with sufficient APT for gas fees
- Store your private keys securely
- Review transactions before signing
- Test on Devnet before using on Testnet or Mainnet

## Limitations

- Large images may exceed transaction size limits
- Gas fees apply for each transaction
- Blockchain storage is permanent and immutable
- Public by default (unless contract has privacy features)

## Troubleshooting

### "Function not found" error
This means the `blob_metadata::register_multiple_blobs` function doesn't exist in your deployed contract. The script will automatically fall back to individual uploads.

### "Insufficient funds" error
Ensure your wallet has enough APT to cover gas fees. You can fund your account using the Aptos faucet on Devnet/Testnet.

### "Transaction expired" error
This may happen if the network is congested. Try again or increase the transaction expiration time in the code.

## Future Improvements

1. Add batch processing for large numbers of images
2. Implement retry logic for failed uploads
3. Add progress indicators for large files
4. Support for compression before upload
5. Integration with the ShelbyNet explorer for viewing uploaded images