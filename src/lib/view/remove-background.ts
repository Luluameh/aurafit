export async function removePhotoBackground(
  source: Blob,
  onProgress?: (label: string) => void,
): Promise<Blob> {
  onProgress?.("Loading the background tool…");
  const { removeBackground } = await import("@imgly/background-removal");
  return withSingleThread(() =>
    removeBackground(source, {
      model: "isnet_fp16",
      device: "cpu",
      proxyToWorker: false,
      output: { format: "image/png", quality: 0.9 },
      progress: (key, _current, total) => {
        if (key.startsWith("fetch")) onProgress?.("Preparing the background tool…");
        else if (key === "compute" || total > 0) onProgress?.("Removing the background…");
      },
    }),
  );
}

async function withSingleThread<T>(run: () => Promise<T>): Promise<T> {
  const key = "hardwareConcurrency";
  const previous = Object.getOwnPropertyDescriptor(Navigator.prototype, key);
  try {
    Object.defineProperty(Navigator.prototype, key, {
      configurable: true,
      get: () => 1,
    });
  } catch {
    return run();
  }
  try {
    return await run();
  } finally {
    if (previous) Object.defineProperty(Navigator.prototype, key, previous);
  }
}
