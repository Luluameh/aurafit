"use client";

import { useBag } from "@/lib/cart/bag";

export function AddToBag({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  const bag = useBag();
  const added = bag.justAdded === productId;

  return (
    <button
      type="button"
      onClick={() => bag.add(productId)}
      className={`fsh-btn inline-flex items-center justify-center gap-2 bg-noir px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-white ${className}`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6.5 8h11l-.8 11.2a1 1 0 0 1-1 .8H8.3a1 1 0 0 1-1-.8L6.5 8Z" stroke="currentColor" strokeWidth="1.6" />
        <path d="M9 8V6.5A3 3 0 0 1 12 3.5 3 3 0 0 1 15 6.5V8" stroke="currentColor" strokeWidth="1.6" />
      </svg>
      {added ? "Added to cart" : "Add to cart"}
    </button>
  );
}
