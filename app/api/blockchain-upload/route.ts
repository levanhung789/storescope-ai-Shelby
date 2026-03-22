import { NextResponse } from "next/server";
import { uploadAssetToShelby } from "@/lib/shelby-client";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const metadataStr = formData.get("metadata") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Invalid file type. Only images are allowed." }, { status: 400 });
    }

    let metadata = {};
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch {
        metadata = {};
      }
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploaded = await uploadAssetToShelby(buffer, file.name, file.type, metadata);

    return NextResponse.json({
      success: true,
      message: "File uploaded to Shelby blockchain successfully",
      data: uploaded,
    });
  } catch (error) {
    console.error("Error uploading file to blockchain:", error);
    return NextResponse.json(
      { error: "Internal server error during blockchain upload" },
      { status: 500 }
    );
  }
}
