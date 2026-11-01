import type { PhotoGuide } from "./products";

export type PhotoOption = {
  id: PhotoGuide;
  label: string;
  detail: string;
};

export function getPhotoOptions(guide: PhotoGuide): PhotoOption[] {
  const all: PhotoOption[] = [
    {
      id: "front-full",
      label: "Front · full body",
      detail: "Face fully in the frame, head to toe, standing and facing the camera.",
    },
    {
      id: "back-full",
      label: "Back · full body",
      detail: "Turn away from camera so dress, coat, or train drape is visible.",
    },
    {
      id: "front-half",
      label: "Front · waist up",
      detail: "Chest-up or waist-up, even lighting, plain background.",
    },
  ];

  if (guide === "back-full") {
    return all.filter((o) => o.id === "back-full" || o.id === "front-full");
  }
  if (guide === "front-half") {
    return all.filter((o) => o.id === "front-half" || o.id === "front-full");
  }
  return all.filter((o) => o.id === "front-full" || o.id === "back-full");
}

export function defaultPhotoChoice(guide: PhotoGuide): PhotoGuide {
  return guide;
}
