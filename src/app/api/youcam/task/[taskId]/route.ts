import { getClothTryOnTask } from "@/lib/youcam/client";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ taskId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { taskId } = await context.params;
    const data = await getClothTryOnTask(taskId);
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Poll failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
