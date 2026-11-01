import {
  createClothTryOnTask,
  uploadClothImage,
  type GarmentCategory,
} from "@/lib/youcam/client";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

async function garmentReference(refFileUrl?: string, refFileId?: string) {
  if (refFileId || !refFileUrl?.startsWith("/catalog/")) {
    return { refFileId, refFileUrl };
  }
  const relative = refFileUrl.slice(1);
  if (relative.includes("..")) throw new Error("Invalid garment path");
  const filePath = path.join(process.cwd(), "public", relative);
  const bytes = await readFile(filePath);
  const body = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
  const uploadedId = await uploadClothImage(
    path.basename(filePath),
    "image/jpeg",
    bytes.byteLength,
    body,
  );
  return { refFileId: uploadedId, refFileUrl: undefined };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      srcFileId?: string;
      srcFileUrl?: string;
      refFileUrl?: string;
      refFileId?: string;
      garmentCategory?: GarmentCategory;
    };

    if (!body.srcFileId && !body.srcFileUrl) {
      return NextResponse.json(
        { error: "A person photo (srcFileId or srcFileUrl) is required" },
        { status: 400 },
      );
    }

    if (!body.refFileId && !body.refFileUrl) {
      return NextResponse.json(
        { error: "Garment reference (refFileId or refFileUrl) is required" },
        { status: 400 },
      );
    }

    const garment = await garmentReference(body.refFileUrl, body.refFileId);
    const taskId = await createClothTryOnTask({
      srcFileId: body.srcFileId,
      srcFileUrl: body.srcFileUrl,
      refFileId: garment.refFileId,
      refFileUrl: garment.refFileUrl,
      garmentCategory: body.garmentCategory ?? "auto",
    });

    return NextResponse.json({ taskId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Try-on failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
