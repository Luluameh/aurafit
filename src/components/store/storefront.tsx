"use client";

import { ProductCard } from "@/components/product-card";
import { TextTransition } from "@/components/text-transition";
import { catalogSections } from "@/lib/data/catalog";
import { demoProducts, type ProductCategory } from "@/lib/data/products";
import { useEffect, useMemo, useState } from "react";

const HERO_VIDEO = "/main.mp4";

type ShopView = ProductCategory | "all" | "mens";

type StorefrontProps = {
  storeSlug: string;
  initialSection?: string;
};

function viewFrom(section?: string): ShopView {
  if (section === "mens") return "mens";
  if (catalogSections.some((item) => item.id === section)) return section as ProductCategory;
  return "all";
}

export function Storefront({ storeSlug, initialSection }: StorefrontProps) {
  const start = viewFrom(initialSection);
  const [active, setActive] = useState<ShopView>(start);

  useEffect(() => {
    setActive(start);
  }, [start]);

  const visible = useMemo(() => {
    const list =
      active === "mens"
        ? demoProducts.filter((product) => product.tags.includes("mens"))
        : active === "all"
          ? demoProducts
          : demoProducts.filter((product) => product.category === active);
    const rank = (product: (typeof demoProducts)[number]) => {
      if (product.tags.includes("ankara")) return 0;
      if (product.tags.includes("mens")) return 1;
      if (product.category === "jewelry") return 2;
      return 3;
    };
    return [...list].sort((a, b) => rank(a) - rank(b));
  }, [active]);

  const dress = demoProducts.find((product) => product.id === "column-dress")!;
  const ankara = demoProducts.find((product) => product.id === "rose-ankara")!;
  const tiles = [
    ankara,
    demoProducts.find((product) => product.id === "mens-agbada")!,
    demoProducts.find((product) => product.id === "linen-blazer")!,
    demoProducts.find((product) => product.id === "cap-toe-heel")!,
    demoProducts.find((product) => product.id === "crossbody-bag")!,
    demoProducts.find((product) => product.id === "pearl-necklace")!,
  ];

  return (
    <div className="bg-white text-noir">
      <section className="grid grid-cols-1 bg-noir lg:h-[min(82vh,900px)] lg:min-h-[560px] lg:grid-cols-3">
        <HeroStill
          src={dress.imageUrl}
          alt={dress.name}
          className="order-2 lg:order-none lg:col-start-1 lg:row-start-1"
        />
        <div className="relative isolate order-1 h-[52vh] min-h-[300px] overflow-hidden bg-noir sm:h-[58vh] sm:min-h-[360px] lg:order-none lg:col-start-2 lg:row-start-1 lg:h-full lg:min-h-0">
          <video
            className="h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            src={HERO_VIDEO}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-noir/60 via-noir/10 to-noir/15" />
          <div className="absolute inset-x-0 bottom-0 px-4 pb-8 text-white sm:px-6 sm:pb-10">
            <p className="fsh-reveal text-[10px] uppercase tracking-[0.22em] text-white/80 sm:text-[11px] sm:tracking-[0.28em]">
              New arrivals
            </p>
            <TextTransition
              as="h1"
              text="The quiet collection"
              delay={0.15}
              className="mt-2 font-display text-3xl leading-none text-white sm:mt-3 sm:text-5xl"
            />
            <button
              type="button"
              onClick={() => document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" })}
              className="mt-6 border border-white px-5 py-2.5 text-[10px] uppercase tracking-[0.16em] sm:mt-8 sm:px-6 sm:py-3 sm:text-[11px] sm:tracking-[0.18em]"
            >
              Shop new
            </button>
          </div>
        </div>
        <HeroStill
          src={ankara.imageUrl}
          alt={ankara.name}
          className="order-3 lg:order-none lg:col-start-3 lg:row-start-1"
        />
      </section>

      <section id="shop" className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <TextTransition
            as="h2"
            text="New arrivals"
            className="font-display text-3xl sm:text-4xl"
          />
          <button
            type="button"
            onClick={() => setActive("all")}
            className="text-[11px] uppercase tracking-[0.16em] text-stone hover:text-noir"
          >
            View all
          </button>
        </div>
        <div className="mb-6 flex gap-4 overflow-x-auto pb-1 sm:mb-8 sm:gap-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Filter label="All" active={active === "all"} onClick={() => setActive("all")} />
          <Filter label="Menswear" active={active === "mens"} onClick={() => setActive("mens")} />
          {catalogSections.map((section) => (
            <Filter
              key={section.id}
              label={section.label}
              active={active === section.id}
              onClick={() => setActive(section.id)}
            />
          ))}
        </div>
        <div key={active} className="fsh-grid-swap grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-4 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} storeSlug={storeSlug} />
          ))}
        </div>
      </section>

      <section className="border-t border-hairline px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
        <h2 className="mb-6 text-center font-display text-3xl sm:mb-8 sm:text-4xl">Explore</h2>
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-6">
          {tiles.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => {
                setActive(product.tags.includes("mens") ? "mens" : product.category);
                document.getElementById("shop")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="fsh-btn group relative aspect-[3/4] overflow-hidden bg-mist"
            >
              <img
                src={product.imageUrl}
                alt=""
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-noir/20 transition group-hover:bg-noir/35" />
              <span className="absolute inset-x-0 bottom-4 px-2 text-center font-display text-xl text-white sm:bottom-6 sm:text-2xl md:text-3xl">
                {product.tags.includes("mens")
                  ? "Menswear"
                  : product.tags.includes("ankara")
                    ? "Ankara"
                    : product.category === "jewelry"
                      ? "Necklace"
                      : catalogSections.find((section) => section.id === product.category)?.label}
              </span>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}

function HeroStill({
  src,
  alt,
  className = "",
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={`relative h-[45vh] min-h-[240px] overflow-hidden sm:h-[50vh] sm:min-h-[280px] lg:h-full lg:min-h-0 ${className}`}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

function Filter({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`fsh-link shrink-0 border-b pb-1 text-[11px] uppercase tracking-[0.16em] transition-colors duration-300 ${
        active ? "border-noir text-noir" : "border-transparent text-stone hover:text-noir"
      }`}
    >
      {label}
    </button>
  );
}
