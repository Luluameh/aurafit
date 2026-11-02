import { PolicyDocument } from "@/components/legal/policy-document";
import { TextTransition } from "@/components/text-transition";
import { POLICY_UPDATED, privacyPolicy } from "@/lib/legal/policies";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — FSH",
  description: "How FSH handles a photo you upload for a virtual fitting.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="catalog-code">FSH</p>
      <TextTransition
        as="h1"
        text="Privacy"
        className="mt-3 font-display text-5xl text-noir"
      />
      <p className="mt-4 text-sm text-stone">Updated {POLICY_UPDATED}</p>
      <PolicyDocument blocks={privacyPolicy} />
    </article>
  );
}
