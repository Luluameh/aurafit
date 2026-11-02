import { BagLink } from "@/components/store/bag-link";
import { StoreNav } from "@/components/store/store-nav";
import Link from "next/link";
import { Suspense } from "react";

export default function StorefrontLayout({ children }: LayoutProps<"/stores">) {
  return (
    <div className="min-h-full bg-white">
      <link rel="preload" href="/main.mp4" as="video" type="video/mp4" />
      <p className="bg-noir px-3 py-2 text-center text-[9px] uppercase leading-relaxed tracking-[0.12em] text-white sm:text-[10px] sm:tracking-[0.22em]">
        Virtual fitting on every clothing piece
      </p>
      <header className="relative border-b border-hairline bg-white">
        <div className="relative mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-3 sm:gap-3 sm:px-6 sm:py-4 lg:px-10">
          <Link href="/" className="shrink-0">
            <img src="/brand/aurafit.png" alt="AuraFit" className="h-8 w-auto sm:h-10" />
          </Link>
          <Link
            href="/stores/demo"
            className="min-w-0 truncate text-center font-display text-base tracking-[0.12em] text-noir sm:text-[1.45rem] sm:tracking-[0.18em] lg:absolute lg:left-1/2 lg:-translate-x-1/2 lg:text-[1.7rem]"
          >
            ATELIER
          </Link>
          <div className="flex shrink-0 items-center gap-3 sm:gap-5">
            <BagLink storeSlug="demo" />
            <Link
              href="/stores/demo/product/column-dress?try=1"
              className="shrink-0 text-[9px] uppercase tracking-[0.08em] text-noir sm:text-[11px] sm:tracking-[0.16em]"
            >
              Fitting room
            </Link>
          </div>
        </div>
        <div className="relative border-t border-hairline lg:border-t-0">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <Suspense fallback={<div className="h-9" />}>
              <StoreNav className="py-3 lg:py-0 lg:pb-4" />
            </Suspense>
          </div>
        </div>
      </header>
      {children}
      <footer className="border-t border-hairline px-4 py-10 text-center sm:px-6 sm:py-12 lg:px-10">
        <p className="font-display text-xl sm:text-2xl">Atelier North</p>
        <p className="mx-auto mt-3 max-w-md text-sm text-stone">
          A sample clothing shop. Shipping and returns are part of the demo. The
          fitting room is powered by AuraFit.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-[10px] uppercase tracking-[0.14em] text-stone sm:flex-row sm:gap-6 sm:text-[11px] sm:tracking-[0.16em]">
          <Link href="/" className="hover:text-noir">
            About AuraFit
          </Link>
          <Link href="/dashboard" className="hover:text-noir">
            Add this to your store
          </Link>
          <Link href="/terms" className="hover:text-noir">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-noir">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
