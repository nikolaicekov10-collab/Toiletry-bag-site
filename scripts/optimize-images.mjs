import { readdir, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

// Keep original photographs; generate delivery copies without changing their content.
const root = path.resolve("public/images");
const outputRoot = path.join(root, "optimized");
let originalBytes = 0;
let optimizedBytes = 0;
let count = 0;
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (source === outputRoot) continue;
    if (entry.isDirectory()) { await visit(source); continue; }
    if (!/\.(png|jpe?g)$/i.test(entry.name)) continue;
    const target = path.join(outputRoot, path.relative(root, source).replace(/\.(png|jpe?g)$/i, ".webp"));
    await mkdir(path.dirname(target), { recursive: true });
    await sharp(source).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 82 }).toFile(target);
    originalBytes += (await stat(source)).size;
    optimizedBytes += (await stat(target)).size;
    count++;
  }
}
await visit(root);
console.log(JSON.stringify({ count, originalBytes, optimizedBytes }));
