"use client";

import { ProductCard } from "@/components/product-card";
import { catalogSections } from "@/lib/data/catalog";
import { demoProducts, type ProductCategory } from "@/lib/data/products";
import { useMemo, useState } from "react";

type CatalogBrowserProps = {
  storeSlug: string;
  initialSection?: string;
};

export function CatalogBrowser({ storeSlug, initialSection }: CatalogBrowserProps) {
  const start = catalogSections.some((section) => section.id === initialSection)
    ? (initialSection as ProductCategory)
    : "all";
  const [active, setActive] = useState<ProductCategory | "all">(start);

  const visible = useMemo(
    () =>
      active === "all"
        ? demoProducts
        : demoProducts.filter((product) => product.category === active),
    [active],
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
      <p className="catalog-code">00–06 · atelier north</p>
      <h1 className="mt-3 font-display text-4xl text-noir">Catalog</h1>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        <FilterChip
          code="all"
          label="All"
          active={active === "all"}
          onClick={() => setActive("all")}
        />
        {catalogSections.map((section) => (
          <FilterChip
            key={section.id}
            code={section.code}
            label={section.label}
            active={active === section.id}
            onClick={() => setActive(section.id)}
          />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3">
        {visible.map((product) => (
          <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
        ))}
      </div>
    </div>
  );
}

function FilterChip({
  code,
  label,
  active,
  onClick,
}: {
  code: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 border px-3 py-2 text-left ${
        active ? "border-noir bg-noir text-white" : "border-hairline bg-white text-noir"
      }`}
    >
      <span className={`block text-[10px] ${active ? "text-white/60" : "catalog-code"}`}>
        {code}
      </span>
      <span className="text-sm">{label}</span>
    </button>
  );
}
