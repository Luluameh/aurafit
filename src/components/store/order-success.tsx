"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Receipt = {
  order: {
    customer_name: string;
    email: string;
    address: string;
    city: string;
    status: string;
    total_cents: number;
  };
  items: { product_id: string; name: string; unit_cents: number; quantity: number }[];
  payment: { reference: string; status: string; amount_cents: number; currency: string } | null;
};

export function OrderSuccess({ storeSlug, orderId }: { storeSlug: string; orderId: string }) {
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/orders/${orderId}`)
      .then(async (response) => {
        if (!response.ok) {
          if (!cancelled) setMissing(true);
          return;
        }
        const data = (await response.json()) as Receipt;
        if (!cancelled) setReceipt(data);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (missing) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <h1 className="font-display text-4xl text-noir">Order not found</h1>
        <Link href={`/stores/${storeSlug}`} className="mt-6 inline-block text-sm underline underline-offset-4">
          Back to the shop
        </Link>
      </div>
    );
  }

  if (!receipt) {
    return <div className="mx-auto max-w-xl px-4 py-16 text-sm text-stone">Opening the receipt…</div>;
  }

  const paid = receipt.payment?.status === "succeeded";

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:py-14">
      <p className="catalog-code text-gold">Transaction complete</p>
      <h1 className="mt-2 font-display text-4xl text-noir sm:text-5xl">Thank you</h1>
      <p className="mt-4 text-sm leading-relaxed text-stone">
        {receipt.order.customer_name}, this practice order is saved. Nothing was charged.
      </p>
      <div className="mt-8 border border-hairline bg-white">
        <div className="flex items-start justify-between gap-4 border-b border-gold-line px-5 py-5">
          <div>
            <p className="catalog-code">Reference</p>
            <p className="mt-2 font-display text-3xl text-noir">{receipt.payment?.reference ?? "Saved"}</p>
          </div>
          <p className="bg-noir px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            {paid ? "Payment succeeded" : receipt.order.status}
          </p>
        </div>
        <ul className="divide-y divide-hairline px-5">
          {receipt.items.map((item) => (
            <li key={item.product_id} className="flex justify-between gap-3 py-4 text-sm">
              <span>
                {item.name} <span className="text-stone">× {item.quantity}</span>
              </span>
              <span className="tabular-nums">${(item.unit_cents * item.quantity) / 100}</span>
            </li>
          ))}
        </ul>
        <dl className="space-y-2 border-t border-hairline px-5 py-4 text-sm">
          <div className="flex justify-between text-stone">
            <dt>Payment</dt>
            <dd className="capitalize text-noir">{receipt.payment?.status ?? "Recorded"}</dd>
          </div>
          <div className="flex justify-between text-stone">
            <dt>Deliver to</dt>
            <dd className="text-right text-noir">
              {receipt.order.address}
              <br />
              {receipt.order.city}
            </dd>
          </div>
          <div className="flex items-end justify-between pt-2">
            <dt className="text-xs uppercase tracking-[0.14em] text-stone">Total</dt>
            <dd className="font-display text-4xl text-noir">${(receipt.order.total_cents / 100).toFixed(0)}</dd>
          </div>
        </dl>
      </div>
      <Link
        href={`/stores/${storeSlug}`}
        className="fsh-btn mt-8 inline-flex bg-noir px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
      >
        Back to the shop
      </Link>
    </div>
  );
}
