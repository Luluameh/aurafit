import { PolicyDocument } from "@/components/legal/policy-document";
import { TextTransition } from "@/components/text-transition";
import { POLICY_UPDATED, termsPolicy } from "@/lib/legal/policies";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Terms for using the AuraFit virtual fitting room.",
};

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <p className="catalog-code">AuraFit</p>
      <TextTransition
        as="h1"
        text="Terms"
        className="mt-3 font-display text-5xl text-noir"
      />
      <p className="mt-4 text-sm text-stone">Updated {POLICY_UPDATED}</p>
      <PolicyDocument blocks={termsPolicy} />
    </article>
  );
}
