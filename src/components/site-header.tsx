import Link from "next/link";

const links = [
  { href: "/", label: "Index" },
  { href: "/stores/demo", label: "Catalog" },
  { href: "/dashboard", label: "Embed" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-hairline bg-canvas">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        <Link href="/" className="fsh-link shrink-0">
          <img src="/brand/aurafit.png" alt="AuraFit" className="h-10 w-auto sm:h-12" />
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="fsh-link catalog-code text-[10px] hover:text-noir sm:text-[11px]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
