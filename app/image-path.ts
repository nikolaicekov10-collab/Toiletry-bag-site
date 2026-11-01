import dimensions from "./data/image-dimensions.json" with { type: "json" };

export function imagePath(source: string | undefined): string | undefined {
  return source?.startsWith("/images/") && /\.(png|jpe?g)$/i.test(source)
    ? source.replace("/images/", "/images/optimized/").replace(/\.(png|jpe?g)$/i, ".webp")
    : source;
}

export function imageProps(source: string | undefined, sizes: string) {
  const size = source ? (dimensions as Record<string, number[]>)[source] : undefined;
  if (!source || !size) return { src: imagePath(source) };
  const [width, height] = size;
  const variants = [160, 480, 960].filter((candidate) => candidate < width)
    .map((candidate) => `${source.replace("/images/", "/images/responsive/")}.${candidate}.webp ${candidate}w`);
  variants.push(`${imagePath(source)} ${width}w`);
  return { src: imagePath(source), srcSet: variants.join(", "), sizes, width, height };
}
