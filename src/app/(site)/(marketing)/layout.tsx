import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-stone sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8 lg:px-8">
          <p className="flex min-w-0 items-center gap-2">
            <img src="/brand/aurafit.png" alt="AuraFit" className="h-8 w-auto shrink-0" />
            <span className="truncate">· catalog, photo, pairing.</span>
          </p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/stores/demo" className="fsh-link hover:text-noir">
              Catalog
            </Link>
            <Link href="/dashboard" className="fsh-link hover:text-noir">
              Embed
            </Link>
            <Link href="/terms" className="fsh-link hover:text-noir">
              Terms
            </Link>
            <Link href="/privacy" className="fsh-link hover:text-noir">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
