// Shared by the displayed catalog and server-side order calculation.
export const productPricing: Record<number, { price: number | null; ecoLeather?: boolean; discountEligible?: boolean }> = {
  1: { price: 35, ecoLeather: true },
  2: { price: 35, ecoLeather: true },
  5: { price: 40, ecoLeather: true },
  6: { price: 19, ecoLeather: true },
  7: { price: 50, ecoLeather: true },
  8: { price: 3, discountEligible: false },
  9: { price: 6, discountEligible: false },
};
