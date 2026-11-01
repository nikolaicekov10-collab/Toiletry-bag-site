import { calculateOrderTotals } from "./cart-pricing";
import { productPricing } from "./product-pricing";

export function quoteOrder(selection: unknown) {
  if (!Array.isArray(selection) || !selection.length || selection.length > 100) return null;
  const items = [];
  for (const entry of selection) {
    if (!entry || !Number.isInteger(entry.id) || !Object.hasOwn(productPricing, entry.id) ||
      !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 99) return null;
    items.push({ id: entry.id as number, quantity: entry.quantity as number, ...productPricing[entry.id] });
  }
  // Client-supplied prices, discounts, totals and delivery fees are never used.
  return calculateOrderTotals(items);
}
