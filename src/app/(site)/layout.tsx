import { EntryConsent } from "@/components/entry-consent";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-full flex-col">
      {children}
      <EntryConsent />
    </div>
  );
}
