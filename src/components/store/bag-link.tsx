"use client";

import { useBag } from "@/lib/cart/bag";
import Link from "next/link";

export function BagLink({ storeSlug }: { storeSlug: string }) {
  const bag = useBag();
  const bumped = Boolean(bag.justAdded);

  return (
    <Link
      href={`/stores/${storeSlug}/bag`}
      aria-label={bag.count === 1 ? "Cart, 1 item" : bag.count > 1 ? `Cart, ${bag.count} items` : "Cart"}
      className={`relative inline-flex h-9 w-9 items-center justify-center text-noir ${bumped ? "scale-110" : ""}`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M6.5 8h11l-.8 11.2a1 1 0 0 1-1 .8H8.3a1 1 0 0 1-1-.8L6.5 8Z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
        <path d="M9 8V6.5A3 3 0 0 1 12 3.5 3 3 0 0 1 15 6.5V8" stroke="currentColor" strokeWidth="1.4" />
      </svg>
      {bag.count > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-noir px-1 text-[9px] font-semibold leading-none text-white">
          {bag.count}
        </span>
      )}
    </Link>
  );
}
