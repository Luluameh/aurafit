import { readOrder } from "@/lib/orders/place-order";
import { NextResponse } from "next/server";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const found = await readOrder(id);
  if (!found) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json(found);
}
