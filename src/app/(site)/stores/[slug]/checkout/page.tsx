import { CheckoutPage } from "@/components/store/checkout-page";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== "demo") notFound();
  return <CheckoutPage storeSlug={slug} />;
}
