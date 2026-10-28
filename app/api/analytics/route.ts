import { env } from "cloudflare:workers";
import { CONSENT_VERSION } from "../../consent";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { visitorId?: string; consent?: boolean; consentVersion?: string };
    if (body.consent !== true || body.consentVersion !== CONSENT_VERSION) {
      return Response.json({ ok: false }, { status: 403 });
    }
    const visitorId = typeof body.visitorId === "string" ? body.visitorId.slice(0, 100) : "";
    if (!visitorId) return Response.json({ ok: false }, { status: 400 });

    const day = new Date().toISOString().slice(0, 10);
    const cutoff = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    await env.DB.prepare("DELETE FROM daily_visitors WHERE day < ?").bind(cutoff).run();
    await env.DB.prepare(
      "INSERT INTO daily_traffic (day, views, unique_visitors, enquiries, orders) VALUES (?, 1, 0, 0, 0) ON CONFLICT(day) DO UPDATE SET views = views + 1",
    ).bind(day).run();

    const inserted = await env.DB.prepare(
      "INSERT OR IGNORE INTO daily_visitors (day, visitor_id) VALUES (?, ?)",
    ).bind(day, visitorId).run();

    if (inserted.meta.changes > 0) {
      await env.DB.prepare(
        "UPDATE daily_traffic SET unique_visitors = unique_visitors + 1 WHERE day = ?",
      ).bind(day).run();
    }

    return Response.json({ ok: true });
  } catch (error) {
    console.error("analytics", error);
    return Response.json({ ok: false }, { status: 503 });
  }
}
