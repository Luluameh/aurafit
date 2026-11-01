"use client";

import { SuggestionsModal } from "@/components/suggestions-modal";
import { FshLoaderOverlay } from "@/components/fsh-loader-3d";
import { SkinToneSuggestionsPanel } from "@/components/skin-tone-suggestions-panel";
import { StoreGarmentPhoto } from "@/components/store-garment-photo";
import type { Product } from "@/lib/data/products";
import {
  defaultPhotoChoice,
  getPhotoOptions,
  type PhotoOption,
} from "@/lib/data/photo-guide";
import { garmentViewNotice, storeHasGarmentBack, tryOnGarmentImage } from "@/lib/data/garment-views";
import {
  buildSkinToneBeautyGuide,
  type SkinToneBeautyGuide,
} from "@/lib/beauty/skin-tone-suggestions";
import type { SkinToneColorResult } from "@/lib/youcam/client";
import type { CompleteLookGuide } from "@/lib/stylist/complete-look";
import { prepareCustomerPhoto } from "@/lib/photo/prepare-customer-photo";
import { useCallback, useMemo, useRef, useState } from "react";

type WornFace = "front" | "back";

function faceFor(choice: PhotoOption["id"]): WornFace {
  return choice === "back-full" ? "back" : "front";
}

type Step = "setup" | "processing" | "result";

