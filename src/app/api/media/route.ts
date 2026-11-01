import { NextResponse } from "next/server";

const ALLOWED_SUFFIXES = [
  "makeupar.com",
  "perfectcorp.com",
  "pexels.com",
  "amazonaws.com",
  "cloudfront.net",
];

function allowedImageUrl(raw: string): URL | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local")) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":")) return null;
  const ok = ALLOWED_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
  return ok ? url : null;
}

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("url");
  const target = raw ? allowedImageUrl(raw) : null;
  if (!target) {
    return NextResponse.json({ error: "Image host is not allowed" }, { status: 400 });
  }

  const upstream = await fetch(target, { cache: "no-store" });
  if (!upstream.ok) {
    return NextResponse.json({ error: "Could not load image" }, { status: 502 });
  }

  const type = upstream.headers.get("content-type") ?? "";
  if (!type.startsWith("image/")) {
    return NextResponse.json({ error: "Not an image" }, { status: 400 });
  }

  const bytes = await upstream.arrayBuffer();
  if (bytes.byteLength > 12_000_000) {
    return NextResponse.json({ error: "Image is too large" }, { status: 400 });
  }

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": type,
      "Cache-Control": "private, max-age=300",
    },
  });
}
