import { placeOrder } from "@/lib/orders/place-order";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    storeSlug?: string;
    name?: string;
    email?: string;
    address?: string;
    city?: string;
    items?: { productId?: string; quantity?: number }[];
  };

  try {
    const order = await placeOrder({
      storeSlug: body.storeSlug || "demo",
      name: body.name || "",
      email: body.email || "",
      address: body.address || "",
      city: body.city || "",
      items: (body.items ?? []).flatMap((item) =>
        item.productId ? [{ productId: item.productId, quantity: Number(item.quantity) }] : [],
      ),
    });
    return NextResponse.json(order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "The order could not be placed.";
    const status = message.includes("Supabase is not connected") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
