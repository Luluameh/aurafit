"use client";

import { PolicyDocument } from "@/components/legal/policy-document";
import { TextTransition } from "@/components/text-transition";
import {
  POLICY_UPDATED,
  privacyPolicy,
  termsPolicy,
  type PolicyBlock,
} from "@/lib/legal/policies";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CONSENT_KEY = "fsh-entry-consent-v1";

type View = "welcome" | "terms" | "privacy";

const pages: Record<Exclude<View, "welcome">, { title: string; blocks: PolicyBlock[] }> = {
  terms: { title: "Terms", blocks: termsPolicy },
  privacy: { title: "Privacy", blocks: privacyPolicy },
};

export function EntryConsent() {
  const pathname = usePathname();
  const [accepted, setAccepted] = useState(true);
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<View>("welcome");
  const readingPolicy = pathname === "/terms" || pathname === "/privacy";

  useEffect(() => {
    const stored = window.localStorage.getItem(CONSENT_KEY) === "1";
    setAccepted(stored);
    if (stored) return;

    const reveal = window.setInterval(() => {
      if (!document.documentElement.classList.contains("fsh-intro-active")) {
        setVisible(true);
        window.clearInterval(reveal);
      }
    }, 150);

    return () => window.clearInterval(reveal);
  }, []);

  function agree() {
    window.localStorage.setItem(CONSENT_KEY, "1");
    setAccepted(true);
    setVisible(false);
  }

  if (accepted || !visible) return null;

  if (readingPolicy) {
    return (
      <div className="fsh-modal-panel fixed inset-x-0 bottom-0 z-[110] border-t border-hairline bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-noir">Agree to enter the rest of the site.</p>
          <button
            type="button"
            onClick={agree}
            className="fsh-btn bg-noir px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            I agree
          </button>
        </div>
      </div>
    );
  }

  const page = view === "welcome" ? null : pages[view];

  return (
    <div className="fsh-modal-overlay fixed inset-0 z-[110] flex items-end justify-center bg-noir/50 p-3 sm:items-center sm:p-6">
      <div
        className="fsh-modal-panel flex max-h-[min(88vh,760px)] w-full max-w-xl flex-col bg-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-consent-title"
      >
        <div className="overflow-y-auto px-5 py-6 sm:px-8 sm:py-8">
          {page ? (
            <>
              <button
                type="button"
                onClick={() => setView("welcome")}
                className="fsh-link catalog-code hover:text-noir"
              >
                ← Back
              </button>
              <h2 id="entry-consent-title" className="mt-4 font-display text-4xl text-noir">
                {page.title}
              </h2>
              <p className="mt-3 text-xs text-stone">{POLICY_UPDATED}</p>
              <PolicyDocument blocks={page.blocks} />
            </>
          ) : (
            <>
              <p className="catalog-code">FSH</p>
              <TextTransition
                as="h2"
                text="Before you enter"
                className="mt-3 font-display text-4xl leading-none text-noir"
              />
              <p id="entry-consent-title" className="sr-only">
                Before you enter
              </p>
              <p className="mt-4 text-sm leading-relaxed text-noir">
                The shop will not use your photo for any commercial purposes. Please read the
                terms and the privacy notice, then agree to continue.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={() => setView("terms")}
                  className="fsh-link text-sm text-noir underline underline-offset-4"
                >
                  Terms
                </button>
                <button
                  type="button"
                  onClick={() => setView("privacy")}
                  className="fsh-link text-sm text-noir underline underline-offset-4"
                >
                  Privacy
                </button>
                <Link href="/terms" className="fsh-link catalog-code hover:text-noir">
                  Open terms page
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline px-5 py-4 sm:px-8">
          <p className="text-xs text-stone">Updated {POLICY_UPDATED}</p>
          <button
            type="button"
            onClick={agree}
            className="fsh-btn bg-noir px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            I agree
          </button>
        </div>
      </div>
    </div>
  );
}
