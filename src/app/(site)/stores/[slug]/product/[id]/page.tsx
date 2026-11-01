import { ProductPageView } from "@/components/product-page-view";
import { demoProducts, getProduct } from "@/lib/data/products";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type ProductPageProps = {
  params: Promise<{ slug: string; id: string }>;
};

export function generateStaticParams() {
  return demoProducts.map((product) => ({
    slug: "demo",
    id: product.id,
  }));
}

function ProductShell() {
  return (
    <div className="mx-auto max-w-[1400px] animate-pulse px-4 py-12 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="aspect-[4/5] bg-mist" />
        <div className="space-y-4">
          <div className="h-10 w-2/3 bg-mist" />
          <div className="h-6 w-20 bg-mist" />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ params }: ProductPageProps) {
  return (
    <Suspense fallback={<ProductShell />}>
      <ProductPageInner params={params} />
    </Suspense>
  );
}

async function ProductPageInner({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  if (slug !== "demo") notFound();
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            sku: product.id,
            name: product.name,
            image: product.imageUrl,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "USD",
            },
          }),
        }}
      />
      <Suspense fallback={<ProductShell />}>
        <ProductPageView product={product} storeSlug={slug} />
      </Suspense>
    </>
  );
}
