import { productSupportsApparelTryOn, type Product } from "./products";

export type StoreView = "front" | "back" | "side";

function storeUrl(url: string | undefined): string | null {
  if (!url) return null;
  if (url.startsWith("https://") || url.startsWith("/")) return url;
  return null;
}

/** Photos the store actually supplied. Missing views stay empty. */
export function storeGarmentImages(product: Product): Record<StoreView, string | null> {
  return {
    front: product.imageUrl,
    back: storeUrl(product.backImageUrl),
    side: storeUrl(product.sideImageUrl),
  };
}

export function storeHasGarmentBack(product: Product): boolean {
  return storeGarmentImages(product).back !== null;
}

/** Front try-on uses the store front. Back try-on uses the store back when the store supplied one. */
export function tryOnGarmentImage(product: Product, face: "front" | "back" = "front"): string {
  if (face === "back") {
    const back = storeGarmentImages(product).back;
    if (back) return back;
  }
  return product.imageUrl;
}

export type StorePhoto = { url: string; label: "Front" | "Side" | "Back" };

/** Front, then side, then back. Only views the store actually supplied. */
export function storeGallery(product: Product): StorePhoto[] {
  const images = storeGarmentImages(product);
  const views: StorePhoto[] = [{ url: product.imageUrl, label: "Front" }];
  if (images.side) views.push({ url: images.side, label: "Side" });
  if (images.back) views.push({ url: images.back, label: "Back" });
  return views;
}

export function garmentViewNotice(product: Product): string | null {
  if (!productSupportsApparelTryOn(product)) return null;
  const { back, side } = storeGarmentImages(product);
  if (back && side) {
    return "The store supplied a front photo, a side photo, and a back photo. Move over the card and the views change. The arrows step through them. Your front photo is fitted with the front, and your back photo is fitted with the back.";
  }
  if (back) {
    return "The store supplied a front photo and a back photo of this piece. Move over the card and use the arrows to see the back. Your front photo is fitted with the front, and your back photo is fitted with the back.";
  }
  if (side) {
    return "The store supplied a front photo and a side photo. Move over the card and use the arrows to see the side. This piece has no back photo from the store. If you add your back photo, you can ask for an AI assumption of the back.";
  }
  return "This piece has no back photo from the store. If you add your back photo, you can ask for an AI assumption of the back. That estimate is not a store photo.";
}
