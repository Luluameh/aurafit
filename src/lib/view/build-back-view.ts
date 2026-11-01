function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not read the cutout"));
    image.src = src;
  });
}

function bounds(data: Uint8ClampedArray, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = 0;
  let maxY = 0;
  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      if (data[(y * width + x) * 4 + 3] < 24) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX <= minX || maxY <= minY) return null;
  return { minX, minY, maxX, maxY };
}

function canvasUrl(canvas: HTMLCanvasElement) {
  return new Promise<string>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Could not save the back view"));
      else resolve(URL.createObjectURL(blob));
    }, "image/png");
  });
}

/** Back and side of the outfit, drawn from the cloth pixels already in the photo. */
export async function buildBackFromAttire(cutoutUrl: string): Promise<{
  url: string;
  sideUrl: string;
  sideColor: string;
}> {
  const image = await loadImage(cutoutUrl);
  const scale = Math.min(1, 900 / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const source = document.createElement("canvas");
  source.width = width;
  source.height = height;
  const sourceCtx = source.getContext("2d", { willReadFrequently: true });
  if (!sourceCtx) throw new Error("Could not draw the outfit");
  sourceCtx.drawImage(image, 0, 0, width, height);
  const frame = sourceCtx.getImageData(0, 0, width, height);
  const box = bounds(frame.data, width, height);
  if (!box) throw new Error("No person found in the photo");

  const back = document.createElement("canvas");
  back.width = width;
  back.height = height;
  const ctx = back.getContext("2d");
  if (!ctx) throw new Error("Could not draw the back");
  const pixels = ctx.createImageData(width, height);
  const bodyTop = box.minY + (box.maxY - box.minY) * 0.2;
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const mirrored = width - 1 - x;
      const index = (y * width + mirrored) * 4;
      const alpha = frame.data[index + 3];
      if (alpha < 24 || y < bodyTop) continue;
      const out = (y * width + x) * 4;
      pixels.data[out] = frame.data[index];
      pixels.data[out + 1] = frame.data[index + 1];
      pixels.data[out + 2] = frame.data[index + 2];
      pixels.data[out + 3] = alpha;
      red += frame.data[index];
      green += frame.data[index + 1];
      blue += frame.data[index + 2];
      count += 1;
    }
  }

  const hair = sampleHair(frame.data, width, box);
  for (let y = box.minY; y < bodyTop; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const front = (y * width + (width - 1 - x)) * 4;
      if (frame.data[front + 3] < 24) continue;
      const out = (y * width + x) * 4;
      pixels.data[out] = hair[0];
      pixels.data[out + 1] = hair[1];
      pixels.data[out + 2] = hair[2];
      pixels.data[out + 3] = 255;
    }
  }

  ctx.putImageData(pixels, 0, 0);
  const seamX = (box.minX + box.maxX) / 2;
  ctx.strokeStyle = "rgba(0,0,0,0.28)";
  ctx.lineWidth = Math.max(2, width * 0.008);
  ctx.beginPath();
  ctx.moveTo(seamX, bodyTop);
  ctx.lineTo(seamX, box.maxY);
  ctx.stroke();

  const side = document.createElement("canvas");
  side.width = 32;
  side.height = height;
  const sideCtx = side.getContext("2d");
  if (!sideCtx) throw new Error("Could not draw the side");
  const sidePixels = sideCtx.createImageData(32, height);
  for (let y = 0; y < height; y++) {
    let edge = -1;
    for (let x = 0; x < width; x++) {
      if (frame.data[(y * width + x) * 4 + 3] >= 24) {
        edge = x;
        break;
      }
    }
    if (edge < 0) continue;
    const sample = (y * width + Math.min(width - 1, edge + 8)) * 4;
    for (let x = 0; x < 32; x++) {
      const out = (y * 32 + x) * 4;
      sidePixels.data[out] = frame.data[sample];
      sidePixels.data[out + 1] = frame.data[sample + 1];
      sidePixels.data[out + 2] = frame.data[sample + 2];
      sidePixels.data[out + 3] = 255;
    }
  }
  sideCtx.putImageData(sidePixels, 0, 0);

  const sideColor =
    count > 0
      ? `rgb(${Math.round(red / count)}, ${Math.round(green / count)}, ${Math.round(blue / count)})`
      : "#1c1416";

  const [url, sideUrl] = await Promise.all([canvasUrl(back), canvasUrl(side)]);
  return { url, sideUrl, sideColor };
}

function sampleHair(
  data: Uint8ClampedArray,
  width: number,
  box: { minX: number; minY: number; maxX: number; maxY: number },
) {
  const y = box.minY + Math.round((box.maxY - box.minY) * 0.04);
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;
  for (let x = box.minX; x <= box.maxX; x += 2) {
    const index = (y * width + x) * 4;
    if (data[index + 3] < 24) continue;
    red += data[index];
    green += data[index + 1];
    blue += data[index + 2];
    count += 1;
  }
  if (!count) return [40, 32, 28];
  return [Math.round(red / count), Math.round(green / count), Math.round(blue / count)];
}
