import { FittingRoomStage } from "@/components/fitting-room-stage";
import { catalogSections } from "@/lib/data/catalog";
import { demoProducts } from "@/lib/data/products";
import Image from "next/image";
import Link from "next/link";

const paths = [
  {
    code: "01",
    title: "Browse the catalog",
    href: "/stores/demo",
    detail: "A sample store, sorted the way a wardrobe is sorted.",
  },
  {
    code: "02",
    title: "Try a piece on a photo",
    href: "/stores/demo/product/column-dress?try=1",
    detail: "Front or back photo on the left. The garment on the right.",
  },
  {
    code: "03",
    title: "Paste it into a store",
    href: "/dashboard",
    detail: "One script. Shoppers stay on the site they already trust.",
  },
];

export default function HomePage() {
  return (
    <div>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="fsh-reveal">
          <p className="catalog-code">FSH · fitting room catalog</p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl leading-[1.02] text-noir sm:text-5xl md:text-6xl">
          See the clothes on the person buying them.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone sm:mt-5 sm:text-base">
          Store owners drop FSH onto their site. Shoppers upload a photo, preview
          the piece, then see what from the same catalog can sit beside it.
        </p>
        </div>
      </div>

      <FittingRoomStage />

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
      <ol className="fsh-stagger divide-y divide-hairline border-y border-hairline">
        {paths.map((path) => (
          <li key={path.code}>
            <Link
              href={path.href}
              className="fsh-link grid grid-cols-[2.5rem_1fr] items-baseline gap-3 py-4 transition-colors hover:bg-white sm:grid-cols-[3rem_1fr_auto] sm:gap-4 sm:py-5"
            >
              <span className="catalog-code">{path.code}</span>
              <span>
                <span className="block text-base text-noir sm:text-lg">{path.title}</span>
                <span className="mt-1 block text-xs leading-relaxed text-stone sm:text-sm">
                  {path.detail}
                </span>
              </span>
              <span className="catalog-code hidden sm:block">open</span>
            </Link>
          </li>
        ))}
      </ol>

      <section className="fsh-reveal mt-12 sm:mt-16">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-2xl sm:text-3xl">Index</h2>
          <Link href="/stores/demo" className="catalog-code hover:text-noir">
            all pieces
          </Link>
        </div>
        <ul className="mt-4 divide-y divide-hairline border-y border-hairline">
          {catalogSections.map((section) => {
            const items = demoProducts.filter((product) => product.category === section.id);
            const cover = items[0];
            return (
              <li key={section.code}>
                <Link
                  href={`/stores/demo?section=${section.id}`}
                  className="grid grid-cols-[2.5rem_3.5rem_1fr] items-center gap-3 py-3 hover:bg-white sm:grid-cols-[3rem_4.5rem_1fr] sm:gap-4"
                >
                  <span className="catalog-code">{section.code}</span>
                  <span className="relative h-14 w-14 bg-mist sm:h-16 sm:w-[4.5rem]">
                    {cover && (
                      <Image
                        src={cover.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="72px"
                      />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-noir">{section.label}</span>
                    <span className="catalog-code">
                      {items.length} {items.length === 1 ? "piece" : "pieces"} · {section.note}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
      </div>
    </div>
  );
}
