import { catalogFromPage, productFromPage } from "@/lib/data/incoming-product";
import { demoProducts, getProduct, type Product } from "@/lib/data/products";
import { answerStylist, SIZES, type Size } from "@/lib/stylist/ask";
import { buildCompleteLookGuide } from "@/lib/stylist/complete-look";
import { buildCoordinatedOutfit, OCCASIONS, type Occasion } from "@/lib/stylist/outfit";
import { NextResponse } from "next/server";

function resolveProduct(body: { productId?: string; product?: unknown }): Product | undefined {
  if (body.productId) {
    const known = getProduct(body.productId);
    if (known) return known;
  }
  return productFromPage(body.product) ?? undefined;
}

function resolveCatalog(product: Product, catalog: unknown): Product[] {
  const incoming = catalogFromPage(catalog);
  if (getProduct(product.id)) return demoProducts;
  const withAnchor = incoming.some((item) => item.id === product.id)
    ? incoming
    : [product, ...incoming];
  return withAnchor;
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    productId?: string;
    product?: unknown;
    catalog?: unknown;
    prompt?: string;
    size?: string;
    occasion?: string;
    budget?: number;
    swaps?: Record<string, string>;
  };

  const product = resolveProduct(body);
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const catalog = resolveCatalog(product, body.catalog);

  if (body.prompt?.trim()) {
    const size = SIZES.includes(body.size as Size) ? (body.size as Size) : "M";
    return NextResponse.json(
      answerStylist({ message: body.prompt, anchor: product, size, catalog }),
    );
  }

  const guide = buildCompleteLookGuide(product, catalog);
  const occasion = OCCASIONS.includes(body.occasion as Occasion)
    ? (body.occasion as Occasion)
    : null;

  if (occasion && typeof body.budget === "number") {
    return NextResponse.json({
      ...guide,
      outfit: buildCoordinatedOutfit({
        anchor: product,
        occasion,
        budget: body.budget,
        catalog,
        swaps: body.swaps,
      }),
    });
  }

  return NextResponse.json(guide);
}
