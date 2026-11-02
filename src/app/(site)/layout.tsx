import { EntryConsent } from "@/components/entry-consent";
import { Suspense } from "react";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col">
      {children}
      <Suspense fallback={null}>
        <EntryConsent />
      </Suspense>
    </div>
  );
}
