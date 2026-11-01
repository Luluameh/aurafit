"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const links = [
  { href: "/stores/demo", label: "New", match: "all" },
  { href: "/stores/demo?section=dress", label: "Dresses", match: "dress" },
  { href: "/stores/demo?section=outer", label: "Outer", match: "outer" },
  { href: "/stores/demo?section=shoe", label: "Shoes", match: "shoe" },
  { href: "/stores/demo?section=bag", label: "Bags", match: "bag" },
  { href: "/stores/demo?section=mens", label: "Mens", match: "mens" },
  { href: "/stores/demo?section=jewelry", label: "Necklaces", match: "jewelry" },
] as const;

function activeMatch(section: string | null) {
  if (!section) return "all";
  return section;
}

export function StoreNav({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const section = searchParams.get("section");
  const current = pathname.includes("/stores/demo") ? activeMatch(section) : "";

  return (
    <nav
      className={`flex gap-4 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {links.map((link) => {
        const active = current === link.match;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`shrink-0 border-b pb-2 text-[10px] uppercase tracking-[0.14em] sm:text-[11px] sm:tracking-[0.16em] ${
              active ? "border-noir text-noir" : "border-transparent text-stone hover:text-noir"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
