import type { Product } from "@/lib/data/products";
import {
  demoProducts,
  productSupportsApparelTryOn,
} from "@/lib/data/products";

export type CatalogSuggestion = {
  role: "garment" | "layer" | "shoe" | "bag" | "jewelry";
  product: Product;
  reason: string;
  canTryOn: boolean;
};

export type SoftIdeas = {
  title: string;
  lead: string;
  ideas: string[];
};

export type OccasionIdea = {
  label: string;
  pairing: string;
  storeItems: string[];
};

export type CompleteLookGuide = {
  headline: string;
  intro: string;
  catalog: CatalogSuggestion[];
  makeup: SoftIdeas;
  footwear: SoftIdeas & { storePick?: Product };
  bag: SoftIdeas & { storePick?: Product };
  jewelry: SoftIdeas & { storePick?: Product };
  atHome: SoftIdeas;
  occasions: OccasionIdea[];
  youcamCapabilities: string[];
};

function pick(
  catalog: Product[],
  category: Product["category"],
  excludeId: string,
): Product | undefined {
  return catalog.find((p) => p.category === category && p.id !== excludeId);
}

function pickByTag(
  catalog: Product[],
  tag: string,
  excludeId: string,
): Product | undefined {
  return catalog.find((p) => p.id !== excludeId && p.tags.includes(tag));
}

function toCatalogSuggestion(
  product: Product,
  role: CatalogSuggestion["role"],
  reason: string,
): CatalogSuggestion {
  return {
    role,
    product,
    reason,
    canTryOn: productSupportsApparelTryOn(product),
  };
}

