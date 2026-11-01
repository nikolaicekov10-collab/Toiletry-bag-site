import { readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('public/images');
const manifest = {};
let count = 0;
async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const source = path.join(directory, entry.name);
    if (['optimized', 'responsive'].includes(entry.name) && directory === root) continue;
    if (entry.isDirectory()) { await visit(source); continue; }
    if (!/\.(png|jpe?g|webp)$/i.test(entry.name)) continue;
    const relative = path.relative(root, source).split(path.sep).join('/');
    // The imported archive contains an unused empty 11-01.webp placeholder.
    // Leave empty source files untouched; callers fall back when no dimensions exist.
    if ((await stat(source)).size === 0) { console.log(`Skipping empty source: ${relative}`); continue; }
    const metadata = await sharp(source).metadata();
    if (!metadata.width || !metadata.height) throw new Error(`Missing image dimensions: ${relative}`);
    const rotated = [5, 6, 7, 8].includes(metadata.orientation);
    const width = rotated ? metadata.height : metadata.width;
    const height = rotated ? metadata.width : metadata.height;
    const fullWidth = /\.webp$/i.test(relative) ? width : Math.min(width, 1800);
    manifest[`/images/${relative}`] = [fullWidth, Math.round(height * fullWidth / width)];
    for (const size of [160, 480, 960]) {
      if (size >= fullWidth) continue;
      const output = path.join(root, 'responsive', `${relative}.${size}.webp`);
      await mkdir(path.dirname(output), { recursive: true });
      await sharp(source).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: 82 }).toFile(output);
      count++;
    }
  }
}
await visit(root);
await writeFile('app/data/image-dimensions.json', `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ sources: Object.keys(manifest).length, generated: count }));
