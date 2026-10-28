type PromotionItem = {
  price: number | null;
  quantity: number;
  discountEligible?: boolean;
  ecoLeather?: boolean;
};

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
