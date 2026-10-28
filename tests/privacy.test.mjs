import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";
import { CONSENT_VERSION, CONSENT_LIFETIME, readChoice } from "../app/consent.ts";

const writes = [];
const database = {
  prepare(sql) {
    return { bind(...values) { return { run: async () => { writes.push({ sql, values }); return { meta: { changes: 1 } }; } }; } };
  },
  async batch(statements) { for (const statement of statements) await statement.run(); },
};
globalThis.__privacyTestEnv = { DB: database };
registerHooks({ resolve(specifier, context, next) {
  if (specifier === "cloudflare:workers") return { url: "data:text/javascript,export const env=globalThis.__privacyTestEnv", shortCircuit: true };
  return next(specifier, context);
} });
const { default: worker } = await import("../dist/server/index.js");
const context = { waitUntil() {}, passThroughOnException() {} };
const bindings = { ...globalThis.__privacyTestEnv, ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } };
function post(path, body) {
  return worker.fetch(new Request(`https://example.com${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }), bindings, context);
}

test("consent is off for missing, malformed, expired or obsolete choices", () => {
  const now = Date.now();
  for (const raw of [null, "invalid", JSON.stringify({ version: "old", analytics: true, updatedAt: now }), JSON.stringify({ version: CONSENT_VERSION, analytics: true, updatedAt: now - CONSENT_LIFETIME }), JSON.stringify({ version: CONSENT_VERSION, analytics: "yes", updatedAt: now })]) assert.equal(readChoice(raw, now), null);
  assert.equal(readChoice(JSON.stringify({ version: CONSENT_VERSION, analytics: false, updatedAt: now }), now)?.analytics, false);
});

test("analytics refuses requests without current explicit permission before database access", async () => {
  writes.length = 0;
  for (const body of [{ visitorId: "test" }, { visitorId: "test", consent: false, consentVersion: CONSENT_VERSION }, { visitorId: "test", consent: true, consentVersion: "old" }]) assert.equal((await post("/api/analytics", body)).status, 403);
  assert.equal(writes.length, 0);
});

test("analytics accepts opt-in and cleans only expired visitor records", async () => {
  writes.length = 0;
  assert.equal((await post("/api/analytics", { visitorId: "test-visitor", consent: true, consentVersion: CONSENT_VERSION })).status, 200);
  assert.ok(writes.some(({ sql }) => sql === "DELETE FROM daily_visitors WHERE day < ?"));
  assert.ok(writes.some(({ sql }) => sql.includes("INSERT OR IGNORE INTO daily_visitors")));
});

test("an order requires affirmative acceptance even when bypassing the form", async () => {
  writes.length = 0;
  assert.equal((await post("/api/contact", { kind: "order", firstName: "Test", email: "test@example.com", phone: "0890000000" })).status, 400);
  assert.equal(writes.length, 0);
});

test("terms acceptance is recorded, while enquiries require no blanket GDPR consent", async () => {
  writes.length = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => Response.json({ success: true });
  try {
    assert.equal((await post("/api/contact", { kind: "order", firstName: "Test", email: "test@example.com", phone: "0890000000", termsAccepted: "on", language: "en" })).status, 200);
    assert.ok(writes.some(({ sql, values }) => sql.includes("INSERT INTO messages") && values.some((value) => typeof value === "string" && value.includes("изрично приети"))));
    assert.equal((await post("/api/contact", { kind: "enquiry", name: "Test", email: "test@example.com", message: "Question" })).status, 200);
    assert.equal((await post("/api/contact", { kind: "quick-order", firstName: "Test", phone: "0890000000" })).status, 200);
  } finally { globalThis.fetch = originalFetch; }
});

test("all legal pages render and unknown policies return 404", async () => {
  for (const slug of ["delivery", "returns", "terms", "privacy", "cookies"]) {
    const response = await worker.fetch(new Request(`https://example.com/policies/${slug}`), bindings, context);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /nikkyshandmade@gmail.com/);
    assert.match(html, /Nikky’S Handmade/);
    assert.match(html, /Адрес и регистрационни данни не са предоставени/);
    assert.doesNotMatch(html, /За потвърждение преди публикуване|\[Before publication|\[Confirm before publication/);
    assert.match(html, /legal-toc/);
  }
  assert.equal((await worker.fetch(new Request("https://example.com/policies/unknown"), bindings, context)).status, 404);
});
