import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Mock storage for development
const MOCK_STORAGE_DIR = path.join(process.cwd(), "data", "mock-uploads");

// Ensure the mock storage directory exists
if (!fs.existsSync(MOCK_STORAGE_DIR)) {
  fs.mkdirSync(MOCK_STORAGE_DIR, { recursive: true });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    // In a real implementation, you would fetch the asset from Shelby
    // For development, we'll serve from mock storage
    
    // Check if this is a mock asset by looking for it in our mock storage
    const mockFilePath = path.join(MOCK_STORAGE_DIR, id);
    
    if (fs.existsSync(mockFilePath)) {
      // Determine content type based on file extension
      const ext = path.extname(id).toLowerCase();
      let contentType = "application/octet-stream";
      
      if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".png") contentType = "image/png";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".webp") contentType = "image/webp";
      else if (ext === ".svg") contentType = "image/svg+xml";
      
      const fileBuffer = fs.readFileSync(mockFilePath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }
    
    // If not found in mock storage, return 404
    return NextResponse.json(
      { error: "Asset not found" },
      { status: 404 }
    );
  } catch (error) {
    console.error("Error serving asset:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}