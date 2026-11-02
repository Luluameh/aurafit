# AuraFit — Virtual fitting room for fashion stores

Hackathon project for the **YouCam API Skin AI & eCommerce VTO Hackathon**.

AuraFit is a merchant-facing platform that lets small fashion stores add **virtual try-on** and **outfit guidance** with a single embed script. Shoppers upload a photo; the app calls **YouCam AI Clothes Virtual Try-On** (`cloth-v4`) server-side and shows styling picks from the store catalog.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS
- YouCam REST API (Bearer auth, file upload + async task polling)
- No generic “AI SaaS” UI — editorial typography and neutral palette

## Setup

1. Copy `.env.example` to `.env.local` and set:

   ```bash
   YOUCAM_API_KEY=your_key_from_api_console
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open:

   - [http://localhost:3000](http://localhost:3000) — product landing
   - [http://localhost:3000/dashboard](http://localhost:3000/dashboard) — embed snippet
   - [http://localhost:3000/stores/demo](http://localhost:3000/stores/demo) — demo storefront

## YouCam integration

| Step | Route / module |
|------|----------------|
| Upload shopper photo | `POST /api/youcam/upload` → `uploadClothImage` (add `?purpose=analysis` for skin tone file id) |
| Start try-on | `POST /api/youcam/try-on` → `createClothTryOnTask` |
| Poll try-on | `GET /api/youcam/task/[taskId]` |
| Skin tone after fitting | `POST /api/youcam/skin-tone` → `createSkinToneAnalysisTask`, poll `GET /api/youcam/skin-tone/[taskId]` |

API key never ships to the browser.

## Embed

Merchants paste the snippet from `/dashboard`. `public/embed.js` injects a button that opens `/widget` in a modal iframe.

## Demo video checklist

1. Merchant dashboard → copy embed
2. Demo store → product → upload photo → try-on result
3. Styling assistant recommendations
4. Name the API: **AI Clothes Virtual Try-On (YouCam API)**

## License

MIT (adjust for submission if needed).
