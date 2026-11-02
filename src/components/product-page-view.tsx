"use client";

import { StoreGarmentPhoto } from "@/components/store-garment-photo";
import { TextTransition } from "@/components/text-transition";
import { TryOnPanel } from "@/components/try-on-panel";
import { sectionFor } from "@/lib/data/catalog";
import { storeHasGarmentBack } from "@/lib/data/garment-views";
import { photoPrompt } from "@/lib/data/photo-guide";
import type { Product } from "@/lib/data/products";
import { productSupportsApparelTryOn } from "@/lib/data/products";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ProductPageViewProps = {
  product: Product;
  storeSlug: string;
};

export function ProductPageView({ product, storeSlug }: ProductPageViewProps) {
  const searchParams = useSearchParams();
  const tryMode = searchParams.get("try") === "1";
  const canTry = productSupportsApparelTryOn(product);
  if (tryMode && canTry) {
    return (
      <div className="fsh-reveal mx-auto max-w-[1280px] px-3 py-5 sm:px-4 sm:py-6 lg:px-8">
        <Link
          href={`/stores/${storeSlug}`}
          className="fsh-link text-xs text-stone hover:text-noir"
        >
          ← Shop
        </Link>
        <div className="mt-5">
          <TryOnPanel product={product} storeSlug={storeSlug} guide={storeSlug === "demo"} />
        </div>
      </div>
    );
  }

  return (
    <div className="fsh-reveal mx-auto max-w-[1280px] px-3 py-6 sm:px-4 sm:py-8 lg:px-8">
      <Link href={`/stores/${storeSlug}`} className="fsh-link text-xs text-stone hover:text-noir">
        ← Shop
      </Link>
      <div className="mt-6 grid items-start gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#f3f1ec]">
          <StoreGarmentPhoto
            product={product}
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        </div>
        <div className="lg:sticky lg:top-20 lg:pt-2 xl:top-24 xl:pt-6">
          <p className="catalog-code">
            {sectionFor(product.category).code} · {sectionFor(product.category).label}
          </p>
          <TextTransition
            as="h1"
            text={product.name}
            className="mt-2 font-display text-3xl text-noir sm:text-4xl md:text-5xl"
          />
          <p className="mt-3 text-xl tabular-nums">${product.price}</p>
          <dl className="mt-8 divide-y divide-hairline border-y border-hairline text-sm">
            <Spec label="Colour" value={product.colors.join(" · ")} />
            <Spec label="Scene" value={product.tags.slice(0, 2).join(" · ")} />
          </dl>
          {canTry ? (
            <>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-noir">
                {photoPrompt(product.photoGuide)}
                {storeHasGarmentBack(product)
                  ? " This piece also has a back, if you want to see that too."
                  : ""}
              </p>
              <Link
                href={`/stores/${storeSlug}/product/${product.id}?try=1`}
                className="fsh-btn mt-6 flex w-full items-center justify-center bg-noir py-4 text-xs font-semibold uppercase tracking-[0.18em] text-white hover:bg-charcoal sm:w-72"
              >
                See it on you
              </Link>
            </>
          ) : (
            <p className="mt-8 text-sm text-stone">
              Suggested when you try on a dress, coat, or shoe from this shop.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5rem_1fr] gap-2 py-3 sm:grid-cols-[6rem_1fr] sm:gap-3">
      <dt className="catalog-code">{label}</dt>
      <dd className="capitalize text-noir">{value}</dd>
    </div>
  );
}
