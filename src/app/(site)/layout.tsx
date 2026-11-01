export default function SiteLayout({ children }: LayoutProps<"/">) {
  return <div className="flex min-h-full flex-col">{children}</div>;
}
