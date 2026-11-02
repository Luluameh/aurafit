"use client";

import { useEffect, useState } from "react";

const PHOTOS = [
  "/catalog/teal-floral-ankara.jpg",
  "/catalog/brown-agbada.jpg",
  "/catalog/yellow-leaf-ankara.jpg",
];

const START_MS = 420;
const STEP_MS = 880;
const SLIDE_MS = 1100;
const STEPS = PHOTOS.length + 1;
const END_MS = START_MS + (STEPS - 1) * STEP_MS + SLIDE_MS;

type SiteIntroGateProps = {
  children: React.ReactNode;
};

export function SiteIntroGate({ children }: SiteIntroGateProps) {
  const [phase, setPhase] = useState<"show" | "exit" | "done">("show");
  const [contentReady, setContentReady] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    document.documentElement.classList.add("fsh-intro-active");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let doneTimer = 0;

    const finish = () => {
      setProgress(100);
      setShown(STEPS);
      setPhase("exit");
      doneTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("fsh-intro-active");
        setPhase("done");
        setContentReady(true);
      }, reduced ? 0 : 1100);
    };

    if (reduced) {
      finish();
    } else {
      const start = performance.now();
      const tick = (now: number) => {
        const elapsed = now - start;
        const next = Math.min(STEPS, elapsed < START_MS ? 0 : 1 + Math.floor((elapsed - START_MS) / STEP_MS));
        setShown(next);
        setProgress(Math.min(100, Math.round((elapsed / END_MS) * 100)));
        if (elapsed < END_MS) frame = window.requestAnimationFrame(tick);
        else finish();
      };
      frame = window.requestAnimationFrame(tick);
    }

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(doneTimer);
    };
  }, []);

  return (
    <>
      {phase !== "done" && (
        <div
          className={`fsh-intro-screen ${phase === "exit" ? "fsh-intro-screen--exit" : ""}`}
          aria-live="polite"
          aria-busy={phase === "show"}
        >
          <div className="fsh-intro-veil" aria-hidden />
          <div className="fsh-intro-frame" aria-hidden>
            {PHOTOS.map((src, index) => (
              <img
                key={src}
                src={src}
                alt=""
                className={`fsh-intro-frame__photo ${index < shown ? "is-in" : ""}`}
              />
            ))}
            <div className={`fsh-intro-frame__close ${PHOTOS.length < shown ? "is-in" : ""}`} />
          </div>
          <div className="fsh-intro-meta">
            <img src="/brand/aurafit.png" alt="AuraFit" className="fsh-intro-logo" />
            <p className="fsh-intro-percent">{progress}%</p>
          </div>
        </div>
      )}
      <div
        className={
          contentReady ? "fsh-page-shell fsh-page-shell--ready" : "fsh-page-shell"
        }
      >
        {children}
      </div>
    </>
  );
}
