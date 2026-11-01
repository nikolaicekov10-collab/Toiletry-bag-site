import assert from "node:assert/strict";
import test from "node:test";
import { registerHooks } from "node:module";

// This worker imports Cloudflare bindings. Node's test runner needs the same
// explicit platform boundary as the privacy tests; no live services are used.
registerHooks({ resolve(specifier, context, next) {
  if (specifier === "cloudflare:workers") return { url: "data:text/javascript,export const env={}", shortCircuit: true };
  return next(specifier, context);
} });

test("renders the Bulgarian storefront and its metadata", async () => {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  const response = await worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );

  assert.equal(response.status, 200);
  assert.match(
    response.headers.get("content-type") ?? "",
    /^text\/html\b/i,
  );
  const html = await response.text();
  assert.match(html, /<html lang="bg"/);
  assert.match(html, /<title>Nikky’S — Ръчно изработени аксесоари<\/title>/);
  assert.match(html, /name="description"/);
  assert.match(html, /Разгледай колекцията/);
});
