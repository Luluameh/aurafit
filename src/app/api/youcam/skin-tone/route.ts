import { createSkinToneAnalysisTask } from "@/lib/youcam/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      srcFileId?: string;
      srcFileUrl?: string;
    };

    if (!body.srcFileId && !body.srcFileUrl) {
      return NextResponse.json(
        { error: "srcFileId or srcFileUrl is required" },
        { status: 400 },
      );
    }

    const taskId = await createSkinToneAnalysisTask({
      srcFileId: body.srcFileId,
      srcFileUrl: body.srcFileUrl,
      faceAngleStrictness: "medium",
    });

    return NextResponse.json({ taskId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not start skin analysis";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
