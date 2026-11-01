import type { Product } from "@/lib/data/products";
import { buildCompleteLookGuide } from "./complete-look";

/** @deprecated Use CompleteLookGuide from buildCompleteLookGuide */
export type StylistBrief = {
  headline: string;
  rationale: string;
  picks: Product[];
  nextStep: string;
};

export function buildOutfitRecommendations(anchor: Product): StylistBrief {
  const guide = buildCompleteLookGuide(anchor);
  return {
    headline: guide.headline,
    rationale: guide.intro,
    picks: guide.catalog.map((c) => c.product),
    nextStep:
      "Tap try-on on any apparel or shoe from this store, or shop add-ons if they fit your plan.",
  };
}

export { buildCompleteLookGuide, type CompleteLookGuide } from "./complete-look";
