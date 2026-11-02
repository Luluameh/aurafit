"use client";

import { TextTransition } from "@/components/text-transition";
import dynamic from "next/dynamic";
import Link from "next/link";

const ClothStudio = dynamic(
  () => import("@/components/store/cloth-studio").then((mod) => mod.ClothStudio),
  { ssr: false },
);

export function FittingRoomStage() {
  return (
    <section className="border-y border-hairline bg-white">
      <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
        <div className="relative min-h-[55vh] sm:min-h-[65vh] lg:min-h-[72vh]">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            src="/main.mp4"
          />
          <ClothStudio />
        </div>
        <div className="flex flex-col justify-center px-4 py-10 sm:px-6 sm:py-14 lg:px-12">
          <p className="text-[10px] uppercase tracking-[0.18em] text-stone sm:text-[11px] sm:tracking-[0.22em]">
            In the studio
          </p>
          <TextTransition
            as="h2"
            text="Cloth, then the fitting room"
            className="mt-3 font-display text-3xl sm:text-4xl"
          />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
            See a piece on your photo, then add a shoe or a bag from this shop to the same look.
          </p>
          <Link
            href="/stores/demo/product/column-dress?try=1"
            className="mt-8 text-[11px] uppercase tracking-[0.18em] underline underline-offset-4"
          >
            Open the fitting room
          </Link>
        </div>
      </div>
    </section>
  );
}
