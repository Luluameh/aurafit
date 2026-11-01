"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const FshLoader3D = dynamic(
  () => import("@/components/fsh-loader-3d").then((mod) => mod.FshLoader3D),
  { ssr: false },
);

const FADE_MS = 2600;
const DONE_MS = 3400;

type SiteIntroGateProps = {
  children: React.ReactNode;
};

export function SiteIntroGate({ children }: SiteIntroGateProps) {
  const [phase, setPhase] = useState<"show" | "exit" | "done">("show");
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add("fsh-intro-active");

    const fadeTimer = window.setTimeout(() => setPhase("exit"), FADE_MS);
    const doneTimer = window.setTimeout(() => {
      document.documentElement.classList.remove("fsh-intro-active");
      setPhase("done");
      setContentReady(true);
    }, DONE_MS);

    return () => {
      window.clearTimeout(fadeTimer);
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
          <div className="fsh-intro-screen__grain" />
          <div className="fsh-intro-rise fsh-intro-rise--1">
            <FshLoader3D className="h-40 w-40 sm:h-48 sm:w-48" cameraDistance={2.85} />
          </div>
          <p className="fsh-intro-rise fsh-intro-rise--2 mt-8 font-display text-4xl tracking-tight text-noir sm:text-5xl">
            FSH
          </p>
          <p className="catalog-code fsh-intro-rise fsh-intro-rise--3 mt-3">
            Opening the fitting room
          </p>
          <div className="fsh-intro-screen__bar fsh-intro-rise fsh-intro-rise--4 mt-10" />
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
