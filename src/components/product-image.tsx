"use client";

import { productFallbackImage } from "@/lib/data/products";
import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  productId: string;
  src: string;
  alt: string;
};

export function ProductImage({
  productId,
  src,
  alt,
  className,
  fill,
  ...props
}: ProductImageProps) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);
  const host = (() => {
    try {
      return new URL(current).hostname;
    } catch {
      return "";
    }
  })();
  const optimized =
    host === "images.pexels.com" ||
    host === "images.unsplash.com" ||
    host === "picsum.photos";

  if (!optimized) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={current}
        alt={alt}
        className={`${fill ? "absolute inset-0 h-full w-full" : ""} ${className ?? ""}`}
        onError={() => setCurrent(productFallbackImage(productId))}
      />
    );
  }

  return (
    <Image
      {...props}
      fill={fill}
      className={className}
      src={current}
      alt={alt}
      onError={() => setCurrent(productFallbackImage(productId))}
    />
  );
}
