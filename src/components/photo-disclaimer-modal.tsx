"use client";

import { useEffect } from "react";

type PhotoDisclaimerModalProps = {
  open: boolean;
  brandName: string;
  onAccept: () => void;
  onClose: () => void;
};

export function PhotoDisclaimerModal({
  open,
  brandName,
  onAccept,
  onClose,
}: PhotoDisclaimerModalProps) {
  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fsh-modal-overlay fixed inset-0 z-[120] flex items-end justify-center bg-noir/50 p-4 sm:items-center"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="fsh-modal-panel w-full max-w-md bg-white p-6 sm:p-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="photo-disclaimer-title"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="catalog-code">Your photo</p>
        <h2 id="photo-disclaimer-title" className="mt-3 font-display text-3xl leading-none text-noir">
          Before you add a photo
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-noir">
          <span className="font-semibold">{brandName}</span> will not use your photo for any
          commercial purposes.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-stone">
          It is used only to show this piece on you. It is not put in advertising, sold, or kept
          as a campaign image.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAccept}
            className="fsh-btn bg-noir px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={onClose}
            className="fsh-btn border border-hairline px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-noir"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
