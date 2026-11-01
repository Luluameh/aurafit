import type { ProductCategory } from "./products";

export type CatalogSection = {
  code: string;
  id: ProductCategory;
  label: string;
  note: string;
};

/** Same idea as a prompt-library index: numbered sections you can scan. */
export const catalogSections: CatalogSection[] = [
  { code: "00", id: "dress", label: "Dress", note: "Full look · back or front photo" },
  { code: "01", id: "outer", label: "Outer", note: "Layer over a base" },
  { code: "02", id: "top", label: "Top", note: "Waist-up or full front" },
  { code: "03", id: "bottom", label: "Bottom", note: "Full-body photo" },
  { code: "04", id: "shoe", label: "Shoe", note: "Finish the line" },
  { code: "05", id: "bag", label: "Bag", note: "Pair, don’t try on" },
  { code: "06", id: "jewelry", label: "Necklace", note: "One chain at the neck" },
];

export function sectionFor(category: ProductCategory): CatalogSection {
  return (
    catalogSections.find((section) => section.id === category) ?? catalogSections[0]
  );
}
