import { Suspense } from "react";

export default function WidgetLayout({ children }: LayoutProps<"/widget">) {
  return <Suspense fallback={<div className="p-6 text-sm text-ink-muted">Loading…</div>}>{children}</Suspense>;
}
