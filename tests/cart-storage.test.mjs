import assert from "node:assert/strict";
import test from "node:test";
import { restoreCart, serializeCart } from "../app/cart-storage.ts";
import { applySecondProductDiscount } from "../app/cart-pricing.ts";

const catalog = [{ id: 1, color: "Brown", colors: [{ name: "Brown" }], price: 35, ecoLeather: true, images: ["/front.png"] }];

test("reload restores choices and recalculates discounts using current catalog prices", () => {
  const raw = serializeCart([{ ...catalog[0], price: 1, quantity: 2, discount: 100, image: "/front.png" }]);
  assert.equal(raw.includes("price"), false);
  assert.equal(raw.includes("discount"), false);
  const restored = restoreCart(raw, catalog);
  assert.equal(restored[0].quantity, 2);
  assert.equal(restored[0].image, "/front.png");
  assert.equal(restored[0].price, 35);
  assert.equal(applySecondProductDiscount(restored)[0].discount, 5.25);
});

test("malformed, obsolete and invalid saved choices are discarded", () => {
  for (const raw of [null, "{", "{}", "null", '[null]']) assert.deepEqual(restoreCart(raw, catalog), []);
  const invalid = [
    { id: 99, color: "Brown", quantity: 1 },
    { id: 1, color: "Obsolete", quantity: 1 },
    ...[0, -1, 1.5, 100, "2"].map((quantity) => ({ id: 1, color: "Brown", quantity })),
  ];
  assert.deepEqual(restoreCart(JSON.stringify(invalid), catalog), []);
  const [item] = restoreCart('[{"id":1,"color":"Brown","quantity":1,"price":0,"image":"https://external.test/x"}]', catalog);
  assert.equal(item.price, 35);
  assert.equal(item.image, "/front.png");
});

test("emptying a bag remains empty after reload and item order is retained", () => {
  assert.deepEqual(restoreCart(serializeCart([]), catalog), []);
  const choices = [1, 2, 3].map((quantity) => ({ id: 1, color: "Brown", quantity }));
  assert.deepEqual(restoreCart(serializeCart(choices), catalog).map((item) => item.quantity), [1, 2, 3]);
});
