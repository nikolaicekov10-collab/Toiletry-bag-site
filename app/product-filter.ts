type CategorizedProduct = { name: string; category: string; group: string | string[] };

const keywords: Record<string, string> = {
  "Чанти": "чанта",
  "Мини портмонета": "портмоне",
  "Несесери": "несесер",
};

export function filterProducts<T extends CategorizedProduct>(
  products: T[], group: string, subcategory: string | null = null,
): T[] {
  return products.filter((product) => {
    const belongsToGroup = group === "Всички" ||
      (Array.isArray(product.group) ? product.group.includes(group) : product.group === group);
    if (!belongsToGroup) return false;
    if (!subcategory) return true;
    const keyword = keywords[subcategory];
    if (keyword && !product.name.toLocaleLowerCase("bg").includes(keyword)) return false;
    return product.category === subcategory;
  });
}
