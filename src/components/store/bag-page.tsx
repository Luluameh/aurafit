"use client";

import { useBag } from "@/lib/cart/bag";
import Link from "next/link";

export function BagPage({ storeSlug }: { storeSlug: string }) {
  const bag = useBag();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <p className="catalog-code">Atelier North</p>
      <h1 className="mt-2 font-display text-4xl text-noir sm:text-5xl">Cart</h1>
      {!bag.ready ? null : bag.lines.length === 0 ? (
        <div className="mt-8 border border-hairline bg-[#f6f5f2] p-6">
          <p className="text-sm leading-relaxed text-stone">The cart is empty.</p>
          <Link href={`/stores/${storeSlug}`} className="mt-6 inline-block text-sm text-noir underline underline-offset-4">
            Continue shopping
          </Link>
        </div>
      ) : (
        <>
          <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
            {bag.lines.map((line) => (
              <li key={line.product.id} className="flex items-center gap-3 py-4 sm:gap-4">
                <img src={line.product.imageUrl} alt="" className="h-24 w-16 shrink-0 object-cover sm:h-28 sm:w-20" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-noir">{line.product.name}</p>
                  <p className="mt-1 text-sm text-stone">${line.product.price}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button type="button" onClick={() => bag.setQuantity(line.product.id, line.quantity - 1)} className="h-8 w-8 border border-hairline text-sm" aria-label="Fewer">
                      −
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums">{line.quantity}</span>
                    <button type="button" onClick={() => bag.setQuantity(line.product.id, line.quantity + 1)} className="h-8 w-8 border border-hairline text-sm" aria-label="More">
                      +
                    </button>
                    <button type="button" onClick={() => bag.remove(line.product.id)} className="ml-2 text-[11px] uppercase tracking-[0.12em] text-stone">
                      Remove
                    </button>
                  </div>
                </div>
                <p className="text-sm tabular-nums text-noir">${line.product.price * line.quantity}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex items-end justify-between">
            <p className="text-xs uppercase tracking-[0.14em] text-stone">Total</p>
            <p className="font-display text-4xl text-noir">${bag.total}</p>
          </div>
          <Link
            href={`/stores/${storeSlug}/checkout`}
            className="fsh-btn mt-6 flex w-full items-center justify-center bg-noir py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white sm:w-72"
          >
            Checkout
          </Link>
        </>
      )}
    </div>
  );
}
