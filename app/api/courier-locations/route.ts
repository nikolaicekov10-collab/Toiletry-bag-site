import locations from "../../data/courier-locations.json" with { type: "json" };

export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const courier = params.get("courier");
  if (!courier || !["econt", "speedy", "boxnow"].includes(courier)) {
    return Response.json({ error: "invalid_courier" }, { status: 400 });
  }
  const city = params.get("city");
  const matches = locations.filter((location) => location.carrier === courier);
  const result = city === null
    ? { cities: [...new Set(matches.map((location) => location.city))].sort((a, b) => a.localeCompare(b, "bg")) }
    : { locations: matches.filter((location) => location.city === city) };
  return Response.json(result, { headers: { "Cache-Control": "public, max-age=3600" } });
}
