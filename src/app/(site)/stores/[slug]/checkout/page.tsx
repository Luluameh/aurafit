import { CheckoutPage } from "@/components/store/checkout-page";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export function generateStaticParams() {
  return [{ slug: "demo" }];
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="mx-auto h-64 max-w-6xl animate-pulse bg-mist" />}>
      <CheckoutContent params={params} />
    </Suspense>
  );
}

async function CheckoutContent({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== "demo") notFound();
  return <CheckoutPage storeSlug={slug} />;
}
