import { BagPage } from "@/components/store/bag-page";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug !== "demo") notFound();
  return <BagPage storeSlug={slug} />;
}
