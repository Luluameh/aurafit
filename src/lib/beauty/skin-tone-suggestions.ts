import type { SkinToneColorResult } from "@/lib/youcam/client";
import type { Product } from "@/lib/data/products";

export type BeautyColorSwatch = {
  label: string;
  hex: string;
  note: string;
};

export type BeautyMakeupTip = {
  area: string;
  tip: string;
};

export type SkinToneBeautyGuide = {
  undertone: "warm" | "cool" | "neutral";
  undertoneLabel: string;
  analyzed: SkinToneColorResult;
  wardrobe: BeautyColorSwatch[];
  makeup: BeautyMakeupTip[];
  disclaimer: string;
};

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length !== 6) return null;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return null;
  return { r, g, b };
}

function undertoneFromSkin(hex: string): SkinToneBeautyGuide["undertone"] {
  const rgb = hexToRgb(hex);
  if (!rgb) return "neutral";
  const { r, g, b } = rgb;
  if (r > g + 12 && r > b + 8) return "warm";
  if (b > r + 6 && g >= r - 10) return "cool";
  return "neutral";
}

function shiftHex(hex: string, delta: { r: number; g: number; b: number }): string {
  const rgb = hexToRgb(hex);
  if (!rgb) return hex;
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  const r = clamp(rgb.r + delta.r);
  const g = clamp(rgb.g + delta.g);
  const b = clamp(rgb.b + delta.b);
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

const WARM_WARDROBE: BeautyColorSwatch[] = [
  { label: "Terracotta", hex: "#B85C38", note: "Rich warmth without washing you out." },
  { label: "Olive", hex: "#6B705C", note: "Grounds bright prints beside warm skin." },
  { label: "Camel", hex: "#C4A574", note: "Soft contrast for everyday layers." },
];

const COOL_WARDROBE: BeautyColorSwatch[] = [
  { label: "Ink", hex: "#1E2A44", note: "Crisp depth for evening or tailoring." },
  { label: "Berry", hex: "#7A3052", note: "Pulls rose undertones forward." },
  { label: "Slate", hex: "#5C6670", note: "Quiet neutral for mixed palettes." },
];

const NEUTRAL_WARDROBE: BeautyColorSwatch[] = [
  { label: "Espresso", hex: "#3D2C2A", note: "Works with both gold and silver accents." },
  { label: "Moss", hex: "#4F5D4A", note: "Balanced green for print-heavy pieces." },
  { label: "Stone", hex: "#A89F94", note: "Light contrast for layered looks." },
];

export function buildSkinToneBeautyGuide(
  colors: SkinToneColorResult,
  product?: Product,
): SkinToneBeautyGuide {
  const skin = colors.skin_color ?? "#b9947c";
  const lip = colors.lip_color ?? "#c45c5c";
  const brow = colors.eyebrow_color ?? "#5b4037";
  const undertone = undertoneFromSkin(skin);
  const undertoneLabel =
    undertone === "warm"
      ? "Warm undertone"
      : undertone === "cool"
        ? "Cool undertone"
        : "Neutral undertone";

  const baseWardrobe =
    undertone === "warm" ? WARM_WARDROBE : undertone === "cool" ? COOL_WARDROBE : NEUTRAL_WARDROBE;

  const wardrobe: BeautyColorSwatch[] = [
    {
      label: "Your skin",
      hex: skin,
      note: "Measured from your photo — anchor for everything below.",
    },
    ...baseWardrobe.slice(0, 2),
    {
      label: "Soft lip echo",
      hex: shiftHex(lip, { r: 8, g: -4, b: -4 }),
      note: "A shade family that sits naturally on your mouth tone.",
    },
  ];

  if (product?.colors.length) {
    wardrobe.push({
      label: "This piece",
      hex: skin,
      note: `Pair ${product.name} with ${product.colors.slice(0, 2).join(" or ")} accents from the same undertone family.`,
    });
  }

  const makeup: BeautyMakeupTip[] = [
    {
      area: "Complexion",
      tip:
        undertone === "warm"
          ? "Peach or golden blush placed high on the cheekbone; avoid grey-toned contour."
          : undertone === "cool"
            ? "Rose or mauve blush; keep bronzer ash-free so skin stays luminous."
            : "Sand or rose blush — either reads true on neutral undertones.",
    },
    {
      area: "Lips",
      tip: `Build from your natural lip (${lip}): try a tint one step deeper for day, or a satin finish in the same hue for evening.`,
    },
    {
      area: "Eyes",
      tip: `Soft liner in ${brow} or a diffused brown shadow; ${colors.eye_color_name ?? "your eye tone"} pairs well with bronze or taupe, not harsh black alone.`,
    },
    {
      area: "Brows",
      tip: `Fill sparingly with ${brow} — match hair (${colors.hair_color_name ?? "your tone"}) rather than going lighter than your face.`,
    },
  ];

  return {
    undertone,
    undertoneLabel,
    analyzed: colors,
    wardrobe,
    makeup,
    disclaimer:
      "Color and makeup hints come from YouCam Skin Analysis on your upload. AI read — not a dermatology or shade-match guarantee.",
  };
}
