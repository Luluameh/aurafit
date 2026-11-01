import type { Product } from "@/lib/data/products";
import {
  demoProducts,
  productSupportsApparelTryOn,
} from "@/lib/data/products";

export const SIZES = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof SIZES)[number];

export type StylistPick = {
  product: Product;
  reason: string;
  canTryOn: boolean;
};

export type StylistAnswer = {
  reply: string;
  picks: StylistPick[];
  makeupTitle: string;
  makeup: string[];
  atHome: string;
  occasion: string | null;
};

const COLOR_WORDS = [
  "red",
  "black",
  "white",
  "nude",
  "gold",
  "ivory",
  "sand",
  "olive",
  "brown",
  "cognac",
];

export function sizeGuidance(size: Size, piece: string): string {
  return `This preview shows ${piece} on your photo. It does not resize the garment. If you usually take a ${size}, start there — a closer cut can look smaller in the picture than it feels on.`;
}

function wants(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

function mentionedColor(text: string): string | null {
  return COLOR_WORDS.find((color) => text.includes(color)) ?? null;
}

function matchesColor(product: Product, color: string): boolean {
  const hay = `${product.name} ${product.colors.join(" ")}`.toLowerCase();
  return hay.includes(color);
}

function pickOf(product: Product, reason: string): StylistPick {
  return {
    product,
    reason,
    canTryOn: productSupportsApparelTryOn(product),
  };
}

export function answerStylist(input: {
  message: string;
  anchor: Product;
  size: Size;
  catalog?: Product[];
}): StylistAnswer {
  const text = input.message.toLowerCase();
  const catalog = (input.catalog ?? demoProducts).filter(
    (item) => item.id !== input.anchor.id,
  );
  const color = mentionedColor(text);
  const shoes = catalog.filter((item) => item.category === "shoe");
  const bags = catalog.filter((item) => item.category === "bag");
  const jewelry = catalog.filter((item) => item.category === "jewelry");

  const askShoe = wants(text, ["shoe", "shoes", "heel", "sneaker", "footwear"]);
  const askBag = wants(text, ["bag", "tote", "purse", "clutch"]);
  const askJewel = wants(text, ["jewel", "necklace", "earring", "gold"]);
  const askMakeup = wants(text, ["makeup", "make up", "lipstick", "face"]);
  const alreadyMakeup = wants(text, [
    "already",
    "on my face",
    "i have makeup",
    "wearing makeup",
  ]);
  const heavy = wants(text, ["heavy", "glam", "evening makeup", "full face"]);
  const light = wants(text, ["light", "natural", "no makeup", "minimal makeup"]);

  let occasion: string | null = null;
  if (wants(text, ["office", "work"])) occasion = "Office";
  else if (wants(text, ["dinner", "date", "evening", "party", "wedding"]))
    occasion = "Evening";
  else if (wants(text, ["weekend", "day", "casual", "lunch"])) occasion = "Day";

  const picks: StylistPick[] = [];
  const lines: string[] = [];

  if (askShoe || (!askBag && !askJewel && !askMakeup && color)) {
    const colored = color ? shoes.filter((item) => matchesColor(item, color)) : shoes;
    if (color && colored.length === 0) {
      lines.push(
        `This store doesn't have a ${color} shoe. If you already own ${color} shoes, wear those with ${input.anchor.name}.`,
      );
      if (shoes[0]) {
        picks.push(
          pickOf(
            shoes[0],
            `Closest in the shop if you want to buy a pair here.`,
          ),
        );
      }
    } else {
      for (const shoe of (colored.length ? colored : shoes).slice(0, 2)) {
        picks.push(
          pickOf(
            shoe,
            color
              ? `A ${color}-leaning option from this store.`
              : `One shoe that can sit with ${input.anchor.name}.`,
          ),
        );
      }
      lines.push(
        shoes.length
          ? `You could add a shoe from this shop, or use a pair you already own in a similar colour.`
          : `If you already own shoes in this colour family, start there.`,
      );
    }
  }

  if (askBag) {
    const bag = bags[0];
    if (bag && !picks.some((pick) => pick.product.id === bag.id)) {
      picks.push(pickOf(bag, `A bag from this store to carry with ${input.anchor.name}.`));
    }
    if (askBag) {
      lines.push(
        bags[0]
          ? `A bag is optional. ${bags[0].name} is here if you want one — a bag you already use can do the same job.`
          : `If you already have a bag at home in a neutral colour, it will likely be enough.`,
      );
    }
  }

  if (askJewel) {
    for (const piece of jewelry.slice(0, 2)) {
      picks.push(pickOf(piece, `${piece.name} — one necklace is enough.`));
    }
    lines.push("A necklace is a suggestion, not a requirement. One metal, one piece.");
  }

  if (picks.length === 0 && (askShoe || askBag)) {
    lines.push("Nothing else in this catalog matched that request.");
  }

  let makeupTitle = "Makeup";
  let makeup: string[];
  if (alreadyMakeup) {
    makeupTitle = "Makeup you already have";
    makeup = [
      `Your photo already shows your face. Keep that makeup and judge ${input.anchor.name} against it.`,
      "If it feels like too much next to the dress, soften the lip rather than adding more.",
    ];
    lines.push("We'll use the makeup already on your photo — no new face is generated.");
  } else if (heavy || occasion === "Evening") {
    makeupTitle = "Heavier makeup";
    makeup = [
      "Defined eye and a deeper lip, if that is a look you already like.",
      "Skip a new product on the day. Build on a base you have worn before.",
    ];
  } else if (light || occasion === "Day" || occasion === "Office") {
    makeupTitle = "Light makeup";
    makeup = [
      "Tinted lip, light brow, and skin that still looks like you.",
      "This sits more quietly next to the clothes than a full glam face.",
    ];
  } else if (askMakeup) {
    makeupTitle = "Makeup, if you want it";
    makeup = [
      "Light for day and office. Heavier only if the occasion is evening.",
      "Either way, it is a suggestion. Your usual face is a valid choice.",
    ];
  } else {
    makeupTitle = "Makeup";
    makeup = [
      "Light if this is daytime. A slightly deeper lip if it is evening.",
    ];
  }

  if (occasion) {
    lines.push(
      `For ${occasion.toLowerCase()}, ${input.anchor.name} plus ${picks[0] ? picks[0].product.name : "a neutral shoe you own"} is one way to put it together.`,
    );
  }

  if (lines.length === 0) {
    lines.push(
      `Tell me what to add — a shoe, a red shoe, a bag — or say if you already have makeup on.`,
    );
  }

  return {
    reply: lines.join(" "),
    picks: picks.slice(0, 4),
    makeupTitle,
    makeup,
    atHome: `If you already own a similar shoe or bag in a ${input.size}, use that before buying another.`,
    occasion,
  };
}
