export const CART_KEY = "nikkys-cart-v1";

type CatalogItem = {
  id: number;
  color: string;
  colors?: { name: string }[];
  images?: string[];
  variants?: { name: string; images: string[] }[];
  imagesByAudience?: Record<string, string[]>;
  variantsByAudience?: Record<string, { name: string; images: string[] }[]>;
};

// Store choices only. Prices, eligibility and product details always come from today's catalog.
export function serializeCart(items: { id: number; color: string; quantity: number; image?: string }[]) {
  return JSON.stringify(items.map(({ id, color, quantity, image }) => ({ id, color, quantity, image })));
}

export function restoreCart<T extends CatalogItem>(raw: string | null, catalog: T[]): (T & { quantity: number; image?: string })[] {
  try {
    const saved: unknown = JSON.parse(raw ?? "null");
    if (!Array.isArray(saved)) return [];
    return saved.slice(0, 100).flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const product = catalog.find((item) => item.id === entry.id);
      if (!product || !Number.isInteger(entry.quantity) || entry.quantity < 1 || entry.quantity > 99) return [];
      const colors = product.colors?.length ? product.colors.map((option) => option.name) : [product.color];
      if (!colors.includes(entry.color)) return [];
      const variants = [...(product.variants ?? []), ...Object.values(product.variantsByAudience ?? {}).flat()];
      const colourImages = variants.filter((variant) => variant.name === entry.color).flatMap((variant) => variant.images);
      // A catalog's default gallery can show a different colour. Only use it
      // when no colour-specific gallery exists for this saved choice.
      const images = colourImages.length ? colourImages : [
        ...(product.images ?? []), ...Object.values(product.imagesByAudience ?? {}).flat(),
      ];
      const image = typeof entry.image === "string" && images.includes(entry.image) ? entry.image : images[0];
      return [{ ...product, color: entry.color, quantity: entry.quantity, image }];
    });
  } catch { return []; }
}