type TryOnPanelProps = {
  product: Product;
  storeSlug?: string;
  catalog?: Product[];
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

export function TryOnPanel({ product, storeSlug = "demo", catalog }: TryOnPanelProps) {
  const [step, setStep] = useState<Step>("setup");
  const [status, setStatus] = useState("");
  const [photoChoice, setPhotoChoice] = useState<PhotoOption["id"]>(() =>
    defaultPhotoChoice(product.photoGuide),
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [frontUrl, setFrontUrl] = useState<string | null>(null);
  const [backUrl, setBackUrl] = useState<string | null>(null);
  const wornFace = useRef<WornFace>("front");
  const [error, setError] = useState<string | null>(null);
  const [lookGuide, setLookGuide] = useState<CompleteLookGuide | null>(null);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [layerName, setLayerName] = useState<string | null>(null);
  const [lookView, setLookView] = useState<"Front" | "Back">("Front");
  const [pairedBack, setPairedBack] = useState<File | null>(null);
  const [pendingBack, setPendingBack] = useState<File | null>(null);
  const [backChoice, setBackChoice] = useState<"ask" | "yes" | "no" | null>(null);
  const [backIsEstimate, setBackIsEstimate] = useState(false);
  const [skinGuide, setSkinGuide] = useState<SkinToneBeautyGuide | null>(null);
  const [skinLoading, setSkinLoading] = useState(false);
  const [skinError, setSkinError] = useState<string | null>(null);
  const analysisFileIdRef = useRef<string | null>(null);

  const photoOptions = useMemo(
    () => getPhotoOptions(product.photoGuide),
    [product.photoGuide],
  );

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
      const prepared = await prepareCustomerPhoto(file);
      const clothForm = new FormData();
      clothForm.append("file", prepared.file);
      const analysisForm = new FormData();
      analysisForm.append("file", prepared.file);
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

  const onFile = useCallback(
    async (file: File) => {
      setError(null);
      setSuggestionsOpen(false);
      setSkinGuide(null);
      setSkinError(null);
      setLayerName(null);
      setStep("processing");
      setStatus("Removing the background…");
      setResultUrl(null);
      setFrontUrl(null);
      setBackUrl(null);
      setPreviewUrl(URL.createObjectURL(file));
      const backPhoto = pairedBack;
      const fitBoth =
        Boolean(backPhoto) &&
        faceFor(photoChoice) === "front" &&
        (storeHasGarmentBack(product) || backChoice === "yes");
      if (fitBoth) setPairedBack(null);

      try {
        if (backPhoto && fitBoth) {
          setStatus("Removing the background from your front photo…");
          const frontId = await uploadCustomerPhoto(file);
          setStatus("Removing the background from your back photo…");
          const backId = await uploadCustomerPhoto(backPhoto, { captureForSkin: false });
          const backReference = storeHasGarmentBack(product)
            ? tryOnGarmentImage(product, "back")
            : await requestAssumption();
          setBackIsEstimate(!storeHasGarmentBack(product));
          setStatus(`Dressing your front and back in ${product.name}…`);
          const [frontResult, backResult] = await Promise.allSettled([
            runTryOn({
              srcFileId: frontId,
              refFileUrl: tryOnGarmentImage(product),
              garmentCategory: product.tryOnCategory,
              workingCopy: "",
              quiet: true,
            }),
            runTryOn({
              srcFileId: backId,
              refFileUrl: backReference,
              garmentCategory: product.tryOnCategory,
              workingCopy: "",
              quiet: true,
            }),
          ]);
          if (frontResult.status === "rejected") {
            throw frontResult.reason instanceof Error
              ? frontResult.reason
              : new Error("Could not fit your front photo");
          }
          wornFace.current = "front";
          setFrontUrl(frontResult.value);
          setResultUrl(frontResult.value);
          setLookView("Front");
          if (backResult.status === "fulfilled") {
            setBackUrl(backResult.value);
          } else {
            setBackUrl(null);
            setError("Your front photo is ready. The back photo could not be fitted, so no back view was invented.");
          }
          setStep("result");
          setStatus("");
          await afterTryOnResult();
          return;
        }

        setStatus("Removing the background…");
        const fileId = await uploadCustomerPhoto(file);
        const url = await runTryOn({
          srcFileId: fileId,
          refFileUrl: tryOnGarmentImage(product),
          garmentCategory: product.tryOnCategory,
          workingCopy: `Dressing you in ${product.name}…`,
        });
        const face = faceFor(photoChoice);
        wornFace.current = face;
        setResultUrl(url);
        setFrontUrl(face === "front" ? url : null);
        setBackUrl(face === "back" ? url : null);
        setBackIsEstimate(false);
        setLookView(face === "back" ? "Back" : "Front");
        setStep("result");
        setStatus("");
        await afterTryOnResult();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
        setStep("setup");
        setStatus("");
      }
    },
    [afterTryOnResult, backChoice, pairedBack, photoChoice, product, requestAssumption, runTryOn, uploadCustomerPhoto],
  );

  const onOtherSide = useCallback(
    async (file: File, allowEstimate = false) => {
      const face: WornFace = frontUrl && !backUrl ? "back" : "front";
      if (face === "back" && !storeHasGarmentBack(product) && !allowEstimate) {
        setPendingBack(file);
        setBackChoice("ask");
        setError(null);
        return;
      }
      setError(null);
      setSuggestionsOpen(false);
      setStep("processing");
      setStatus("Removing the background…");

      try {
        const prepared = await prepareCustomerPhoto(file);
        setStatus(
          prepared.backgroundRemoved
            ? face === "back"
              ? "Placing the clothes on your back photo…"
              : "Placing the clothes on your front photo…"
            : "Background removal was unavailable. Using your original photo…",
        );
        const form = new FormData();
        form.append("file", prepared.file);
        const uploadRes = await fetch("/api/youcam/upload", { method: "POST", body: form });
        const analysisForm = new FormData();
        analysisForm.append("file", prepared.file);
        if (face === "front") {
          void fetch("/api/youcam/upload?purpose=analysis", {
            method: "POST",
            body: analysisForm,
          })
            .then(async (analysisRes) => {
              if (!analysisRes.ok) return;
              const analysisJson = (await analysisRes.json()) as { fileId?: string };
              if (analysisJson.fileId) analysisFileIdRef.current = analysisJson.fileId;
            })
            .catch(() => {});
        }
        const uploadJson = (await uploadRes.json()) as { fileId?: string; error?: string };
        if (!uploadRes.ok || !uploadJson.fileId) {
          throw new Error(uploadJson.error ?? "Upload failed");
        }
        const reference =
          face === "back" && !storeHasGarmentBack(product)
            ? await requestAssumption()
            : tryOnGarmentImage(product, face);
        setBackIsEstimate(face === "back" && !storeHasGarmentBack(product));
        const url = await runTryOn({
          srcFileId: uploadJson.fileId,
          refFileUrl: reference,
          garmentCategory: product.tryOnCategory,
          workingCopy:
            face === "back"
              ? `Dressing the back view in ${product.name}…`
              : `Dressing the front view in ${product.name}…`,
        });
        if (face === "front") setFrontUrl(url);
        else setBackUrl(url);
        setLookView(face === "back" ? "Back" : "Front");
        setResultUrl(url);
        wornFace.current = face;
        setPendingBack(null);
        setStep("result");
        setStatus("");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not add that view");
        setStep("result");
        setStatus("");
      }
    },
    [backUrl, frontUrl, product, requestAssumption, runTryOn],
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

  const youSrc = resultUrl ?? previewUrl;

  return (
    <div>
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl text-noir sm:text-3xl md:text-4xl">{product.name}</h1>
          <p className="mt-1 text-base tabular-nums text-stone sm:text-lg">${product.price}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {photoOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              disabled={step === "processing"}
              onClick={() => setPhotoChoice(option.id)}
              className={`fsh-tab px-3 py-2 text-[10px] font-medium sm:px-4 sm:text-xs disabled:opacity-40 ${
                photoChoice === option.id ? "bg-noir text-white" : "bg-mist text-noir"
              }`}
            >
              {option.label.replace(" · ", " ")}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="relative aspect-[3/4] overflow-hidden bg-[#eceae6]">
          {frontUrl || backUrl ? (
            <>
              {lookView === "Back" && !backUrl ? (
                <p className="absolute inset-0 flex items-center justify-center px-8 text-center text-sm leading-relaxed text-noir">
                  Your front fitting stays on Front. Add your back photo to see this piece from behind. A back is not created from the front photo.
                </p>
              ) : (
                <img
                  src={lookView === "Back" ? (backUrl ?? "") : (frontUrl ?? backUrl ?? "")}
                  alt="You in this piece"
                  className="absolute inset-0 h-full w-full object-contain"
                />
              )}
              <div className="absolute inset-x-0 bottom-3 z-10 flex justify-center gap-2">
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
              {step === "processing" && (
                <div className="fsh-overlay absolute inset-0 z-20 flex items-center justify-center bg-noir/80 px-6 transition-opacity duration-300">
                  <div className="w-full max-w-xs bg-white">
                    <FshLoaderOverlay compact title={status || "Working on your fitting…"} />
                  </div>
                </div>
              )}
            </>
          ) : (
            <label className="absolute inset-0 flex cursor-pointer items-center justify-center">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={step === "processing"}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void onFile(f);
                }}
              />
              {youSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={youSrc} alt="You" className="absolute inset-0 h-full w-full object-contain" />
              ) : (
                <span className="absolute inset-0 flex flex-col items-center justify-center px-8 pb-16 text-center">
                  <span className="font-display text-4xl text-noir">You</span>
                  <span className="mt-3 text-sm text-stone">
                    {pairedBack
                      ? "Back photo added. Tap to fit your front and back together."
                      : `Tap to add a ${photoOptions.find((o) => o.id === photoChoice)?.label.toLowerCase()} photo`}
                  </span>
                </span>
              )}
            </label>
          )}
          {!frontUrl && !backUrl && !youSrc && faceFor(photoChoice) === "front" && (
            <label className="absolute inset-x-4 bottom-4 z-10 cursor-pointer bg-white px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-noir">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={step === "processing"}
                onChange={(e) => {
                  const file = e.target.files?.[0] ?? null;
                  setPairedBack(file);
                  setBackChoice(file && !storeHasGarmentBack(product) ? "ask" : null);
                  e.target.value = "";
                }}
              />
              {pairedBack ? "Back photo ready" : "Add a back photo with it"}
            </label>
          )}
          {frontUrl || backUrl ? (
            <label className="absolute right-4 top-4 z-10 cursor-pointer bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-noir">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                disabled={step === "processing"}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onFile(file);
                  e.target.value = "";
                }}
              />
              Change photo
            </label>
          ) : (
            <span className="pointer-events-none absolute left-4 top-4 z-10 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-noir">
              You
            </span>
          )}
          {step === "processing" && !frontUrl && !backUrl && (
            <div className="fsh-overlay absolute inset-0 z-20 flex items-center justify-center bg-noir/80 px-6 transition-opacity duration-300">
              <div className="w-full max-w-xs bg-white">
                <FshLoaderOverlay
                  compact
                  title={status || "Working on your fitting…"}
                  detail={
                    layerName
                      ? `Keeping ${product.name} and adding ${layerName}.`
                      : "Your photo stays here while the clothes are placed."
                  }
                />
              </div>
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

      {garmentViewNotice(product) && (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">{garmentViewNotice(product)}</p>
      )}

      {backChoice === "ask" && (pairedBack || pendingBack) && (
        <div className="mt-4 max-w-xl border border-hairline bg-white p-4">
          <p className="text-sm leading-relaxed text-noir">
            This piece has no back photo from the store. Do you want an AI assumption of how the back might look? It will be labeled as an estimate, not a store photo.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="bg-noir px-4 py-2 text-[10px] font-medium text-white"
              onClick={() => {
                setBackChoice("yes");
                if (pendingBack) void onOtherSide(pendingBack, true);
              }}
            >
              Use an assumption
            </button>
            <button
              type="button"
              className="border border-noir px-4 py-2 text-[10px] font-medium text-noir"
              onClick={() => {
                setBackChoice("no");
                setPairedBack(null);
                setPendingBack(null);
              }}
            >
              No, keep the front only
            </button>
          </div>
        </div>
      )}

      {backIsEstimate && lookView === "Back" && backUrl && (
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-stone">
          This back is an AI assumption, not a store photo. Details that were not visible on the front cannot be verified.
        </p>
      )}

      {step === "processing" && (
        <p className="mt-4 text-sm text-noir" role="status">
          {status}
        </p>
      )}

      {error && <p className="mt-4 text-sm text-red-800">{error}</p>}

      {step === "result" && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <p className="text-xs leading-relaxed text-stone">
            The preview keeps your whole photo, face included. Preview only — not a fit guarantee.
          </p>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {(!frontUrl || !backUrl) && (
            <label className="cursor-pointer border border-noir px-3 py-2 text-[10px] font-medium text-noir sm:px-4 sm:text-xs">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void onOtherSide(file);
                  e.target.value = "";
                }}
              />
              {frontUrl ? "Add back photo" : "Add front photo"}
            </label>
          )}
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
        </div>
      )}

      {step === "result" && (
        <SkinToneSuggestionsPanel
          loading={skinLoading}
          error={skinError}
          guide={skinGuide}
        />
      )}

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
