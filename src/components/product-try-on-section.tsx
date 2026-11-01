"use client";

import { TryOnPanel } from "@/components/try-on-panel";
import type { Product } from "@/lib/data/products";
import { useSearchParams } from "next/navigation";

type ProductTryOnSectionProps = {
  product: Product;
  storeSlug?: string;
};

export function ProductTryOnSection({
  product,
  storeSlug = "demo",
}: ProductTryOnSectionProps) {
  const searchParams = useSearchParams();
  if (searchParams.get("try") !== "1") return null;

  return (
    <div className="mt-20">
      <TryOnPanel product={product} storeSlug={storeSlug} />
    </div>
  );
}
