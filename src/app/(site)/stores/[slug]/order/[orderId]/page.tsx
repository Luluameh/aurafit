import { OrderSuccess } from "@/components/store/order-success";
import { notFound } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string; orderId: string }>;
}) {
  const { slug, orderId } = await params;
  if (slug !== "demo") notFound();
  return <OrderSuccess storeSlug={slug} orderId={orderId} />;
}
