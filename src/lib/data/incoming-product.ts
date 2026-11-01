import type { Product, ProductCategory } from "./products";

const CATEGORIES: ProductCategory[] = [
  "top",
  "bottom",
  "dress",
  "outer",
  "shoe",
  "bag",
  "jewelry",
];

const TRY_ON = ["upper_body", "lower_body", "full_body", "shoes", "auto"] as const;

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function httpsUrl(value: unknown) {
  const url = text(value, 2000);
  return url.startsWith("https://") ? url : undefined;
}

export function productFromPage(value: unknown): Product | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const name = text(raw.name, 120);
  const imageUrl = text(raw.imageUrl, 2000);
  if (!name || !imageUrl.startsWith("https://")) return null;

  const price = Number(raw.price);
  const category = CATEGORIES.includes(raw.category as ProductCategory)
    ? (raw.category as ProductCategory)
    : "top";
  const tryOnCategory = TRY_ON.includes(raw.tryOnCategory as (typeof TRY_ON)[number])
    ? (raw.tryOnCategory as Product["tryOnCategory"])
    : category === "shoe"
      ? "shoes"
      : category === "bottom"
        ? "lower_body"
        : category === "dress" || category === "outer"
          ? "full_body"
          : category === "bag" || category === "jewelry"
            ? "auto"
            : "upper_body";

  return {
    id: text(raw.id, 80) || `page-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40)}`,
    name,
    price: Number.isFinite(price) && price >= 0 && price <= 100000 ? Math.round(price) : 0,
    category,
    imageUrl,
    backImageUrl: httpsUrl(raw.backImageUrl),
    sideImageUrl: httpsUrl(raw.sideImageUrl),
    tryOnCategory,
    photoGuide: "front-full",
    colors: Array.isArray(raw.colors)
      ? raw.colors.filter((color): color is string => typeof color === "string").slice(0, 6)
      : ["neutral"],
    tags: Array.isArray(raw.tags)
      ? raw.tags.filter((tag): tag is string => typeof tag === "string").slice(0, 8)
      : [],
  };
}

export function catalogFromPage(value: unknown): Product[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const products: Product[] = [];
  for (const entry of value.slice(0, 40)) {
    const product = productFromPage(entry);
    if (!product || seen.has(product.id)) continue;
    seen.add(product.id);
    products.push(product);
  }
  return products;
}
