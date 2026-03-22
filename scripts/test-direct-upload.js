#!/usr/bin/env node

/**
 * Test script for direct image upload to ShelbyNet
 * This script creates a dummy image and tests the upload functionality
 */

const fs = require("fs");
const path = require("path");

// Create a simple test image (1x1 pixel PNG as base64)
const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
const testImagePath = path.join(__dirname, "test-image.png");

async function main() {
  console.log("Creating test image...");
  
  // Write test image to file
  const imageData = Buffer.from(testImageBase64, 'base64');
  fs.writeFileSync(testImagePath, imageData);
  
  console.log(`Test image created at: ${testImagePath}`);
  console.log("To test direct upload, run:");
  console.log(`npm run move:upload-images ${testImagePath}`);
  
  // Clean up test image after 10 seconds
  setTimeout(() => {
    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
      console.log("Test image cleaned up.");
    }
  }, 10000);
}

if (require.main === module) {
  main().catch(console.error);
}