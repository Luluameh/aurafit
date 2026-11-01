import type { Product } from "@/lib/data/products";
import { productSupportsApparelTryOn } from "@/lib/data/products";

export const OCCASIONS = ["day", "office", "evening", "weekend"] as const;
export type Occasion = (typeof OCCASIONS)[number];

const OCCASION_TAGS: Record<Occasion, string[]> = {
  day: ["casual", "minimal", "everyday"],
  office: ["office", "work", "layering"],
  evening: ["evening", "formal", "occasion"],
  weekend: ["weekend", "casual"],
};

export type OutfitPiece = {
  role: string;
  label: string;
  product: Product;
  reason: string;
  canTryOn: boolean;
  alternatives: Product[];
};

export type CoordinatedOutfit = {
  occasion: Occasion;
  budget: number;
  pieces: OutfitPiece[];
  total: number;
  note: string;
};

function score(product: Product, occasion: Occasion) {
  return OCCASION_TAGS[occasion].reduce(
    (total, tag) => total + (product.tags.includes(tag) ? 2 : 0),
    0,
  );
}

function colorWords(product: Product) {
  return product.colors.filter(
    (color) => color !== "neutral" && color !== "print" && color !== "multicolor",
  );
}

function colorScore(anchor: Product, item: Product) {
  const wanted = colorWords(anchor);
  const hay = `${item.name} ${item.colors.join(" ")}`.toLowerCase();
  let score = wanted.reduce((total, color) => total + (hay.includes(color) ? 4 : 0), 0);
  const printed = anchor.tags.includes("ankara") || anchor.colors.includes("print");
  if (printed && item.colors.some((color) => ["nude", "black", "gold", "white", "neutral"].includes(color))) {
    score += 2;
  }
  return score;
}

function reasonFor(
  anchor: Product,
  item: Product,
  occasion: Occasion,
  chosenByShopper: boolean,
) {
  const colors = colorWords(anchor);
  const itemColors = colorWords(item);
  const shared = itemColors.find((color) => colors.includes(color));
  const colour = shared
    ? `It repeats the ${shared} in ${anchor.name}.`
    : colors.length > 0
      ? `${anchor.name} is ${colors.join(" and ")}. ${item.name} is ${itemColors.join(" and ") || item.colors[0] || "a shop piece"}, so it sits beside that rather than copying it.`
      : `${item.name} is what this shop has to wear with ${anchor.name}.`;
  const lead = chosenByShopper
    ? `You selected ${item.name} to wear with ${anchor.name}.`
    : `${item.name} is the match from this shop for ${anchor.name}.`;
  return `${lead} ${colour} It is $${item.price}, counted toward the ${occasion} outfit.`;
}

function candidates(
  catalog: Product[],
  anchor: Product,
  category: Product["category"],
  used: Set<string>,
) {
  const pool = catalog.filter((item) => item.category === category && !used.has(item.id));
  const menswear = anchor.tags.includes("mens");
  const wardrobe =
    category === "top" || category === "bottom" || category === "outer" || category === "dress";
  if (!wardrobe) return pool;
  const sided = pool.filter((item) => item.tags.includes("mens") === menswear);
  return sided.length > 0 ? sided : pool;
}

export function buildCoordinatedOutfit(input: {
  anchor: Product;
  occasion: Occasion;
  budget: number;
  catalog: Product[];
  swaps?: Record<string, string>;
}): CoordinatedOutfit {
  const budget = Number.isFinite(input.budget) ? Math.max(0, Math.round(input.budget)) : 0;
  const used = new Set<string>([input.anchor.id]);
  const skipped: string[] = [];
  const roles: { role: string; label: string; category: Product["category"] }[] = [];

  if (input.anchor.category === "dress") {
    roles.push(
      { role: "shoe", label: "Shoe", category: "shoe" },
      { role: "bag", label: "Bag", category: "bag" },
      { role: "jewelry", label: "Necklace", category: "jewelry" },
    );
  } else if (input.anchor.category === "top" || input.anchor.category === "outer") {
    roles.push(
      { role: "bottom", label: "Bottom", category: "bottom" },
      { role: "shoe", label: "Shoe", category: "shoe" },
      { role: "bag", label: "Bag", category: "bag" },
    );
  } else if (input.anchor.category === "bottom") {
    roles.push(
      { role: "top", label: "Top", category: "top" },
      { role: "shoe", label: "Shoe", category: "shoe" },
      { role: "bag", label: "Bag", category: "bag" },
    );
  } else {
    roles.push(
      { role: "shoe", label: "Shoe", category: "shoe" },
      { role: "bag", label: "Bag", category: "bag" },
    );
  }

  let remaining = budget - input.anchor.price;
  const pieces: OutfitPiece[] = [
    {
      role: "anchor",
      label: "Selected",
      product: input.anchor,
      reason: `This is ${input.anchor.name}, the piece on your photo. The shoe, bag, and necklace below are chosen from this shop for it.`,
      canTryOn: false,
      alternatives: [],
    },
  ];

  for (const slot of roles) {
    const pool = candidates(input.catalog, input.anchor, slot.category, used);
    const ranked = [...pool].sort((a, b) => {
      const byLook =
        colorScore(input.anchor, b) +
        score(b, input.occasion) -
        (colorScore(input.anchor, a) + score(a, input.occasion));
      return byLook !== 0 ? byLook : a.price - b.price;
    });
    const forced = input.swaps?.[slot.role]
      ? pool.find((item) => item.id === input.swaps?.[slot.role])
      : undefined;
    const affordable = ranked.filter((item) => item.price <= Math.max(0, remaining));
    const chosen = forced ?? affordable[0];
    if (!chosen) {
      if (ranked[0]) skipped.push(ranked[0].name);
      continue;
    }
    used.add(chosen.id);
    remaining -= chosen.price;
    pieces.push({
      role: slot.role,
      label: slot.label,
      product: chosen,
      reason: reasonFor(input.anchor, chosen, input.occasion, Boolean(forced)),
      canTryOn: productSupportsApparelTryOn(chosen),
      alternatives: ranked.filter((item) => item.id !== chosen.id).slice(0, 3),
    });
  }

  const total = pieces.reduce((sum, piece) => sum + piece.product.price, 0);
  let note = `The outfit is inside the $${budget} budget.`;
  if (input.catalog.length < 2) {
    note = "This page only published one product, so there is no other piece from the same shop to add.";
  } else if (skipped.length > 0) {
    note = `Left out to stay inside $${budget}: ${skipped.join(", ")}.`;
  } else if (total > budget) {
    note = `This selection is $${total - budget} over the budget because a swapped piece costs more.`;
  }

  return { occasion: input.occasion, budget, pieces, total, note };
}
