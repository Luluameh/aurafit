"use client";

import { useBag } from "@/lib/cart/bag";
import { getProduct } from "@/lib/data/products";
import Link from "next/link";

export function CartNotice({ storeSlug = "demo" }: { storeSlug?: string }) {
  const bag = useBag();
  const product = bag.justAdded ? getProduct(bag.justAdded) : undefined;
  if (!product) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[160] flex justify-center px-4 sm:justify-end sm:px-6">
      <div className="pointer-events-auto w-full max-w-sm border border-gold-line bg-white px-4 py-3 shadow-[0_16px_40px_rgba(22,21,19,0.12)]">
        <p className="catalog-code text-gold">Added to cart</p>
        <p className="mt-1 text-sm text-noir">{product.name}</p>
        <Link
          href={`/stores/${storeSlug}/bag`}
          className="mt-2 inline-block text-[11px] font-semibold uppercase tracking-[0.14em] text-noir underline underline-offset-4"
        >
          View cart
        </Link>
      </div>
    </div>
  );
}
