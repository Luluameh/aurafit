"use client";

import { ProductImage } from "@/components/product-image";
import type { Product } from "@/lib/data/products";
import { type Size, type StylistAnswer } from "@/lib/stylist/ask";
import type { CompleteLookGuide } from "@/lib/stylist/complete-look";
import {
  intentionFor,
  OCCASIONS,
  type CoordinatedOutfit,
  type Occasion,
} from "@/lib/stylist/outfit";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type SuggestionsModalProps = {
  open: boolean;
  guide: CompleteLookGuide;
  storeSlug: string;
  anchor: Product;
  catalog?: Product[];
  onClose: () => void;
  onAdd: (product: Product) => void;
};

export function SuggestionsModal({
  open,
  anchor,
  catalog,
  onClose,
  onAdd,
}: SuggestionsModalProps) {
  const size: Size = "M";
  const [draft, setDraft] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<StylistAnswer | null>(null);
  const intention = intentionFor(anchor);
  const [occasion, setOccasion] = useState<Occasion>(intention.occasion);
  const [budget] = useState(800);
  const [swaps, setSwaps] = useState<Record<string, string>>({});
  const [outfit, setOutfit] = useState<CoordinatedOutfit | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    async function loadOutfit() {
      const res = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: anchor.id,
          product: anchor,
          catalog,
          occasion,
          budget,
          swaps,
        }),
      });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as { outfit?: CoordinatedOutfit };
      if (data.outfit) setOutfit(data.outfit);
    }
    void loadOutfit();
    return () => {
      cancelled = true;
    };
  }, [anchor, budget, catalog, occasion, open, swaps]);

  useEffect(() => {
    setOccasion(intentionFor(anchor).occasion);
    setSwaps({});
    setAnswer(null);
  }, [anchor]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function ask(message: string) {
    const text = message.trim();
    if (!text) return;
    setAsking(true);
    setDraft("");
    try {
      const res = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: anchor.id,
          product: anchor,
          catalog,
          prompt: text,
          size,
        }),
      });
      if (res.ok) setAnswer((await res.json()) as StylistAnswer);
    } finally {
      setAsking(false);
    }
  }

  function slotFor(product: Product) {
    if (product.category === "outer") return "layer";
    return product.category;
  }

  const picks = answer?.picks?.length
    ? answer.picks.map((item) => ({ ...item, role: slotFor(item.product) }))
    : (outfit?.pieces ?? [])
        .filter((piece) => piece.role !== "anchor")
        .map((piece) => ({
          product: piece.product,
          reason: piece.reason,
          canTryOn: piece.canTryOn,
          role: piece.role,
        }));

  const card = (
    <div className="fsh-modal-overlay fixed inset-0 z-[125] flex items-center justify-center bg-noir/55 p-4">
      <button
        type="button"
        aria-label="Close suggestions"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggestions-title"
        className="fsh-modal-panel relative max-h-[min(72vh,640px)] w-full max-w-lg overflow-y-auto bg-canvas p-5 shadow-xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="catalog-code">With this piece</p>
            <h2 id="suggestions-title" className="mt-1 font-display text-2xl text-noir sm:text-3xl">
              {anchor.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-hairline px-3 py-2 text-xs text-noir"
          >
            Close
          </button>
        </div>

        <p className="mt-4 text-sm leading-relaxed text-noir">{intention.line}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {OCCASIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                setSwaps({});
                setAnswer(null);
                setOccasion(option);
              }}
              className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                occasion === option ? "bg-noir text-white" : "bg-white text-noir"
              }`}
            >
              {option}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {picks.map((item) => (
            <button
              key={item.product.id}
              type="button"
              onClick={() => {
                setSwaps((current) => ({ ...current, [item.role]: item.product.id }));
                if (item.canTryOn) onAdd(item.product);
              }}
              className="text-left"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-mist">
                <ProductImage
                  productId={item.product.id}
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="200px"
                />
              </div>
              <p className="mt-2 text-sm text-noir">{item.product.name}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone">
                {item.reason}
              </p>
              <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-noir">
                Add to this look
              </p>
            </button>
          ))}
        </div>

        {picks.length === 0 && (
          <p className="mt-6 text-sm leading-relaxed text-stone">{outfit?.note}</p>
        )}

        {answer && <p className="mt-4 text-sm leading-relaxed text-noir">{answer.reply}</p>}

        <form
          className="mt-6 border-t border-hairline pt-4"
          onSubmit={(event) => {
            event.preventDefault();
            void ask(draft);
          }}
        >
          <label className="catalog-code" htmlFor="stylist-prompt">
            Ask for something to wear with {anchor.name}
          </label>
          <div className="mt-3 flex gap-2">
            <input
              id="stylist-prompt"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="A gold necklace, or a plain heel"
              className="min-w-0 flex-1 border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-noir"
            />
            <button
              type="submit"
              disabled={asking}
              className="bg-noir px-4 py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {asking ? "…" : "Ask"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (typeof document === "undefined") return card;
  return createPortal(card, document.body);
}
