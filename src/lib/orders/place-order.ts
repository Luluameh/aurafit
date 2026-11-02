import { getProduct } from "@/lib/data/products";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export type CheckoutInput = {
  storeSlug: string;
  name: string;
  email: string;
  address: string;
  city: string;
  items: { productId: string; quantity: number }[];
};

export type PlacedOrder = {
  id: string;
  reference: string;
  total: number;
  status: string;
  transactionStatus: string;
};

function supabaseFetch(input: RequestInfo | URL, init?: RequestInit) {
  const timeout = AbortSignal.timeout(15000);
  const signal = init?.signal ? AbortSignal.any([init.signal, timeout]) : timeout;
  return fetch(input, { ...init, cache: "no-store", signal });
}

function database(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY)?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { fetch: supabaseFetch },
  });
}

function savedMessage(error: { message: string } | null, fallback: string) {
  const message = error?.message || fallback;
  if (/fetch failed|timeout|aborted|network/i.test(message)) {
    return "The shop could not reach Supabase. Restart the dev server, then place the order again.";
  }
  return message;
}

export function ordersConfigured() {
  return Boolean(process.env.SUPABASE_URL && (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY));
}

function clean(value: string, max: number) {
  return value.trim().slice(0, max);
}

export async function placeOrder(input: CheckoutInput): Promise<PlacedOrder> {
  const db = database();
  if (!db) {
    throw new Error("Supabase is not connected yet. Add SUPABASE_URL and SUPABASE_SECRET_KEY.");
  }

  const name = clean(input.name, 80);
  const email = clean(input.email, 120).toLowerCase();
  const address = clean(input.address, 160);
  const city = clean(input.city, 80);
  if (!name || !address || !city || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Name, email, address, and city are required.");
  }

  const lines = input.items.flatMap((item) => {
    const product = getProduct(item.productId);
    const quantity = Math.floor(Number(item.quantity));
    if (!product || quantity < 1 || quantity > 20) return [];
    return [{ product, quantity }];
  });
  if (lines.length === 0) throw new Error("The bag is empty.");

  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const totalCents = Math.round(total * 100);
  const reference = `AF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

  const { data: order, error: orderError } = await db
    .from("orders")
    .insert({
      store_slug: input.storeSlug || "demo",
      customer_name: name,
      email,
      address,
      city,
      status: "placed",
      total_cents: totalCents,
    })
    .select("id")
    .single();

  if (orderError || !order) throw new Error(savedMessage(orderError, "The order could not be saved."));

  const { error: itemError } = await db.from("order_items").insert(
    lines.map((line) => ({
      order_id: order.id,
      product_id: line.product.id,
      name: line.product.name,
      unit_cents: Math.round(line.product.price * 100),
      quantity: line.quantity,
    })),
  );

  if (itemError) {
    await db.from("orders").delete().eq("id", order.id);
    throw new Error(savedMessage(itemError, "The order items could not be saved."));
  }

  const { error: paymentError } = await db.from("transactions").insert({
    order_id: order.id,
    amount_cents: totalCents,
    currency: "USD",
    status: "succeeded",
    reference,
  });

  if (paymentError) {
    await db.from("orders").delete().eq("id", order.id);
    throw new Error(savedMessage(paymentError, "The sample payment could not be saved."));
  }

  return {
    id: order.id as string,
    reference,
    total,
    status: "placed",
    transactionStatus: "succeeded",
  };
}

export async function readOrder(id: string) {
  const db = database();
  if (!db) return null;
  const { data: order } = await db
    .from("orders")
    .select("id, customer_name, email, address, city, status, total_cents, created_at")
    .eq("id", id)
    .maybeSingle();
  if (!order) return null;
  const { data: items } = await db
    .from("order_items")
    .select("product_id, name, unit_cents, quantity")
    .eq("order_id", id);
  const { data: payment } = await db
    .from("transactions")
    .select("reference, status, amount_cents, currency")
    .eq("order_id", id)
    .maybeSingle();
  return { order, items: items ?? [], payment };
}
