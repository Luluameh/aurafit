import { removeBackground } from "@imgly/background-removal-node";

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const input = Buffer.concat(chunks);
const mime = process.argv[2] || "image/jpeg";
const source = new Blob([input], { type: mime });
const result = await removeBackground(source, {
  model: "medium",
  output: { format: "image/png", quality: 1 },
});
process.stdout.write(Buffer.from(await result.arrayBuffer()));
