"use client";

import { DemoJoyride } from "@/components/demo-joyride";
import { PhotoDisclaimerModal } from "@/components/photo-disclaimer-modal";
import { SuggestionsModal } from "@/components/suggestions-modal";
import { TextTransition } from "@/components/text-transition";
import { FshLoaderOverlay } from "@/components/fsh-loader-3d";
import { SkinToneSuggestionsPanel } from "@/components/skin-tone-suggestions-panel";
import { AddToBag } from "@/components/store/add-to-bag";
import { StoreGarmentPhoto } from "@/components/store-garment-photo";
import type { Product } from "@/lib/data/products";
import { storeHasGarmentBack, tryOnGarmentImage } from "@/lib/data/garment-views";
import {
  buildSkinToneBeautyGuide,
  type SkinToneBeautyGuide,
} from "@/lib/beauty/skin-tone-suggestions";
import type { SkinToneColorResult } from "@/lib/youcam/client";
import type { CompleteLookGuide } from "@/lib/stylist/complete-look";
import { photoPrompt } from "@/lib/data/photo-guide";
import { brandFromStore } from "@/lib/data/stores";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const PHOTO_CONSENT_KEY = "fsh-photo-consent-v1";

const MANNEQUINS = [
  {
    id: "fuller-man",
    name: "Fuller man",
    group: "male",
    src: "/mannequins/fuller-man.jpg",
    back: "/mannequins/fuller-man-back.jpg",
  },
  {
    id: "man",
    name: "Man",
    group: "male",
    src: "/mannequins/man.jpg",
    back: "/mannequins/man-back.jpg",
  },
  {
    id: "curvy-woman",
    name: "Curvy woman",
    group: "female",
    src: "/mannequins/curvy-woman.jpg",
    back: "/mannequins/curvy-woman-back.jpg",
  },
  {
    id: "woman",
    name: "Woman",
    group: "female",
    src: "/mannequins/woman.jpg",
    back: "/mannequins/woman-back.jpg",
  },
] as const;

async function figureFile(src: string, filename: string) {
  const response = await fetch(src);
  if (!response.ok) throw new Error("Could not load that mannequin");
  const blob = await response.blob();
  return new File([blob], filename, { type: blob.type || "image/jpeg" });
}
type PhotoSlot = "main" | "pair" | "change" | "other";

type WornFace = "front" | "back";

type Step = "setup" | "processing" | "result";

type TryOnPanelProps = {
  product: Product;
  storeSlug?: string;
  catalog?: Product[];
  brandName?: string;
  guide?: boolean;
};

async function pollTask(
  taskId: string,
  onTick: (message: string) => void,
): Promise<string> {
  for (let i = 0; i < 40; i++) {
    onTick(
      i === 0
        ? "Placing the clothes on your photo…"
        : "Still working. This usually takes under a minute.",
    );
    await new Promise((r) => setTimeout(r, 2500));
    const res = await fetch(`/api/youcam/task/${encodeURIComponent(taskId)}`);
    const data = (await res.json()) as {
      task_status?: string;
      results?: { url?: string };
      error?: string;
      error_message?: string;
    };

    if (!res.ok) throw new Error(data.error ?? "Could not check try-on status");
    if (data.task_status === "success" && data.results?.url) return data.results.url;
    if (data.task_status === "error") {
      throw new Error(data.error_message ?? "Try-on processing failed");
    }
  }
  throw new Error("Try-on timed out — please try again.");
}

async function pollSkinToneTask(taskId: string): Promise<SkinToneColorResult> {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`/api/youcam/skin-tone/${encodeURIComponent(taskId)}`);
    const data = (await res.json()) as {
      task_status?: string;
      results?: { color?: SkinToneColorResult };
      error?: string;
      error_message?: string;
    };
    if (!res.ok) throw new Error(data.error ?? "Could not check skin analysis");
    if (data.task_status === "success" && data.results?.color) return data.results.color;
    if (data.task_status === "error") {
      throw new Error(data.error_message ?? "Skin analysis could not read your face");
    }
  }
  throw new Error("Skin analysis timed out — wardrobe colours may still help.");
}

