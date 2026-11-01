import Link from "next/link";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "ghost";

const styles: Record<Variant, string> = {
  primary:
    "bg-noir text-white hover:bg-charcoal border border-noir",
  secondary:
    "bg-transparent text-noir border border-noir hover:bg-noir hover:text-white",
  ghost:
    "bg-transparent text-noir border border-hairline hover:border-noir",
};

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
};

export function ButtonLink({
  variant = "primary",
  className = "",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={`inline-flex items-center justify-center px-7 py-3.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-200 ${styles[variant]} ${className}`}
    />
  );
}
