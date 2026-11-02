export type PolicyBlock = {
  heading: string;
  paragraphs: string[];
};

export const POLICY_UPDATED = "2 November 2026";

export const termsPolicy: PolicyBlock[] = [
  {
    heading: "What AuraFit is",
    paragraphs: [
      "AuraFit is a virtual fitting room. A shop can place it on a product page so you can preview a piece on a photo you choose to upload.",
      "The preview is a picture, not a fitting appointment. It does not measure you, reserve stock, or complete a purchase.",
    ],
  },
  {
    heading: "The shop and your photo",
    paragraphs: [
      "The shop whose clothes you are viewing will not use your photo for any commercial purposes. That includes advertising, resale, lookbooks, and campaigns.",
      "Your photo is used only to build the fitting you asked for. An optional skin-tone reading can suggest colours and makeup. That reading is shown to you. It is not a dermatology result.",
    ],
  },
  {
    heading: "What the preview is not",
    paragraphs: [
      "Colour, drape, and size on screen can differ from the garment in person. Start with the size you usually wear.",
      "If a piece has no back photo from the shop, an AI assumption of the back is offered only after you ask for it. That image is an estimate, not a photograph of the garment.",
    ],
  },
  {
    heading: "Your part",
    paragraphs: [
      "Upload a photo only if you are the person in it, or you have their permission. Do not upload a photo of someone else to try clothes on them.",
      "The sample shop Atelier North is a demonstration catalog. Shipping, returns, and checkout, when a real shop uses AuraFit, belong to that shop.",
    ],
  },
];

export const privacyPolicy: PolicyBlock[] = [
  {
    heading: "Photos",
    paragraphs: [
      "When you add a photo, it is sent so the fitting can be made. The shop will not use that photo for any commercial purposes.",
      "The photo is processed to place the selected garment on you. A separate copy can be read for skin tone, lip, eye, brow, and hair colour so colour and makeup notes can be shown after a fitting.",
      "Background removal runs to keep the person and clear the backdrop. It does not replace your face.",
    ],
  },
  {
    heading: "Who handles the fitting",
    paragraphs: [
      "Try-on and skin-tone analysis are performed through YouCam’s API. Your photo is uploaded there for that task.",
      "AuraFit does not sell your photo, and the shop does not receive it as a marketing asset.",
    ],
  },
  {
    heading: "What stays in the browser",
    paragraphs: [
      "If you agree on entry, this browser remembers that choice so the notice is not repeated on every visit.",
      "If you agree before adding a photo, that choice lasts for the visit, so changing the photo does not ask again until you open the site in a new visit.",
    ],
  },
  {
    heading: "Catalog images",
    paragraphs: [
      "Garment photos on the sample shop are store images used to show the clothes. They are not pictures of shoppers.",
    ],
  },
];
