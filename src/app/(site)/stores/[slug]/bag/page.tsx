import { BagPage } from "@/components/store/bag-page";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export function generateStaticParams() {
  return [{ slug: "demo" }];
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto h-64 max-w-3xl animate-pulse bg-mist" />}>
      <BagContent params={params} />
    </Suspense>
  );
}

async function BagContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== "demo") notFound();
  return <BagPage storeSlug={slug} />;
}
