import assert from "node:assert/strict";
import test from "node:test";
import { GET } from "../app/api/courier-locations/route.ts";

function get(query) { return GET(new Request(`https://example.com/api/courier-locations?${query}`)); }

test("city lookup returns only city names, not the full office directory", async () => {
  for (const courier of ["econt", "speedy", "boxnow"]) {
    const response = get(`courier=${courier}`);
    assert.equal(response.status, 200);
    assert.match(response.headers.get("cache-control"), /max-age=3600/);
    const result = await response.json();
    assert.deepEqual(Object.keys(result), ["cities"]);
    assert.ok(result.cities.some((city) => city.toLocaleLowerCase("bg") === "софия"));
    assert.equal(new Set(result.cities).size, result.cities.length);
    assert.ok(JSON.stringify(result).length < 20000);
  }
});

test("office lookup returns only the selected courier and city", async () => {
  for (const courier of ["econt", "speedy", "boxnow"]) {
    const city = courier === "speedy" ? "СОФИЯ" : "София";
    const result = await get(`courier=${courier}&city=${encodeURIComponent(city)}`).json();
    assert.ok(result.locations.length > 0);
    assert.ok(result.locations.every((location) => location.carrier === courier && location.city === city));
    assert.ok(result.locations.every((location) => location.id && location.name && location.code));
  }
  assert.deepEqual(await get("courier=econt&city=unknown").json(), { locations: [] });
});

test("missing or invalid couriers are rejected without exposing the directory", async () => {
  for (const query of ["", "courier=unknown", "courier=ECONT"]) {
    const response = get(query);
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: "invalid_courier" });
  }
});
