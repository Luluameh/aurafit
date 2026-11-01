import { EmbedSnippet } from "@/components/embed-snippet";
import { ButtonLink } from "@/components/ui/button-link";
import { DEMO_STORE_ID } from "@/lib/data/products";

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone sm:text-xs sm:tracking-[0.2em]">
        For store owners
      </p>
      <h1 className="mt-3 font-display text-3xl text-noir sm:text-4xl md:text-5xl">
        Paste this on your site.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-stone">
        Paste the script on a product page. It reads that page’s product photo, name, and
        price from schema.org or the share image, then opens try-on for that garment.
        Pairing uses the other products published on the same page. On this shop, a
        product page already publishes its id, so the outfit is built from Atelier.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-stone">
        Shoppers can only load the script from a public address. If the snippet says
        localhost, it works on this computer. A live store needs this app deployed, with
        NEXT_PUBLIC_APP_URL set to that address. The product photo must be a public https
        image, because YouCam fetches it.
      </p>
      <div className="mt-8">
        <EmbedSnippet storeId={DEMO_STORE_ID} />
      </div>
      <ButtonLink href="/stores/demo" className="mt-8">
        Preview the shopper experience
      </ButtonLink>
    </div>
  );
}
