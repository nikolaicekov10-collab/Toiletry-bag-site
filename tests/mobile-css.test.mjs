import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

test("built responsive CSS remains compatible with older iOS webviews", async () => {
  const directory = new URL("../dist/client/assets/", import.meta.url);
  const files = (await readdir(directory)).filter((name) => name.endsWith(".css"));
  const css = (await Promise.all(files.map((name) => readFile(new URL(name, directory), "utf8")))).join("\n");

  assert.doesNotMatch(css, /@media[^{}]*\([^)]*(?:width|height)\s*[<>]=?/);
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*700px\)/);
  assert.match(css, /\.desktop-nav\{display:none\}/);
  assert.match(css, /\.hero-image\{[^}]*aspect-ratio:16\/9/);
});
