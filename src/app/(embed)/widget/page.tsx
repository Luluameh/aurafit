"use client";

import { TryOnPanel } from "@/components/try-on-panel";
import { productFromPage, catalogFromPage } from "@/lib/data/incoming-product";
import { demoProducts, getProduct, type Product } from "@/lib/data/products";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type PageMessage = {
  type?: string;
  product?: unknown;
  catalog?: unknown;
};

export default function WidgetPage() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product");
  const known = productId ? getProduct(productId) : undefined;
  const [pageProduct, setPageProduct] = useState<Product | null>(known ?? null);
  const [pageCatalog, setPageCatalog] = useState<Product[] | undefined>(
    known ? demoProducts : undefined,
  );
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (known) return;
    function onMessage(event: MessageEvent<PageMessage>) {
      if (event.data?.type !== "fsh-product") return;
      const product = productFromPage(event.data.product);
      const catalog = catalogFromPage(event.data.catalog);
      if (product && getProduct(product.id)) {
        setPageProduct(getProduct(product.id) ?? product);
        setPageCatalog(demoProducts);
        setMissing(false);
        return;
      }
      if (product) {
        setPageProduct(product);
        setPageCatalog(catalog.length > 0 ? catalog : [product]);
        setMissing(false);
        return;
      }
      if (window.parent !== window) setMissing(true);
    }
    window.addEventListener("message", onMessage);
    window.parent.postMessage({ type: "fsh-ready" }, "*");
    const timer = window.setTimeout(() => {
      if (window.parent === window) {
        setPageProduct((current) => current ?? demoProducts[0]);
        setPageCatalog(demoProducts);
      }
    }, 700);
    return () => {
      window.removeEventListener("message", onMessage);
      window.clearTimeout(timer);
    };
  }, [known]);

  if (missing) {
    return (
      <div className="min-h-screen bg-canvas p-6">
        <h1 className="font-display text-3xl text-noir">No product photo on this page</h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-stone">
          The fitting room reads a public product image from this page. Add a schema.org
          Product image, an Open Graph image, or data-image on the FSH script.
        </p>
      </div>
    );
  }

  if (!pageProduct) {
    return <div className="min-h-screen bg-canvas p-6 text-sm text-stone">Opening the fitting room…</div>;
  }

  return (
    <div className="min-h-screen bg-canvas p-3 sm:p-4 md:p-6">
      <header className="mb-4 border-b border-hairline pb-3 sm:mb-6 sm:pb-4">
        <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-stone sm:text-[10px] sm:tracking-[0.2em]">
          FSH · fitting room
        </p>
        <h1 className="mt-1 font-display text-xl text-noir sm:text-2xl">{pageProduct.name}</h1>
      </header>
      <TryOnPanel product={pageProduct} catalog={pageCatalog} />
    </div>
  );
}
