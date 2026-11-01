"use client";

import type { SkinToneBeautyGuide } from "@/lib/beauty/skin-tone-suggestions";
import { FshLoaderOverlay } from "@/components/fsh-loader-3d";

type SkinToneSuggestionsPanelProps = {
  loading: boolean;
  error: string | null;
  guide: SkinToneBeautyGuide | null;
};

export function SkinToneSuggestionsPanel({
  loading,
  error,
  guide,
}: SkinToneSuggestionsPanelProps) {
  if (!loading && !error && !guide) return null;

  return (
    <section className="fsh-reveal mt-8 border border-hairline bg-white p-5 sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="catalog-code">YouCam · skin analysis</p>
          <h2 className="mt-1 font-display text-2xl text-noir">Colours & makeup for your tone</h2>
        </div>
        {guide && (
          <span className="catalog-code mt-2 sm:mt-0">{guide.undertoneLabel}</span>
        )}
      </div>

      {loading && (
        <div className="mt-6 border border-hairline bg-canvas">
          <FshLoaderOverlay
            compact
            title="Reading your skin tone…"
            detail="YouCam measures lip, eye, brow, and skin colour from your upload."
          />
        </div>
      )}

      {error && !loading && (
        <p className="mt-4 text-sm leading-relaxed text-stone">{error}</p>
      )}

      {guide && !loading && (
        <div className="mt-6 space-y-8">
          <div>
            <h3 className="catalog-code">Wardrobe colours</h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
              {guide.wardrobe.map((swatch) => (
                <li
                  key={`${swatch.label}-${swatch.hex}`}
                  className="flex gap-3 border border-hairline p-3"
                >
                  <span
                    className="h-12 w-12 shrink-0 border border-hairline"
                    style={{ backgroundColor: swatch.hex }}
                    aria-hidden
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium text-noir">{swatch.label}</span>
                    <span className="mt-1 block text-xs uppercase tracking-wide text-stone">
                      {swatch.hex}
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-stone">
                      {swatch.note}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="catalog-code">Makeup direction</h3>
            <ul className="mt-3 divide-y divide-hairline border-y border-hairline">
              {guide.makeup.map((item) => (
                <li key={item.area} className="grid gap-1 py-3 sm:grid-cols-[6rem_1fr] sm:gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-noir">
                    {item.area}
                  </span>
                  <span className="text-sm leading-relaxed text-stone">{item.tip}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs leading-relaxed text-stone">{guide.disclaimer}</p>
        </div>
      )}
    </section>
  );
}
