"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const TOUR_KEY = "fsh-demo-tour-v1";
const CONSENT_KEY = "fsh-entry-consent-v1";

const STEPS = [
  {
    target: "[data-tour='photo']",
    title: "Try it with your photo",
    body: "Click here and upload a full-length photo. The piece is placed on you.",
  },
  {
    target: "[data-tour='mannequin']",
    title: "Or use a mannequin",
    body: "Open Mannequin try and pick a form. No photo needed.",
  },
] as const;

type Box = { top: number; left: number; width: number; height: number };

export function DemoJoyride({ active }: { active: boolean }) {
  const [step, setStep] = useState<number | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  useEffect(() => {
    if (!active) return;
    if (window.localStorage.getItem(TOUR_KEY) === "1") return;
    const timer = window.setInterval(() => {
      const intro = document.documentElement.classList.contains("fsh-intro-active");
      const agreed = window.localStorage.getItem(CONSENT_KEY) === "1";
      const target = document.querySelector(STEPS[0].target);
      if (!intro && agreed && target) {
        window.clearInterval(timer);
        setStep(0);
      }
    }, 300);
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    if (step === null) return;
    const current = STEPS[step];
    if (!current) return;
    const node = document.querySelector(current.target);
    if (!node) return;
    node.scrollIntoView({ block: "center", inline: "nearest" });

    function measure() {
      const next = document.querySelector(current.target);
      if (!next) return;
      const rect = next.getBoundingClientRect();
      setBox({ top: rect.top, left: rect.left, width: rect.width, height: rect.height });
    }

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [step]);

  if (step === null || !box) return null;
  const current = STEPS[step];
  if (!current) return null;

  const pad = 8;
  const cardHeight = 188;
  let tipTop = box.top + box.height + 12;
  if (tipTop + cardHeight > window.innerHeight - 8 || tipTop < 12) {
    tipTop = Math.max(12, window.innerHeight - cardHeight - 12);
  }
  const tipLeft = Math.min(Math.max(12, box.left), window.innerWidth - 300);

  function finish() {
    window.localStorage.setItem(TOUR_KEY, "1");
    setStep(null);
  }

  const tour = (
    <div className="fixed inset-0 z-[120]">
      <div
        className="pointer-events-none absolute rounded-sm bg-transparent shadow-[0_0_0_9999px_rgba(22,21,19,0.45)]"
        style={{
          top: box.top - pad,
          left: box.left - pad,
          width: box.width + pad * 2,
          height: box.height + pad * 2,
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="fsh-tour-title"
        className="absolute z-10 w-[min(18rem,calc(100vw-1.5rem))] border border-hairline bg-white p-4"
        style={{ top: tipTop, left: tipLeft }}
      >
        <p className="catalog-code">
          {step + 1} / {STEPS.length}
        </p>
        <h2 id="fsh-tour-title" className="mt-2 font-display text-2xl text-noir">
          {current.title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone">{current.body}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <button type="button" onClick={finish} className="text-[11px] uppercase tracking-[0.14em] text-stone">
            Skip
          </button>
          <button
            type="button"
            onClick={() => {
              if (step >= STEPS.length - 1) finish();
              else setStep(step + 1);
            }}
            className="fsh-btn bg-noir px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            {step >= STEPS.length - 1 ? "Done" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") return tour;
  return createPortal(tour, document.body);
}
