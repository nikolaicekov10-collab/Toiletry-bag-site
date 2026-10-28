import assert from "node:assert/strict";
import test from "node:test";
import { applySecondProductDiscount } from "../app/cart-pricing.ts";

const toiletry = { id: 1, price: 35, quantity: 1, ecoLeather: true };
const scrunchie = { id: 8, price: 3, quantity: 1, discountEligible: false };
const bag = { id: 7, price: 50, quantity: 1, ecoLeather: true };
const discounts = (items) => applySecondProductDiscount(items).map(item => item.discount);

test("a scrunchie cannot qualify another product for the promotion in either order", () => {
  assert.deepEqual(discounts([scrunchie, toiletry]), [0, 0]);
  assert.deepEqual(discounts([toiletry, scrunchie]), [0, 0]);
  assert.deepEqual(discounts([{ ...scrunchie, quantity: 10 }, bag]), [0, 0]);
});

test("toiletry bag, scrunchie and bag discount only the bag", () => {
  const cart = applySecondProductDiscount([toiletry, scrunchie, bag]);
  assert.deepEqual(cart.map(item => item.discount), [0, 0, 7.5]);
  assert.equal(cart.reduce((sum, item) => sum + item.price * item.quantity - item.discount, 0), 80.5);
  assert.deepEqual(discounts([scrunchie, toiletry, bag]), [0, 0, 0]);
});

test("removing the first eligible product removes the discount; removing a scrunchie preserves it", () => {
  const cart = applySecondProductDiscount([toiletry, scrunchie, bag]);
  assert.deepEqual(discounts(cart.filter(item => item.id !== 1)), [0, 0]);
  assert.deepEqual(discounts(cart.filter(item => item.id !== 8)), [0, 7.5]);
});

test("only one eligible unit receives 15%, including quantity greater than one", () => {
  assert.deepEqual(discounts([{ ...toiletry, quantity: 3 }, bag]), [5.25, 0]);
  assert.deepEqual(discounts([toiletry, { ...bag, quantity: 3 }]), [0, 7.5]);
  assert.deepEqual(discounts([toiletry, bag, { ...toiletry, price: 19 }]), [0, 7.5, 0]);
});

test("unknown collection prices do not qualify and discounts round to cents", () => {
  assert.deepEqual(discounts([{ ...toiletry, price: null }, bag]), [0, 0]);
  assert.deepEqual(discounts([bag, { ...toiletry, price: 19 }]), [0, 2.85]);
});


test("a first item that is not eco leather blocks the promotion even with two later leather items", () => {
  assert.deepEqual(discounts([{ price: 10, quantity: 1 }, toiletry, bag]), [0, 0, 0]);
  assert.deepEqual(discounts([scrunchie, toiletry, bag]), [0, 0, 0]);
});

test("removing the opening leather item disables the promotion if a scrunchie becomes first", () => {
  const cart = applySecondProductDiscount([toiletry, scrunchie, bag, { ...toiletry, id: 2 }]);
  assert.deepEqual(discounts(cart.filter(item => item.id !== 1)), [0, 0, 0]);
});
