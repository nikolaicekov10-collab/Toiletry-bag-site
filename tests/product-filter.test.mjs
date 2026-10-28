import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { filterProducts } from "../app/product-filter.ts";

const source = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
const products = [...source.matchAll(/id: (\d+),\s*name: "([^"]+)",\s*(?:couplesName: "[^"]+",\s*)?category: "([^"]+)",\s*group: (\[[^\]]+\]|"[^"]+"),/g)]
  .map(([, id, name, category, group]) => ({ id: Number(id), name, category, group: JSON.parse(group) }));
assert.equal(products.length, 7, "test uses the complete current catalog");

for (const [group, subcategory, expected] of [
  ["Дамски аксесоари", "Чанти", [2, 7]],
  ["Дамски аксесоари", "Мини портмонета", [6]],
  ["Дамски аксесоари", "Чанти за китка", [5]],
  ["Мъжки аксесоари", "Чанти за китка", [5]],
  ["Дамски аксесоари", "Несесери", [1]],
  ["Мъжки аксесоари", "Несесери", [1]],
  ["Скрънчита", null, [8, 9]],
  ["Скрънчита", "Стандартни скрънчита", [8]],
  ["Скрънчита", "XL скрънчита", [9]],
  ["Дамски аксесоари", "Скрънчи", []],
  ["Дамски аксесоари", "Стандартни скрънчита", []],
  ["Дамски аксесоари", "XL скрънчита", []],
  ["Мъжки аксесоари", "Мини портмонета", []],
]) {
  test(`${group}: ${subcategory} shows only matching products`, () => {
    assert.deepEqual(filterProducts(products, group, subcategory).map((product) => product.id), expected);
  });
}

test("clearing the subcategory restores the complete selected collection", () => {
  assert.equal(filterProducts(products, "Всички").length, 7);
  assert.deepEqual(filterProducts(products, "Колекция Тя & Той").map((product) => product.id), []);
});
