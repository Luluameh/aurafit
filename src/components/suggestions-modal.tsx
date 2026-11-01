"use client";

import { ProductImage } from "@/components/product-image";
import type { Product } from "@/lib/data/products";
import { productSupportsApparelTryOn } from "@/lib/data/products";
import {
  sizeGuidance,
  SIZES,
  type Size,
  type StylistAnswer,
} from "@/lib/stylist/ask";
import type { CompleteLookGuide } from "@/lib/stylist/complete-look";
import {
  OCCASIONS,
  type CoordinatedOutfit,
  type Occasion,
} from "@/lib/stylist/outfit";
import { useEffect, useState } from "react";

type SuggestionsModalProps = {
  open: boolean;
  guide: CompleteLookGuide;
  storeSlug: string;
  anchor: Product;
  catalog?: Product[];
  onClose: () => void;
  onAdd: (product: Product) => void;
};

const prompts = [
  "Add a shoe",
  "Add a red shoe",
  "Add a bag",
  "Light makeup for day",
  "I already have makeup on",
];

export function SuggestionsModal({
  open,
  guide,
  anchor,
  catalog,
  onClose,
  onAdd,
}: SuggestionsModalProps) {
  const [size, setSize] = useState<Size>("M");
  const [draft, setDraft] = useState("");
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState<StylistAnswer | null>(null);
  const [occasion, setOccasion] = useState<Occasion>("evening");
  const [budget, setBudget] = useState(500);
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

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-noir/55 p-0 sm:items-center sm:p-3 fsh-modal-overlay">
      <button
        type="button"
        aria-label="Close suggestions"
        className="absolute inset-0 fsh-link"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="suggestions-title"
        className="fsh-modal-panel relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto bg-canvas p-4 shadow-xl sm:max-h-[88vh] sm:rounded-none sm:p-7 pb-[max(1rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="catalog-code">After your try-on</p>
            <h2 id="suggestions-title" className="mt-1 font-display text-2xl text-noir sm:text-3xl">
              Suggestions
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

        <section className="mt-6 border border-hairline bg-white p-4">
          <p className="catalog-code">Occasion and budget</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="block text-sm">
              Occasion
              <select
                value={occasion}
                onChange={(event) => {
                  setSwaps({});
                  setOccasion(event.target.value as Occasion);
                }}
                className="mt-1 block w-full border border-hairline bg-canvas px-3 py-2"
              >
                {OCCASIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm">
              Budget ($)
              <input
                type="number"
                min={0}
                value={budget}
                onChange={(event) => setBudget(Number(event.target.value))}
                className="mt-1 block w-full border border-hairline bg-canvas px-3 py-2"
              />
            </label>
          </div>
          {outfit && (
            <div className="mt-4">
              <ul className="divide-y divide-hairline border-y border-hairline">
                {outfit.pieces.map((piece) => (
                  <li key={piece.role} className="py-3">
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm text-noir">
                        {piece.label} · {piece.product.name}
                      </p>
                      <p className="shrink-0 text-sm tabular-nums">${piece.product.price}</p>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-stone">{piece.reason}</p>
                    {piece.alternatives.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {piece.alternatives.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => {
                              setSwaps((current) => ({ ...current, [piece.role]: option.id }));
                              if (productSupportsApparelTryOn(option)) onAdd(option);
                            }}
                            className="border border-hairline px-2 py-1 text-[11px] text-noir"
                          >
                            Swap {option.name} · ${option.price}
                          </button>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm text-noir">Total ${outfit.total}</p>
              <p className="mt-1 text-xs leading-relaxed text-stone">{outfit.note}</p>
            </div>
          )}
        </section>

        <div className="mt-6">
          <p className="catalog-code">Size</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {SIZES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSize(option)}
                className={`h-9 w-11 text-xs ${
                  size === option ? "bg-noir text-white" : "bg-white text-noir"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-stone">
            {sizeGuidance(size, anchor.name)}
          </p>
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

        <div className="mt-8 grid gap-6 border-t border-hairline pt-6 md:grid-cols-3">
          <Note
            title={answer?.makeupTitle ?? "Makeup"}
            body={(answer?.makeup ?? guide.makeup.ideas).slice(0, 2).join(" ")}
          />
          <Note title="Already at home" body={answer?.atHome ?? guide.atHome.ideas[0]} />
          <Note
            title={answer?.occasion ?? guide.occasions[0]?.label ?? "Occasion"}
            body={
              answer?.occasion
                ? `${anchor.name} with ${picks[0]?.product.name ?? "a piece from this shop"} is one option for ${answer.occasion.toLowerCase()}.`
                : (guide.occasions[0]?.pairing ?? "")
            }
          />
        </div>

        <form
          className="mt-6 border border-hairline bg-white p-4"
          onSubmit={(event) => {
            event.preventDefault();
            void ask(draft);
          }}
        >
          <label className="catalog-code" htmlFor="stylist-prompt">
            Ask for a shoe, a bag, or makeup
          </label>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              id="stylist-prompt"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a red shoe, or I already have makeup on"
              className="min-w-0 flex-1 border border-hairline bg-canvas px-3 py-3 text-sm outline-none focus:border-noir"
            />
            <button
              type="submit"
              disabled={asking}
              className="bg-noir px-4 py-3 text-xs font-medium text-white disabled:opacity-50 sm:py-0"
            >
              {asking ? "…" : "Ask"}
            </button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {prompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => void ask(prompt)}
                className="border border-hairline px-3 py-1.5 text-xs text-stone hover:border-noir hover:text-noir"
              >
                {prompt}
              </button>
            ))}
          </div>
          {answer && (
            <p className="mt-4 text-sm leading-relaxed text-noir">{answer.reply}</p>
          )}
        </form>
      </div>
    </div>
  );
}

function Note({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <div>
      <p className="catalog-code">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-noir">{body}</p>
    </div>
  );
}
