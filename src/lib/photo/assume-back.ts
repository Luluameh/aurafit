const PHOTTA = "https://api.photta.app/api/v1/ghost-mannequin";

type PhottaData = {
  id?: string;
  status?: string;
  output_url?: string;
  error_message?: string;
};

/**
 * Asks Photta for a back angle of the store's front product photo.
 * The result is an estimate. It is never saved as the store's back photo.
 * https://api-docs.photta.app/ghost-mannequin/generate
 */
export async function assumeGarmentBack(imageUrl: string): Promise<string> {
  const key = process.env.PHOTTA_API_KEY;
  if (!key) {
    throw new Error(
      "An AI back assumption is not configured. Add PHOTTA_API_KEY on the server.",
    );
  }
  if (!imageUrl.startsWith("https://")) {
    throw new Error("The product photo must be a public https image.");
  }

  const created = await fetch(PHOTTA, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_image: imageUrl,
      image_side: "front",
      angle: "back",
      style: "3d",
      background_color: "beige",
      resolution: "2K",
      aspect_ratio: "3:4",
      user_instruction:
        "Show the back of this same garment. Keep the color, pattern, neckline, sleeves, and cut. Do not design a different piece.",
    }),
    cache: "no-store",
  });
  const createdJson = (await created.json()) as { data?: PhottaData; error?: { message?: string } };
  if (!created.ok || !createdJson.data?.id) {
    throw new Error(createdJson.error?.message ?? "Could not start an AI back assumption");
  }

  for (let attempt = 0; attempt < 60; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 3000));
    const polled = await fetch(`${PHOTTA}/${encodeURIComponent(createdJson.data.id)}`, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    });
    const polledJson = (await polled.json()) as { data?: PhottaData };
    const status = polledJson.data?.status;
    if (status === "completed" && polledJson.data?.output_url) return polledJson.data.output_url;
    if (status === "failed") {
      throw new Error(polledJson.data?.error_message ?? "The AI back assumption failed");
    }
  }
  throw new Error("The AI back assumption timed out");
}
