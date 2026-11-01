"use client";

import { ProductImage } from "@/components/product-image";
import { storeGallery } from "@/lib/data/garment-views";
import type { Product } from "@/lib/data/products";
import Link from "next/link";
import { useEffect, useState, type MouseEvent } from "react";

type ProductCardProps = {
  product: Product;
  storeSlug: string;
};

export function ProductCard({ product, storeSlug }: ProductCardProps) {
  const href = `/stores/${storeSlug}/product/${product.id}`;
  const views = storeGallery(product);
  const many = views.length > 1;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const current = views[index] ?? views[0];

  useEffect(() => {
    if (!playing || !many) return;
    const id = window.setInterval(() => {
      setIndex((item) => (item + 1) % views.length);
    }, 1600);
    return () => window.clearInterval(id);
  }, [many, playing, views.length]);

  function stop() {
    setPlaying(false);
    setIndex(0);
  }

  function step(direction: number, event: MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    setIndex((item) => (item + direction + views.length) % views.length);
  }

  return (
    <article className="group fsh-reveal">
      <div
        className="relative aspect-[3/4] overflow-hidden bg-[#f3f1ec]"
        onMouseEnter={() => many && setPlaying(true)}
        onMouseLeave={stop}
      >
        <Link href={href} className="absolute inset-0 z-10" aria-label={product.name}>
          <span className="sr-only">{product.name}</span>
        </Link>
        <span className="pointer-events-none absolute inset-0 transition duration-700 ease-out group-hover:scale-[1.04]">
          {views.map((view) => (
            <ProductImage
              key={view.url}
              productId={product.id}
              src={view.url}
              alt={`${product.name}, ${view.label.toLowerCase()}`}
              fill
              className={`object-cover transition duration-500 ease-out ${
                view.url === current.url ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ))}
        </span>
        {many && (
          <span
            aria-hidden="true"
            className={`pointer-events-none absolute left-3 top-3 z-20 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-noir transition duration-300 ${
              playing || index > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            {current.label}
          </span>
        )}
        {many && (
          <>
            <button
              type="button"
              aria-label="Previous view"
              onClick={(event) => step(-1, event)}
              className="fsh-btn absolute left-2 top-1/2 z-20 -translate-y-1/2 bg-white px-2.5 py-3 text-sm leading-none text-noir opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Next view"
              onClick={(event) => step(1, event)}
              className="fsh-btn absolute right-2 top-1/2 z-20 -translate-y-1/2 bg-white px-2.5 py-3 text-sm leading-none text-noir opacity-100 transition md:opacity-0 md:group-hover:opacity-100"
            >
              ›
            </button>
          </>
        )}
        <span className="pointer-events-none absolute inset-x-0 bottom-0 z-20 translate-y-full bg-white py-3 text-center text-[11px] uppercase tracking-[0.16em] text-noir transition duration-300 group-hover:translate-y-0">
          View
        </span>
      </div>
      <Link href={href} className="mt-3 block px-0.5">
        <p className="text-sm text-noir">{product.name}</p>
        <p className="mt-1 text-sm text-stone">${product.price}</p>
      </Link>
    </article>
  );
}
