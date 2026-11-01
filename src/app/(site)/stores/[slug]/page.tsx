import { Storefront } from "@/components/store/storefront";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type StorePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ section?: string }>;
};

export function generateStaticParams() {
  return [{ slug: "demo" }];
}

export default function StorePage({ params, searchParams }: StorePageProps) {
  return (
    <Suspense fallback={<div className="h-96 animate-pulse bg-mist" />}>
      <StoreContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function StoreContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ section?: string }>;
}) {
  const { slug } = await params;
  const { section } = await searchParams;
  if (slug !== "demo") notFound();

  return <Storefront storeSlug={slug} initialSection={section} />;
}
