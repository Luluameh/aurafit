import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t border-hairline">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-6 text-sm text-stone sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-8 lg:px-8">
          <p>FSH · catalog, photo, pairing.</p>
          <div className="flex gap-5">
            <Link href="/stores/demo" className="hover:text-noir">
              Catalog
            </Link>
            <Link href="/dashboard" className="hover:text-noir">
              Embed
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
