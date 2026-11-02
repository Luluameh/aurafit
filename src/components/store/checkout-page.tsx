"use client";

import { useBag } from "@/lib/cart/bag";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function CheckoutPage({ storeSlug }: { storeSlug: string }) {
  const bag = useBag();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);

  async function place(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setPlacing(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeSlug,
          name,
          email,
          address,
          city,
          items: bag.lines.map((line) => ({
            productId: line.product.id,
            quantity: line.quantity,
          })),
        }),
      });
      const data = (await response.json()) as { id?: string; error?: string };
      if (!response.ok || !data.id) {
        setError(data.error || "The order could not be placed.");
        return;
      }
      bag.clear();
      router.push(`/stores/${storeSlug}/order/${data.id}`);
    } catch {
      setError("The order could not be placed.");
    } finally {
      setPlacing(false);
    }
  }

  if (!bag.ready) return null;

  if (bag.lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16">
        <p className="catalog-code">Checkout</p>
        <h1 className="mt-2 font-display text-4xl text-noir">Your cart is empty</h1>
        <Link href={`/stores/${storeSlug}`} className="mt-6 inline-block text-sm underline underline-offset-4">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(event) => void place(event)} className="mx-auto grid max-w-6xl gap-8 px-4 py-8 sm:px-6 sm:py-12 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
      <section className="border border-hairline bg-white p-5 sm:p-8">
        <p className="catalog-code">Delivery</p>
        <h1 className="mt-2 font-display text-4xl text-noir sm:text-5xl">Checkout</h1>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-stone">
          This is a sample order. The payment beside it is recorded as a transaction, and no card is taken.
        </p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <Field label="Name" value={name} onChange={setName} autoComplete="name" className="sm:col-span-2" />
          <Field label="Email" value={email} onChange={setEmail} type="email" autoComplete="email" className="sm:col-span-2" />
          <Field label="Address" value={address} onChange={setAddress} autoComplete="street-address" className="sm:col-span-2" />
          <Field label="City" value={city} onChange={setCity} autoComplete="address-level2" className="sm:col-span-2" />
        </div>
      </section>

      <aside className="border border-hairline bg-[#f6f5f2] lg:sticky lg:top-6">
        <div className="border-b border-gold-line px-5 py-5">
          <p className="catalog-code text-gold">Transaction</p>
          <h2 className="mt-2 font-display text-3xl text-noir">Sample payment</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone">Nothing is charged. The receipt shows this payment as succeeded.</p>
        </div>
        <ul className="divide-y divide-hairline px-5">
          {bag.lines.map((line) => (
            <li key={line.product.id} className="flex items-center gap-3 py-4">
              <img src={line.product.imageUrl} alt="" className="h-16 w-12 object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-noir">{line.product.name}</p>
                <p className="mt-1 text-xs text-stone">Qty {line.quantity}</p>
              </div>
              <p className="text-sm tabular-nums">${line.product.price * line.quantity}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-hairline px-5 py-4 text-sm">
          <div className="flex justify-between text-stone">
            <span>Subtotal</span>
            <span className="tabular-nums text-noir">${bag.total}</span>
          </div>
          <div className="flex justify-between text-stone">
            <span>Sample payment</span>
            <span>No charge</span>
          </div>
          <div className="flex items-end justify-between pt-2">
            <span className="text-xs uppercase tracking-[0.14em] text-stone">Total</span>
            <span className="font-display text-4xl text-noir">${bag.total}</span>
          </div>
        </div>
        {error && <p className="px-5 pb-2 text-sm text-red-800">{error}</p>}
        <div className="px-5 pb-5">
          <button
            type="submit"
            disabled={placing}
            className="fsh-btn w-full bg-noir py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white disabled:opacity-50"
          >
            {placing ? "Recording payment…" : "Place order"}
          </button>
        </div>
      </aside>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="catalog-code">{label}</span>
      <input
        required
        type={type}
        value={value}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-hairline bg-white px-3 py-3 text-sm outline-none focus:border-noir"
      />
    </label>
  );
}
