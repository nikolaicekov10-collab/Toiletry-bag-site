export function imagePath(source: string | undefined): string | undefined {
  return source?.startsWith("/images/") && /\.(png|jpe?g)$/i.test(source)
    ? source.replace("/images/", "/images/optimized/").replace(/\.(png|jpe?g)$/i, ".webp")
    : source;
}
