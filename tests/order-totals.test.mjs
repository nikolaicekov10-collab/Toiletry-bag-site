import assert from "node:assert/strict";
import test from "node:test";
import { calculateOrderTotals } from "../app/cart-pricing.ts";
import { productPricing } from "../app/product-pricing.ts";

test("fixed delivery is added once after the product discount", () => {
  const quote = calculateOrderTotals([{ ...productPricing[1], quantity: 2 }]);
  assert.equal(quote.subtotal, 70);
  assert.equal(quote.discount, 5.25);
  assert.equal(quote.productsTotal, 64.75);
  assert.equal(quote.delivery, 3.50);
  assert.equal(quote.grandTotal, 68.25);
  assert.equal(calculateOrderTotals([{ ...productPricing[8], quantity: 1 }]).grandTotal, 6.50);
  assert.equal(calculateOrderTotals([{ ...productPricing[1], quantity: 1 }]).grandTotal, 38.50);
});

test("every catalog price and quantity from 1 to 99 produces exact cent totals", () => {
  for (const product of Object.values(productPricing)) {
    for (let quantity = 1; quantity <= 99; quantity++) {
      const quote = calculateOrderTotals([{ ...product, quantity }]);
      const subtotal = Math.round(product.price * 100) * quantity;
      const discount = quantity >= 2 && product.ecoLeather ? Math.round(Math.round(product.price * 100) * 0.15) : 0;
      assert.equal(quote.subtotal, subtotal / 100);
      assert.equal(quote.discount, discount / 100);
      assert.equal(quote.grandTotal, (subtotal - discount + 350) / 100);
    }
  }
});

test("every pair of catalog prices preserves the promotion rules and one delivery charge", () => {
  for (const first of Object.values(productPricing)) {
    for (const second of Object.values(productPricing)) {
      for (const quantity of [1, 2, 99]) {
        const quote = calculateOrderTotals([{ ...first, quantity }, { ...second, quantity: 1 }]);
        const subtotal = Math.round(first.price * 100) * quantity + Math.round(second.price * 100);
        const discountedPrice = first.ecoLeather ? (quantity > 1 ? first.price : second.ecoLeather ? second.price : 0) : 0;
        const discount = Math.round(Math.round(discountedPrice * 100) * 0.15);
        assert.equal(quote.grandTotal, (subtotal - discount + 350) / 100);
        assert.equal(quote.delivery, 3.50);
      }
    }
  }
});

test("unknown product prices do not invent a total; empty bags incur no delivery", () => {
  const unknown = calculateOrderTotals([{ price: null, quantity: 1 }]);
  assert.equal(unknown.subtotal, null);
  assert.equal(unknown.productsTotal, null);
  assert.equal(unknown.grandTotal, null);
  assert.equal(unknown.delivery, 3.50);
  const empty = calculateOrderTotals([]);
  assert.equal(empty.grandTotal, 0);
  assert.equal(empty.delivery, 0);
  const decimals = calculateOrderTotals([{ price: 19.99, quantity: 3, ecoLeather: true }]);
  assert.equal(decimals.grandTotal, 60.47);
});
