import {
  assertCustomerPhoto,
  assertPhotoDimensions,
  PhotoValidationError,
  removeCustomerBackground,
} from "@/lib/photo/remove-background";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file field" }, { status: 400 });
    }

    assertCustomerPhoto(file.type, file.size);
    const original = Buffer.from(await file.arrayBuffer());
    await assertPhotoDimensions(original);

    try {
      const processed = await removeCustomerBackground(original);
      return new NextResponse(new Uint8Array(processed), {
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "no-store",
          "X-FSH-Background": "removed",
        },
      });
    } catch (error) {
      console.error("Background removal failed", error instanceof Error ? error.message : error);
      return new NextResponse(new Uint8Array(original), {
        headers: {
          "Content-Type": file.type || "application/octet-stream",
          "Cache-Control": "no-store",
          "X-FSH-Background": "original",
        },
      });
    }
  } catch (error) {
    if (error instanceof PhotoValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    const message = error instanceof Error ? error.message : "Could not read that photo";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
