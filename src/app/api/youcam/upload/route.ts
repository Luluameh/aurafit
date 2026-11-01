import { uploadClothImage, uploadYouCamFile } from "@/lib/youcam/client";
import { NextResponse } from "next/server";

const MAX_BYTES = 10 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const purpose = new URL(request.url).searchParams.get("purpose");
    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image must be 10MB or smaller" },
        { status: 400 },
      );
    }

    const buffer = await file.arrayBuffer();
    const upload =
      purpose === "analysis"
        ? uploadYouCamFile
        : uploadClothImage;
    const fileId = await upload(
      file.name || "upload.jpg",
      file.type || "image/jpeg",
      file.size,
      buffer,
    );

    return NextResponse.json({ fileId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