export function TryOnPanel({
  product,
  storeSlug = "demo",
  catalog,
  brandName,
  guide = false,
}: TryOnPanelProps) {
  const brand = brandName ?? brandFromStore(storeSlug);
  const [step, setStep] = useState<Step>("setup");
  const [status, setStatus] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const wornFace = useRef<WornFace>("front");
  const [error, setError] = useState<string | null>(null);
  const [lookGuide, setLookGuide] = useState<CompleteLookGuide | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [layerName, setLayerName] = useState<string | null>(null);
  const [lookView, setLookView] = useState<"Front" | "Back">("Front");
  const [pendingBack, setPendingBack] = useState<File | null>(null);
  const [backChoice, setBackChoice] = useState<"ask" | "yes" | "no" | null>(null);
  const [backIsEstimate, setBackIsEstimate] = useState(false);
  const [skinGuide, setSkinGuide] = useState<SkinToneBeautyGuide | null>(null);
  const [skinLoading, setSkinLoading] = useState(false);
  const [skinError, setSkinError] = useState<string | null>(null);
  const analysisFileIdRef = useRef<string | null>(null);
  const pickers = useRef<Partial<Record<PhotoSlot, HTMLInputElement | null>>>({});
  const [photoSlot, setPhotoSlot] = useState<PhotoSlot | null>(null);
  const suggestedOnce = useRef(false);
  const [mounted, setMounted] = useState(false);
  const [mannequinOpen, setMannequinOpen] = useState(false);
  const [figureGroup, setFigureGroup] = useState<"female" | "male" | null>(null);
  const [figureName, setFigureName] = useState<string | null>(null);
  const [fittingMannequinBack, setFittingMannequinBack] = useState(false);
  const mannequinMenu = useRef<HTMLDivElement>(null);
  const mannequinFit = useRef(0);
  const figureNameRef = useRef<string | null>(null);
  const painted = useRef(new Set<string>());
  const [paintTick, setPaintTick] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    figureNameRef.current = figureName;
  }, [figureName]);

  useEffect(() => {
    if (!mannequinOpen) return;
    function onPointer(event: PointerEvent) {
      if (!mannequinMenu.current?.contains(event.target as Node)) setMannequinOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [mannequinOpen]);

  const openPicker = useCallback((slot: PhotoSlot) => {
    pickers.current[slot]?.click();
  }, []);

  const requestPhoto = useCallback(
    (slot: PhotoSlot) => {
      if (step === "processing") return;
      if (window.sessionStorage.getItem(PHOTO_CONSENT_KEY) === "1") {
        openPicker(slot);
        return;
      }
      setPhotoSlot(slot);
    },
    [openPicker, step],
  );

  const acceptPhoto = useCallback(() => {
    window.sessionStorage.setItem(PHOTO_CONSENT_KEY, "1");
    const slot = photoSlot;
    setPhotoSlot(null);
    if (slot) openPicker(slot);
  }, [openPicker, photoSlot]);

  const runTryOn = useCallback(
    async (input: {
      srcFileId?: string;
      srcFileUrl?: string;
      refFileUrl: string;
      garmentCategory: Product["tryOnCategory"];
      workingCopy: string;
      quiet?: boolean;
    }) => {
      if (!input.quiet) setStatus("Starting the fitting…");
      const tryOnRes = await fetch("/api/youcam/try-on", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          srcFileId: input.srcFileId,
          srcFileUrl: input.srcFileUrl,
          refFileUrl: input.refFileUrl,
          garmentCategory: input.garmentCategory,
        }),
      });
      const tryOnJson = (await tryOnRes.json()) as { taskId?: string; error?: string };
      if (!tryOnRes.ok || !tryOnJson.taskId) {
        throw new Error(tryOnJson.error ?? "Could not start try-on");
      }
      if (!input.quiet) setStatus(input.workingCopy);
      return pollTask(tryOnJson.taskId, input.quiet ? () => {} : setStatus);
    },
    [],
  );

  const uploadCustomerPhoto = useCallback(
    async (file: File, options?: { captureForSkin?: boolean }) => {
      const clothForm = new FormData();
      clothForm.append("file", file, file.name || "customer.jpg");
      const analysisForm = new FormData();
      analysisForm.append("file", file, file.name || "customer.jpg");
      const captureForSkin = options?.captureForSkin !== false;
      const [uploadRes, analysisRes] = await Promise.all([
        fetch("/api/youcam/upload", { method: "POST", body: clothForm }),
        captureForSkin
          ? fetch("/api/youcam/upload?purpose=analysis", { method: "POST", body: analysisForm })
          : Promise.resolve(null),
      ]);
      const uploadJson = (await uploadRes.json()) as { fileId?: string; error?: string };
      if (!uploadRes.ok || !uploadJson.fileId) {
        throw new Error(uploadJson.error ?? "Upload failed");
      }
      if (analysisRes) {
        const analysisJson = (await analysisRes.json()) as { fileId?: string };
        if (analysisRes.ok && analysisJson.fileId) {
          analysisFileIdRef.current = analysisJson.fileId;
        }
      }
      return uploadJson.fileId;
    },
    [],
  );

  const requestAssumption = useCallback(async () => {
    setStatus("Making an AI assumption of the back…");
    const response = await fetch("/api/photo/assume-back", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: product.imageUrl }),
    });
    const data = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !data.url) {
      throw new Error(data.error ?? "Could not make an AI assumption of the back");
    }
    return data.url;
  }, [product.imageUrl]);

  const openSuggestions = useCallback(async () => {
    const stylistRes = await fetch("/api/stylist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, product, catalog }),
    });
    if (stylistRes.ok) {
      setLookGuide((await stylistRes.json()) as CompleteLookGuide);
      setSuggestionsOpen(true);
    }
  }, [catalog, product]);

  const runSkinAnalysis = useCallback(
    async (fileId: string | null) => {
      if (!fileId) return;
      setSkinLoading(true);
      setSkinError(null);
      setSkinGuide(null);
      try {
        const startRes = await fetch("/api/youcam/skin-tone", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ srcFileId: fileId }),
        });
        const startJson = (await startRes.json()) as { taskId?: string; error?: string };
        if (!startRes.ok || !startJson.taskId) {
          throw new Error(startJson.error ?? "Could not start skin analysis");
        }
        const colors = await pollSkinToneTask(startJson.taskId);
        setSkinGuide(buildSkinToneBeautyGuide(colors, product));
      } catch (e) {
        setSkinError(
          e instanceof Error
            ? e.message
            : "Skin tone suggestions are unavailable right now.",
        );
      } finally {
        setSkinLoading(false);
      }
    },
    [product],
  );

  const afterTryOnResult = useCallback(async () => {
    await openSuggestions();
    void runSkinAnalysis(analysisFileIdRef.current);
  }, [openSuggestions, runSkinAnalysis]);

  const fitFace = useCallback(
    async (file: File, face: WornFace, allowEstimate = false, source: "photo" | "mannequin" = "photo") => {
      if (face === "back" && !storeHasGarmentBack(product) && !allowEstimate) {
        setPendingBack(file);
        setBackChoice("ask");
        setError(null);
        return;
      }

      if (source === "photo") {
        mannequinFit.current += 1;
        setFittingMannequinBack(false);
        if (face === "front" && figureNameRef.current) {
          setBackUrl(null);
        }
      }
      setError(null);
      setSuggestionsOpen(false);
      setLayerName(null);
      setStep("processing");
      setLookView(face === "back" ? "Back" : "Front");
      setStatus(source === "mannequin" ? "Setting the mannequin…" : "Sending your photo…");
      if (face === "front") {
        setSkinGuide(null);
        setSkinError(null);
        if (source === "photo") setFigureName(null);
      }

      try {
        const fileId = await uploadCustomerPhoto(file, {
          captureForSkin: source === "photo" && face === "front",
        });
        const estimate = face === "back" && !storeHasGarmentBack(product);
        const reference = estimate ? await requestAssumption() : tryOnGarmentImage(product, face);
        setBackIsEstimate(estimate);
        setStatus(
          source === "mannequin"
            ? `Placing ${product.name} on the mannequin…`
            : `Placing ${product.name} on your photo…`,
        );
        const url = await runTryOn({
          srcFileId: fileId,
          refFileUrl: reference,
          garmentCategory: product.tryOnCategory,
          workingCopy:
            face === "back"
              ? `Dressing the back view in ${product.name}…`
              : `Dressing the front view in ${product.name}…`,
          quiet: true,
        });
        if (face === "front") setFrontUrl(url);
        else setBackUrl(url);
        setResultUrl(url);
        wornFace.current = face;
        setPendingBack(null);
        setBackChoice(estimate ? "yes" : null);
        setStep("result");
        setStatus("");
        if (!suggestedOnce.current) {
          suggestedOnce.current = true;
          if (source === "mannequin") await openSuggestions();
          else await afterTryOnResult();
        } else if (face === "front" && source === "photo") {
          void runSkinAnalysis(analysisFileIdRef.current);
        }
      } catch (e) {
        if (source === "mannequin") setFigureName(null);
        setError(e instanceof Error ? e.message : source === "mannequin" ? "Could not fit that mannequin" : "Could not fit that photo");
        setStep(frontUrl || backUrl ? "result" : "setup");
        setStatus("");
      }
    },
    [
      afterTryOnResult,
      backUrl,
      frontUrl,
      openSuggestions,
      product,
      requestAssumption,
      runSkinAnalysis,
      runTryOn,
      uploadCustomerPhoto,
    ],
  );

  const fitMannequin = useCallback(
    async (figure: (typeof MANNEQUINS)[number]) => {
      const ticket = ++mannequinFit.current;
      const stale = () => ticket !== mannequinFit.current;
      setMannequinOpen(false);
      setError(null);
      setFigureName(figure.name);
      setSuggestionsOpen(false);
      setLayerName(null);
      setLookView("Front");
      setBackUrl(null);
      setFittingMannequinBack(false);
      setStep("processing");
      setStatus("Setting the mannequin…");
      try {
        const frontFile = await figureFile(figure.src, `${figure.id}.jpg`);
        if (stale()) return;
        const frontId = await uploadCustomerPhoto(frontFile, { captureForSkin: false });
        if (stale()) return;
        setStatus(`Placing ${product.name} on the mannequin…`);
        const frontResult = await runTryOn({
          srcFileId: frontId,
          refFileUrl: tryOnGarmentImage(product, "front"),
          garmentCategory: product.tryOnCategory,
          workingCopy: `Dressing the front view in ${product.name}…`,
          quiet: true,
        });
        if (stale()) return;
        setFrontUrl(frontResult);
        setResultUrl(frontResult);
        setBackIsEstimate(false);
        wornFace.current = "front";
        setStep("result");
        setStatus("");
        if (!suggestedOnce.current) {
          suggestedOnce.current = true;
          await openSuggestions();
        }
      } catch (e) {
        if (stale()) return;
        setFigureName(null);
        setError(e instanceof Error ? e.message : "Could not fit that mannequin");
        setStep(frontUrl || backUrl ? "result" : "setup");
        setStatus("");
        return;
      }

      if (!storeHasGarmentBack(product) || stale()) return;

      setFittingMannequinBack(true);
      setStatus("Fitting the back of the mannequin…");
      try {
        const backFile = await figureFile(figure.back, `${figure.id}-back.jpg`);
        if (stale()) return;
        const backId = await uploadCustomerPhoto(backFile, { captureForSkin: false });
        if (stale()) return;
        const backResult = await runTryOn({
          srcFileId: backId,
          refFileUrl: tryOnGarmentImage(product, "back"),
          garmentCategory: product.tryOnCategory,
          workingCopy: `Dressing the back view in ${product.name}…`,
          quiet: true,
        });
        if (stale()) return;
        setBackUrl(backResult);
        setBackIsEstimate(false);
        setStatus("");
      } catch (e) {
        if (stale()) return;
        setError(e instanceof Error ? e.message : "The front is ready. The back view could not be fitted.");
        setStatus("");
      } finally {
        if (!stale()) setFittingMannequinBack(false);
      }
    },
    [backUrl, frontUrl, openSuggestions, product, runTryOn, uploadCustomerPhoto],
  );

  const addToLook = useCallback(
    async (extra: Product) => {
      if (!resultUrl) return;
      setSuggestionsOpen(false);
      setError(null);
      setLayerName(extra.name);
      setStep("processing");
      setStatus(`Adding ${extra.name} onto the look you have…`);

      try {
        const sides = [
          frontUrl ? { face: "front" as const, src: frontUrl } : null,
          backUrl ? { face: "back" as const, src: backUrl } : null,
        ].filter((side): side is { face: WornFace; src: string } => side !== null);
        const targets = sides.length > 0 ? sides : [{ face: wornFace.current, src: resultUrl }];
        if (targets.length > 1) {
          setStatus(`Adding ${extra.name} to your front and back…`);
        }
        const fitted = await Promise.all(
          targets.map(async (side) => ({
            face: side.face,
            url: await runTryOn({
              srcFileUrl: side.src,
              refFileUrl: tryOnGarmentImage(extra, side.face),
              garmentCategory: extra.tryOnCategory,
              workingCopy: `Adding ${extra.name} onto what you're already wearing…`,
              quiet: targets.length > 1,
            }),
          })),
        );
        const nextFront = fitted.find((item) => item.face === "front")?.url ?? frontUrl;
        const nextBack = fitted.find((item) => item.face === "back")?.url ?? backUrl;
        setFrontUrl(nextFront);
        setBackUrl(nextBack);
        const active = lookView === "Back" ? nextBack ?? nextFront : nextFront ?? nextBack;
        if (active) setResultUrl(active);
        setStep("result");
        setStatus("");
        setSuggestionsOpen(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add that piece");
        setStep("result");
        setStatus("");
        setSuggestionsOpen(true);
      }
    },
    [backUrl, frontUrl, lookView, resultUrl, runTryOn],
  );

  const hasStoreBack = storeHasGarmentBack(product);
  const shown = lookView === "Back" && hasStoreBack ? backUrl : frontUrl;
  const imagePending = shown !== null && !painted.current.has(shown) && paintTick >= 0;
  const coverPage = step === "processing" || imagePending;
  const coverFrame =
    coverPage || (lookView === "Back" && hasStoreBack && fittingMannequinBack && !backUrl);

  return (
    <div>
      <DemoJoyride active={guide} />
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <TextTransition
            as="h1"
            text={product.name}
            className="font-display text-2xl text-noir sm:text-3xl md:text-4xl"
          />
          <p className="mt-1 text-base tabular-nums text-stone sm:text-lg">${product.price}</p>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-stone">{photoPrompt(product.photoGuide)}</p>
      </div>

      <div ref={mannequinMenu} className="relative mb-5">
        <button
          type="button"
          disabled={step === "processing"}
          aria-expanded={mannequinOpen}
          aria-haspopup="listbox"
          onClick={() => {
            setMannequinOpen((open) => {
              const next = !open;
              if (next) setFigureGroup(null);
              return next;
            });
          }}
          data-tour="mannequin"
          className="fsh-btn border border-hairline bg-white px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-noir disabled:opacity-40"
        >
          Mannequin try
        </button>
        {mannequinOpen && (
          <div
            role="listbox"
            aria-label="Choose a mannequin"
            className="absolute left-0 z-30 mt-2 w-full max-w-md border border-hairline bg-white p-3 shadow-[0_16px_40px_rgba(22,21,19,0.08)]"
          >
            <p className="px-1 text-sm leading-relaxed text-stone">
              {figureGroup
                ? "Pick a form. This piece is placed on it."
                : "No photo needed. Choose a female or male form first."}
            </p>
            {figureGroup ? (
              <>
                <button
                  type="button"
                  onClick={() => setFigureGroup(null)}
                  className="fsh-link mt-3 px-1 text-[11px] uppercase tracking-[0.14em] text-stone hover:text-noir"
                >
                  ← Female or male
                </button>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {MANNEQUINS.filter((figure) => figure.group === figureGroup).map((figure) => (
                    <button
                      key={figure.id}
                      type="button"
                      role="option"
                      aria-selected={figureName === figure.name}
                      onClick={() => void fitMannequin(figure)}
                      className="text-left"
                    >
                      <span className="flex h-36 items-center justify-center overflow-hidden bg-[#eceae6] sm:h-44">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={figure.src} alt="" className="h-full w-full object-contain" />
                      </span>
                      <span className="mt-2 block text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-noir sm:text-[11px]">
                        {figure.name}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFigureGroup("female")}
                  className="fsh-btn border border-hairline bg-white px-3 py-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-noir"
                >
                  Female
                </button>
                <button
                  type="button"
                  onClick={() => setFigureGroup("male")}
                  className="fsh-btn border border-hairline bg-white px-3 py-6 text-[11px] font-semibold uppercase tracking-[0.16em] text-noir"
                >
                  Male
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div data-tour="photo" className="relative aspect-[3/4] overflow-hidden bg-[#eceae6]">
          <input
            ref={(node) => {
              pickers.current.main = node;
            }}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={step === "processing"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void fitFace(file, "front");
              e.target.value = "";
            }}
          />
          <input
            ref={(node) => {
              pickers.current.pair = node;
            }}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={step === "processing"}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void fitFace(file, "back");
              e.target.value = "";
            }}
          />
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shown}
              alt={figureName ? `${product.name} on the ${figureName.toLowerCase()} mannequin` : "You in this piece"}
              className="absolute inset-0 h-full w-full object-contain"
              onLoad={() => {
                painted.current.add(shown);
                setPaintTick((tick) => tick + 1);
              }}
            />
          ) : (
            <button
              type="button"
              disabled={step === "processing"}
              onClick={() => requestPhoto(lookView === "Back" && hasStoreBack ? "pair" : "main")}
              className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center px-8 text-center"
            >
              <span className="font-display text-4xl text-noir">You</span>
              <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-noir">
                <svg
                  className="fsh-click-cue"
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  aria-hidden="true"
                >
                  <path d="M2 1.5 2 12.2 5.1 9.4 7.4 14.2 9.2 13.4 6.9 8.6 11 8.6Z" fill="currentColor" />
                </svg>
                Click here
              </span>
              <span className="mt-2 max-w-xs text-sm leading-relaxed text-stone">
                {lookView === "Back" && hasStoreBack
                  ? "Add a photo with your back to the camera."
                  : photoPrompt(product.photoGuide)}
              </span>
            </button>
          )}
          <span className="pointer-events-none absolute left-2 top-2 z-10 bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-noir sm:left-4 sm:top-4 sm:text-[10px] sm:tracking-[0.16em]">
            {figureName ?? "You"}
          </span>
          {shown && (
            <button
              type="button"
              disabled={step === "processing"}
              onClick={() => requestPhoto(lookView === "Back" && hasStoreBack ? "pair" : "main")}
              className="fsh-btn absolute right-2 top-2 z-10 max-w-[46%] bg-white px-2 py-2 text-[9px] font-semibold uppercase leading-tight tracking-[0.08em] text-noir disabled:opacity-40 sm:right-4 sm:top-4 sm:px-3 sm:text-[10px] sm:tracking-[0.12em]"
            >
              {figureName ? "Your photo" : lookView === "Back" ? "Different back photo" : "Different photo"}
            </button>
          )}
          {coverFrame && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#f6f5f2]">
              <FshLoaderOverlay
                compact
                title={status || "Placing the piece on the photo…"}
                detail="This stays up until the garment is on."
              />
            </div>
          )}
          {hasStoreBack && (frontUrl || backUrl) && (
            <div className="absolute inset-x-0 bottom-3 z-30 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setLookView("Front")}
                className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  lookView === "Front" ? "bg-noir text-white" : "bg-white text-noir"
                }`}
              >
                Front
              </button>
              <button
                type="button"
                onClick={() => setLookView("Back")}
                className={`px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                  lookView === "Back" ? "bg-noir text-white" : "bg-white text-noir"
                }`}
              >
                Back
              </button>
            </div>
          )}
        </div>

        <div className="relative aspect-[3/4] overflow-hidden bg-mist">
          <StoreGarmentPhoto
            product={product}
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
          <span className="absolute left-4 top-4 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-noir">
            {layerName ? `Adding ${layerName}` : "The piece"}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 border border-hairline bg-[#f6f5f2] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="catalog-code">Add this piece</p>
          <p className="mt-1 font-display text-3xl text-noir">${product.price}</p>
        </div>
        <AddToBag productId={product.id} className="w-full sm:w-auto" />
      </div>

      <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
        {brand} will not use your photo for any commercial purposes.
      </p>

      {hasStoreBack && frontUrl && !backUrl && !figureName && (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
          {lookView === "Back"
            ? "Add a photo with your back to the camera if you want to see this side."
            : "This piece has a back as well. Open Back, then add a photo with your back to the camera if you want to see it."}
        </p>
      )}
      {figureName && hasStoreBack && fittingMannequinBack && (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
          The front is ready. The back of this mannequin is being fitted with the back of the piece.
        </p>
      )}
      {figureName && hasStoreBack && backUrl && lookView === "Front" && (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
          Open Back to see this piece on the back of the mannequin.
        </p>
      )}

      {mounted &&
        backChoice === "ask" &&
        pendingBack &&
        createPortal(
          <div className="fsh-modal-overlay fixed inset-0 z-[130] flex items-center justify-center bg-noir/55 p-4">
            <div
              role="dialog"
              aria-modal="true"
              className="fsh-modal-panel w-full max-w-md bg-white p-6 sm:p-8"
            >
              <p className="catalog-code">Back of {product.name}</p>
              <h2 className="mt-3 font-display text-3xl text-noir">This piece has no back photo</h2>
              <p className="mt-4 text-sm leading-relaxed text-noir">
                Your back photo is ready. An AI assumption of the back can be placed on it. That
                result is labeled an estimate, not a store photo.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="fsh-btn bg-noir px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-white"
                  onClick={() => {
                    const file = pendingBack;
                    setBackChoice("yes");
                    if (file) void fitFace(file, "back", true);
                  }}
                >
                  Use an assumption
                </button>
                <button
                  type="button"
                  className="fsh-btn border border-hairline px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-noir"
                  onClick={() => {
                    setBackChoice("no");
                    setPendingBack(null);
                  }}
                >
                  Keep the front only
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {backIsEstimate && lookView === "Back" && backUrl && (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
          This back is an AI assumption, not a store photo. Details that were not visible on the front cannot be verified.
        </p>
      )}

      {error && <p className="mt-4 text-sm text-red-800">{error}</p>}

      {step === "result" && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-stone">
            The preview keeps your whole photo. It is a preview, not a fit guarantee.
          </p>
          {lookGuide && (
            <button
              type="button"
              onClick={() => setSuggestionsOpen(true)}
              className="bg-noir px-4 py-2 text-[10px] font-medium text-white sm:text-xs"
            >
              Suggestions
            </button>
          )}
        </div>
      )}

      {step === "result" && (
        <SkinToneSuggestionsPanel
          loading={skinLoading}
          error={skinError}
          guide={skinGuide}
        />
      )}

      {mounted &&
        coverPage &&
        createPortal(
          <div className="fixed inset-0 z-[140] flex items-center justify-center bg-canvas px-6">
            <FshLoaderOverlay
              title={status || "Working on your fitting…"}
                detail={
                  layerName
                    ? `Keeping ${product.name} and adding ${layerName}.`
                    : "Your photo is used just as you sent it."
                }
            />
          </div>,
          document.body,
        )}

      <PhotoDisclaimerModal
        open={photoSlot !== null}
        brandName={brand}
        onAccept={acceptPhoto}
        onClose={() => setPhotoSlot(null)}
      />

      {lookGuide && (
        <SuggestionsModal
          open={suggestionsOpen && step === "result"}
          guide={lookGuide}
          storeSlug={storeSlug}
          anchor={product}
          catalog={catalog}
          onClose={() => setSuggestionsOpen(false)}
          onAdd={(item) => void addToLook(item)}
        />
      )}
    </div>
  );
}
