type PromotionItem = {
  price: number | null;
  quantity: number;
  discountEligible?: boolean;
  ecoLeather?: boolean;
};

export const DELIVERY_FEE = 3.50;
export const deliveryChargeBG = `Фиксирана доставка: €${DELIVERY_FEE.toFixed(2)} за поръчка до адрес, офис или автомат. Добавя се след отстъпката и е включена в общата сума преди изпращане на заявката.`;
export const deliveryChargeEN = `Fixed delivery: €${DELIVERY_FEE.toFixed(2)} per order to an address, office or locker. It is added after the discount and included in the total before submitting the request.`;

export function calculateOrderTotals<T extends PromotionItem>(items: T[]) {
  const cart = applySecondProductDiscount(items);
  const known = cart.every((item) => item.price !== null);
  const subtotalCents = cart.reduce((sum, item) => sum + Math.round((item.price ?? 0) * 100) * item.quantity, 0);
  const discountCents = cart.reduce((sum, item) => sum + Math.round(item.discount * 100), 0);
  const productsCents = Math.max(0, subtotalCents - discountCents);
  const deliveryCents = cart.length ? Math.round(DELIVERY_FEE * 100) : 0;
  return {
    cart,
    subtotal: known ? subtotalCents / 100 : null,
    discount: discountCents / 100,
    productsTotal: known ? productsCents / 100 : null,
    delivery: deliveryCents / 100,
    grandTotal: known ? (productsCents + deliveryCents) / 100 : null,
  };
}

export function isPromotionEligible(item: Pick<PromotionItem, "price" | "discountEligible" | "ecoLeather">) {
  return item.ecoLeather === true && item.discountEligible !== false && item.price !== null && item.price > 0;
}

export function applySecondProductDiscount<T extends PromotionItem>(items: T[]): (T & { discount: number })[] {
  if (!items.length || !isPromotionEligible(items[0])) {
    return items.map(item => ({ ...item, discount: 0 }));
  }
  let eligibleUnits = 0;
  return items.map((item) => {
    let discount = 0;
    if (isPromotionEligible(item)) {
      if (eligibleUnits < 2 && eligibleUnits + item.quantity >= 2) {
        const priceCents = Math.round(item.price! * 100);
        discount = Math.round(priceCents * 0.15) / 100;
      }
      eligibleUnits += item.quantity;
    }
    return { ...item, discount };
  });
}
