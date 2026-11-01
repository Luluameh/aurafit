import { spawn } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

export class PhotoValidationError extends Error {}

export function assertCustomerPhoto(type: string, size: number) {
  if (!ALLOWED.has(type)) {
    throw new PhotoValidationError("Use a JPEG, PNG, or WebP photo.");
  }
  if (size <= 0 || size > MAX_BYTES) {
    throw new PhotoValidationError("The photo must be 10MB or smaller.");
  }
}

export async function assertPhotoDimensions(input: Buffer) {
  const meta = await sharp(input, { failOn: "none" }).metadata();
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;
  const longSide = Math.max(width, height);
  if (longSide < 128 || width < 64 || height < 64) {
    throw new PhotoValidationError(
      "Use a larger photo. The long side needs to be at least 128 pixels so the face stays clear.",
    );
  }
}

function cutOutBackground(input: Buffer, mime: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const script = path.join(process.cwd(), "scripts", "remove-background.mjs");
    const child = spawn(process.execPath, [script, mime], {
      stdio: ["pipe", "pipe", "pipe"],
      windowsHide: true,
    });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Background removal timed out"));
    }, 120_000);

    child.stdout.on("data", (chunk: Buffer) => out.push(chunk));
    child.stderr.on("data", (chunk: Buffer) => err.push(chunk));
    child.on("error", (error) => {
      clearTimeout(timer);
      reject(error);
    });
    child.on("close", (code) => {
      clearTimeout(timer);
      const cutout = Buffer.concat(out);
      if (code !== 0 || cutout.length === 0) {
        const detail = Buffer.concat(err).toString().trim();
        reject(new Error(detail || `Background removal exited ${code}`));
        return;
      }
      resolve(cutout);
    });
    child.stdin.write(input);
    child.stdin.end();
  });
}

/**
 * Removes only the background from a copy of the photo.
 * The person stays in the same place and at the same size.
 * The cutout is placed on a plain backdrop because YouCam accepts an opaque JPEG.
 */
export async function removeCustomerBackground(input: Buffer): Promise<Buffer> {
  const meta = await sharp(input, { failOn: "none" }).metadata();
  const mime =
    meta.format === "png" ? "image/png" : meta.format === "webp" ? "image/webp" : "image/jpeg";
  const cutout = await cutOutBackground(input, mime);
  const size = await sharp(cutout).metadata();
  const width = size.width ?? 0;
  const height = size.height ?? 0;
  if (width < 64 || height < 64) {
    throw new Error("Background removal returned an unusable image");
  }

  const flattened = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: "#f6f5f2",
    },
  })
    .composite([{ input: cutout, blend: "over" }])
    .jpeg({ quality: 92 })
    .toBuffer();

  if (flattened.byteLength <= MAX_BYTES) return flattened;

  const smaller = await sharp(flattened).jpeg({ quality: 80 }).toBuffer();
  if (smaller.byteLength <= MAX_BYTES) return smaller;
  throw new Error("Processed photo is larger than 10MB");
}
