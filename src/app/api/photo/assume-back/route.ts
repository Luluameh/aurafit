import { assumeGarmentBack } from "@/lib/photo/assume-back";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { imageUrl?: string };
    const imageUrl = body.imageUrl?.trim() ?? "";
    const url = await assumeGarmentBack(imageUrl);
    return NextResponse.json({ url, source: "estimate" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not assume a back view";
    const status = message.includes("not configured") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
