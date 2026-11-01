"use client";

import { ProductImage } from "@/components/product-image";
import { storeGallery } from "@/lib/data/garment-views";
import type { Product } from "@/lib/data/products";
import { useState } from "react";

type StoreGarmentPhotoProps = {
  product: Product;
  sizes: string;
  priority?: boolean;
};

export function StoreGarmentPhoto({ product, sizes, priority }: StoreGarmentPhotoProps) {
  const gallery = storeGallery(product);
  const [index, setIndex] = useState(0);
  const current = gallery[index] ?? gallery[0];

  return (
    <>
      {gallery.map((item) => (
        <ProductImage
          key={item.url}
          productId={product.id}
          src={item.url}
          alt={`${product.name}, store ${item.label.toLowerCase()} photo`}
          fill
          priority={priority && item.url === gallery[0].url}
          className={`fsh-crossfade object-cover ${
            item.url === current.url ? "opacity-100" : "opacity-0"
          }`}
          sizes={sizes}
        />
      ))}
      {gallery.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
          {gallery.map((item, itemIndex) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setIndex(itemIndex)}
              className={`fsh-tab px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                index === itemIndex ? "bg-noir text-white" : "bg-white text-noir"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
