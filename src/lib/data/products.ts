export type ProductCategory =
  | "top"
  | "bottom"
  | "dress"
  | "outer"
  | "shoe"
  | "bag"
  | "jewelry";

export type PhotoGuide = "front-full" | "back-full" | "front-half";

export type Product = {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  imageUrl: string;
  /** Genuine store photo of the back. Never filled with a generated image. */
  backImageUrl?: string;
  /** Genuine store photo of the side. Never filled with a generated image. */
  sideImageUrl?: string;
  tryOnCategory: "upper_body" | "lower_body" | "full_body" | "shoes" | "auto";
  photoGuide: PhotoGuide;
  colors: string[];
  tags: string[];
};

function img(pexelsId: string): string {
  return `https://images.pexels.com/photos/${pexelsId}/pexels-photo-${pexelsId}.jpeg?auto=compress&cs=tinysrgb&w=900`;
}

/** Local copies of the mannequin photos. Pinterest blocks the image optimizer. */
function pin(file: string): string {
  return `/catalog/${file}`;
}

export const DEMO_STORE_ID = "demo-atelier";

export const demoProducts: Product[] = [
  {
    id: "linen-blazer",
    name: "Graphite Window Blazer",
    price: 148,
    category: "outer",
    imageUrl: img("19531052"),
    tryOnCategory: "upper_body",
    photoGuide: "front-half",
    colors: ["grey", "graphite", "neutral"],
    tags: ["office", "layering", "mannequin"],
  },
  {
    id: "wide-trouser",
    name: "Indigo Denim",
    price: 92,
    category: "bottom",
    imageUrl: img("23945367"),
    tryOnCategory: "lower_body",
    photoGuide: "front-full",
    colors: ["indigo", "blue"],
    tags: ["casual", "weekend", "mannequin"],
  },
  {
    id: "column-dress",
    name: "Floral Window Dress",
    price: 176,
    category: "dress",
    imageUrl: img("31349843"),
    tryOnCategory: "full_body",
    photoGuide: "front-full",
    colors: ["floral", "red"],
    tags: ["evening", "occasion", "mannequin"],
  },
  {
    id: "rib-tank",
    name: "Sand Shop Tee",
    price: 38,
    category: "top",
    imageUrl: img("7432217"),
    tryOnCategory: "upper_body",
    photoGuide: "front-half",
    colors: ["sand", "beige", "neutral"],
    tags: ["casual", "layering", "mannequin"],
  },
  {
    id: "leather-tote",
    name: "Structured Leather Tote",
    price: 210,
    category: "bag",
    imageUrl: img("1152077"),
    tryOnCategory: "auto",
    photoGuide: "front-full",
    colors: ["cognac", "neutral"],
    tags: ["work", "everyday"],
  },
  {
    id: "merino-coat",
    name: "Window Coat",
    price: 320,
    category: "outer",
    imageUrl: img("15210250"),
    tryOnCategory: "full_body",
    photoGuide: "front-full",
    colors: ["charcoal", "neutral"],
    tags: ["winter", "layering", "mannequin"],
  },
  {
    id: "cap-toe-heel",
    name: "Nude Cap-Toe Heel",
    price: 128,
    category: "shoe",
    imageUrl: img("336372"),
    tryOnCategory: "shoes",
    photoGuide: "front-full",
    colors: ["nude", "neutral"],
    tags: ["evening", "formal", "minimal"],
  },
  {
    id: "minimal-sneaker",
    name: "Off-White Court Sneaker",
    price: 98,
    category: "shoe",
    imageUrl: img("2529148"),
    tryOnCategory: "shoes",
    photoGuide: "front-full",
    colors: ["white", "neutral"],
    tags: ["casual", "weekend"],
  },
  {
    id: "crossbody-bag",
    name: "Soft Crossbody",
    price: 86,
    category: "bag",
    imageUrl: img("904350"),
    tryOnCategory: "auto",
    photoGuide: "front-full",
    colors: ["black", "neutral"],
    tags: ["evening", "casual"],
  },
  {
    id: "chain-necklace",
    name: "Fine Chain Necklace",
    price: 54,
    category: "jewelry",
    imageUrl: img("1191531"),
    tryOnCategory: "auto",
    photoGuide: "front-half",
    colors: ["gold", "neutral"],
    tags: ["evening", "minimal"],
  },
  {
    id: "rose-ankara",
    name: "Teal Floral Ankara",
    price: 186,
    category: "dress",
    imageUrl: pin("teal-floral-ankara.jpg"),
    backImageUrl: pin("teal-floral-back-ankara.jpg"),
    tryOnCategory: "full_body",
    photoGuide: "front-full",
    colors: ["teal", "floral", "print"],
    tags: ["ankara", "evening", "occasion", "mannequin"],
  },
  {
    id: "blue-ankara",
    name: "Black Ankara Gown",
    price: 164,
    category: "dress",
    imageUrl: pin("black-ankara-front.jpg"),
    backImageUrl: pin("black-ankara-back.jpg"),
    tryOnCategory: "full_body",
    photoGuide: "front-full",
    colors: ["black", "print"],
    tags: ["ankara", "occasion", "weekend", "mannequin"],
  },
  {
    id: "print-ankara",
    name: "Yellow Leaf Ankara",
    price: 172,
    category: "dress",
    imageUrl: pin("yellow-leaf-ankara.jpg"),
    backImageUrl: pin("yellow-leaf-back-ankara.jpg"),
    tryOnCategory: "full_body",
    photoGuide: "front-full",
    colors: ["yellow", "green", "print"],
    tags: ["ankara", "celebration", "evening", "mannequin"],
  },
  {
    id: "headwrap-ankara",
    name: "Red Floral Ankara",
    price: 158,
    category: "dress",
    imageUrl: pin("red-floral-ankara.jpg"),
    backImageUrl: pin("red-floral-back-ankara.jpg"),
    tryOnCategory: "full_body",
    photoGuide: "front-full",
    colors: ["red", "gold", "print"],
    tags: ["ankara", "occasion", "mannequin"],
  },
  {
    id: "mens-suit",
    name: "Purple Agbada",
    price: 340,
    category: "outer",
    imageUrl: pin("purple-agbada.jpg"),
    tryOnCategory: "full_body",
    photoGuide: "front-full",
    colors: ["purple", "native"],
    tags: ["mens", "occasion", "evening", "mannequin"],
  },
  {
    id: "mens-shirt",
    name: "White Shop Shirt",
    price: 78,
    category: "top",
    imageUrl: img("28710323"),
    tryOnCategory: "upper_body",
    photoGuide: "front-half",
    colors: ["white", "neutral"],
    tags: ["mens", "office", "casual"],
  },
  {
    id: "mens-trouser",
    name: "Grey Shop Trouser",
    price: 96,
    category: "bottom",
    imageUrl: img("28710324"),
    tryOnCategory: "lower_body",
    photoGuide: "front-full",
    colors: ["grey", "neutral"],
    tags: ["mens", "office", "casual"],
  },
  {
    id: "mens-agbada",
    name: "Brown Agbada",
    price: 280,
    category: "outer",
    imageUrl: pin("brown-agbada.jpg"),
    backImageUrl: pin("brown-agbada-back.jpg"),
    tryOnCategory: "full_body",
    photoGuide: "front-full",
    colors: ["brown", "native"],
    tags: ["mens", "occasion", "evening", "mannequin"],
  },
  {
    id: "mens-kaftan",
    name: "Ivory Agbada",
    price: 210,
    category: "outer",
    imageUrl: pin("ivory-agbada.jpg"),
    backImageUrl: pin("ivory-agbada-back.jpg"),
    tryOnCategory: "full_body",
    photoGuide: "front-full",
    colors: ["ivory", "native"],
    tags: ["mens", "occasion", "weekend", "mannequin"],
  },
  {
    id: "pearl-necklace",
    name: "Baroque Pearl Necklace",
    price: 86,
    category: "jewelry",
    imageUrl: img("34372553"),
    tryOnCategory: "auto",
    photoGuide: "front-half",
    colors: ["pearl", "gold"],
    tags: ["evening", "occasion"],
  },
  {
    id: "gold-pendant",
    name: "Gold Pearl Pendant",
    price: 72,
    category: "jewelry",
    imageUrl: img("28985983"),
    tryOnCategory: "auto",
    photoGuide: "front-half",
    colors: ["gold", "pearl"],
    tags: ["evening", "minimal"],
  },
  {
    id: "pearl-drop",
    name: "Pearl Drop Necklace",
    price: 64,
    category: "jewelry",
    imageUrl: img("27535671"),
    tryOnCategory: "auto",
    photoGuide: "front-half",
    colors: ["pearl", "gold"],
    tags: ["occasion", "minimal"],
  },
];

export function getProduct(id: string): Product | undefined {
  return demoProducts.find((p) => p.id === id);
}

export function productSupportsApparelTryOn(product: Product): boolean {
  return (
    product.category === "top" ||
    product.category === "bottom" ||
    product.category === "dress" ||
    product.category === "outer" ||
    product.category === "shoe"
  );
}

export function productFallbackImage(productId: string): string {
  return `https://picsum.photos/seed/fsh-${productId}/900/1125`;
}