export function buildCompleteLookGuide(
  anchor: Product,
  catalog: Product[] = demoProducts,
): CompleteLookGuide {
  const isFormal =
    anchor.tags.includes("evening") || anchor.tags.includes("formal");
  const isCasual = anchor.tags.includes("casual") || anchor.tags.includes("weekend");

  const heel = pick(catalog, "shoe", anchor.id);
  const sneaker = catalog.find(
    (p) => p.category === "shoe" && p.id !== anchor.id && p.id !== heel?.id,
  );
  const bag =
    pickByTag(catalog, isFormal ? "evening" : "work", anchor.id) ??
    pick(catalog, "bag", anchor.id);
  const jewelry = pick(catalog, "jewelry", anchor.id);
  const sameWardrobe = (category: Product["category"]) =>
    anchor.tags.includes("mens")
      ? catalog.find(
          (item) =>
            item.category === category && item.tags.includes("mens") && item.id !== anchor.id,
        )
      : pick(catalog, category, anchor.id);
  const layer = sameWardrobe("outer");
  const bottom = sameWardrobe("bottom");
  const top = sameWardrobe("top");

  const catalogSuggestions: CatalogSuggestion[] = [];

  if (anchor.category === "dress") {
    if (layer) {
      catalogSuggestions.push(
        toCatalogSuggestion(
          layer,
          "layer",
          "Adds structure for cooler evenings or office — optional, not required.",
        ),
      );
    }
    if (heel) {
      catalogSuggestions.push(
        toCatalogSuggestion(
          heel,
          "shoe",
          "One idea for dinner or events — a nude heel keeps the print or the dress as the focus.",
        ),
      );
    }
    if (bag) {
      catalogSuggestions.push(
        toCatalogSuggestion(
          bag,
          "bag",
          "From this store: pairs with the dress without competing with the silhouette.",
        ),
      );
    }
    const necklaces = catalog.filter((item) => item.category === "jewelry");
    for (const [index, piece] of necklaces.slice(0, 2).entries()) {
      catalogSuggestions.push(
        toCatalogSuggestion(
          piece,
          "jewelry",
          index === 0
            ? "A single fine line at the neck is enough, especially next to a print."
            : "Another necklace if you want a different weight of chain.",
        ),
      );
    }
  } else if (anchor.category === "top" || anchor.category === "outer") {
    if (bottom) {
      catalogSuggestions.push(
        toCatalogSuggestion(
          bottom,
          "garment",
          "Balances proportion if you want a full outfit read in photos.",
        ),
      );
    }
    if (anchor.tags.includes("mens")) {
      if (sneaker) {
        catalogSuggestions.push(
          toCatalogSuggestion(
            sneaker,
            "shoe",
            "A clean sneaker from the shop, or a dress shoe you already own.",
          ),
        );
      }
    } else if (sneaker && isCasual) {
      catalogSuggestions.push(
        toCatalogSuggestion(sneaker, "shoe", "Relaxed weekend pairing — if that matches your plan."),
      );
    } else if (heel) {
      catalogSuggestions.push(
        toCatalogSuggestion(heel, "shoe", "Sharpens a minimal top or blazer for work or dinner."),
      );
    }
    if (bag) {
      catalogSuggestions.push(
        toCatalogSuggestion(bag, "bag", "Carry option from this catalog while you shop the top."),
      );
    }
  } else if (anchor.category === "bottom") {
    if (top) {
      catalogSuggestions.push(
        toCatalogSuggestion(top, "garment", "Light contrast on top — tuck or half-tuck is one easy option."),
      );
    }
    if (layer) {
      catalogSuggestions.push(
        toCatalogSuggestion(layer, "layer", "Long line over wide leg — works for transit and office."),
      );
    }
    if (heel ?? sneaker) {
      const shoe = heel ?? sneaker!;
      catalogSuggestions.push(
        toCatalogSuggestion(shoe, "shoe", "Footwear idea to finish the leg line — try-on available."),
      );
    }
  } else {
    if (heel) {
      catalogSuggestions.push(
        toCatalogSuggestion(heel, "shoe", "Neutral heel tends to work with most pieces in this catalog."),
      );
    }
  }

  const shoePick = isCasual ? (sneaker ?? heel) : (heel ?? sneaker);

  const makeupIdeas: SoftIdeas = {
    title: "Makeup mood (optional)",
    lead: "Ideas only — not a prescription. Adjust to what you already wear and like.",
    ideas: isFormal
      ? [
          "Soft rose or nude lip so the dress, print included, stays the focus.",
          "Light brow definition and mascara — skip heavy contour with a clean dress line.",
          "Warm blush at the cheekbone, not the apple, for photos after try-on.",
        ]
      : [
          "Tinted balm or your everyday lip — keep skin fresh, not matte-heavy.",
          "If you wear liner, a thin brown line often sits softer than black with earth tones.",
          "Skip new products on event day; stick to what you trust on your skin.",
        ],
  };

  const footwearIdeas: SoftIdeas & { storePick?: Product } = {
    title: "Shoes & colour",
    lead: "Colour direction plus something from the store if you want to browse.",
    ideas: [
      shoePick
        ? `From this shop: ${shoePick.name} — ${shoePick.colors.join(" / ")} tones.`
        : "Nude, white, or cognac usually sit quietly next to neutrals in this catalog.",
      "If you already own similar heels or white sneakers at home, start there before buying.",
      "Match shoe weight to the occasion — sleek for evening, lighter sole for day.",
    ],
    storePick: shoePick,
  };

  const bagIdeas: SoftIdeas & { storePick?: Product } = {
    title: "Bag",
    lead: "One carry idea — scale to how much you actually need that day.",
    ideas: [
      bag
        ? `In catalog: ${bag.name} — works as a cross-sell while you consider ${anchor.name}.`
        : "A structured tote reads work; a small crossbody reads evening.",
      "If you have a cognac or black bag at home, it likely already coordinates with these neutrals.",
    ],
    storePick: bag,
  };

  const jewelryIdeas: SoftIdeas & { storePick?: Product } = {
    title: "Jewelry & small details",
    lead: "Accent, not overload — especially after seeing yourself in the try-on preview.",
    ideas: [
      jewelry
        ? `${jewelry.name} in store — one piece is often enough with ${anchor.name}.`
        : "Fine chain or small hoops — pick one metal and repeat it.",
      "If you wear watches or rings daily, keep metals consistent with your bag hardware.",
    ],
    storePick: jewelry,
  };

  const atHome: SoftIdeas = {
    title: "Already in your closet?",
    lead: "Mix store pieces with what you own — the goal is confidence, not a full new cart.",
    ideas: [
      "Neutral blazer, white tee, or black ankle boot often substitute for catalog layers and shoes.",
      "Repeat a bag you use for work if the colour is in the same family as this piece.",
      "Try the virtual preview first, then decide if one store add-on is worth it.",
    ],
  };

  const occasions: OccasionIdea[] = [];

  if (anchor.category === "dress") {
    occasions.push(
      {
        label: "Evening",
        pairing: `${anchor.name} + ${heel?.name ?? "heeled shoe"} + ${jewelry?.name ?? "simple jewelry"}`,
        storeItems: [heel?.name, jewelry?.name, bag?.name].filter(Boolean) as string[],
      },
      {
        label: "Office",
        pairing: `${anchor.name} under ${layer?.name ?? "your own blazer"} + low heel or flat`,
        storeItems: [layer?.name, heel?.name].filter(Boolean) as string[],
      },
      {
        label: "Weekend lunch",
        pairing: `${anchor.name} + ${sneaker?.name ?? "clean sneaker"} + crossbody`,
        storeItems: [sneaker?.name, bag?.name].filter(Boolean) as string[],
      },
    );
  } else {
    occasions.push(
      {
        label: "Everyday",
        pairing: `${anchor.name} with catalog bottoms/tops and sneakers`,
        storeItems: [sneaker?.name, bag?.name].filter(Boolean) as string[],
      },
      {
        label: "Dressed up",
        pairing: `Same piece with ${heel?.name ?? "heels"} and ${jewelry?.name ?? "one jewelry piece"}`,
        storeItems: [heel?.name, jewelry?.name].filter(Boolean) as string[],
      },
    );
  }

  return {
    headline: "Ideas to complete your look",
    intro:
      "These are gentle suggestions based on this item and your store catalog — not rules. " +
      "Use your try-on photo as a reference and adapt to your taste, budget, and what you already own.",
    catalog: catalogSuggestions.slice(0, 5),
    makeup: makeupIdeas,
    footwear: footwearIdeas,
    bag: bagIdeas,
    jewelry: jewelryIdeas,
    atHome,
    occasions,
    youcamCapabilities: [
      "Apparel Virtual Try-On (cloth-v4) — preview garments and shoes on your photo",
      "Outfit suggestions — catalog cross-sell from this merchant",
      "Style notes — makeup, bag, and occasion ideas (guidance only, not medical or fit advice)",
    ],
  };
}
