import { OrderSuccess } from "@/components/store/order-success";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export function generateStaticParams() {
  return [{ slug: "demo", orderId: "sample" }];
}

export default function Page({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  return (
    <Suspense fallback={<div className="mx-auto h-64 max-w-xl animate-pulse bg-mist" />}>
      <OrderContent params={params} />
    </Suspense>
  );
}

async function OrderContent({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  const { slug, orderId } = await params;
  if (slug !== "demo") notFound();
  return <OrderSuccess storeSlug={slug} orderId={orderId} />;
}
