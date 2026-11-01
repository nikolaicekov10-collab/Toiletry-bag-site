import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import test from "node:test";
import dimensions from "../app/data/image-dimensions.json" with { type: "json" };
import { imageProps } from "../app/image-path.ts";

test("responsive images have valid assets for every advertised size", async () => {
  for (const source of Object.keys(dimensions)) {
    const props = imageProps(source, "72px");
    assert.ok(props.width > 0 && props.height > 0);
    assert.equal(props.sizes, "72px");
    for (const candidate of props.srcSet.split(", ")) {
      const [file, width] = candidate.split(" ");
      assert.ok(Number.parseInt(width) <= props.width);
      const asset = await stat(new URL(`../public${file}`, import.meta.url));
      assert.ok(asset.size > 0, file);
    }
  }
});

test("unknown images keep their fallback instead of advertising nonexistent variants", () => {
  assert.deepEqual(imageProps(undefined, "100vw"), { src: undefined });
  assert.deepEqual(imageProps("/favicon.svg", "72px"), { src: "/favicon.svg" });
});
