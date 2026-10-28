import { env } from "cloudflare:workers";
import courierLocationsData from "../../data/courier-locations.json";
import { LEGAL_VERSION } from "../../legal-config";

export const dynamic = "force-dynamic";

const DESTINATION = "nikkyshandmade@gmail.com";
type Courier = "econt" | "speedy" | "boxnow";
type CourierLocation = { id: string; carrier: Courier; kind: string; city: string; postCode: string; name: string; address: string; code: string };
const courierLocations = courierLocationsData as CourierLocation[];
const courierNames: Record<Courier, string> = { econt: "Еконт", speedy: "Спиди", boxnow: "BOX NOW" };

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    if (body.website) return Response.json({ ok: true });

    const kind = body.kind === "quick-order" ? "quick-order" : body.kind === "order" ? "order" : "enquiry";
    if (kind === "order" && body.termsAccepted !== "on") {
      return Response.json({ ok: false, error: "terms_required" }, { status: 400 });
    }
    const isOrder = kind === "order" || kind === "quick-order";
    const firstName = clean(body.firstName, 60);
    const name = isOrder ? firstName : clean(body.name, 120);
    const email = clean(body.email, 180);
    const phone = clean(body.phone, 60);
    const message = clean(body.message, 3000);
    const product = clean(body.product, 500);
    const city = clean(body.city, 120);
    const district = clean(body.district, 120);
    const street = clean(body.street, 160);
    const block = clean(body.block, 60);
    const streetNumber = clean(body.streetNumber, 30);
    const entrance = clean(body.entrance, 30);
    const floor = clean(body.floor, 30);
    const apartment = clean(body.apartment, 30);
    const deliveryMethod = clean(body.deliveryMethod, 20) === "courier" ? "courier" : "address";
    const courier = clean(body.courier, 20) as Courier;
    const courierCity = clean(body.courierCity, 120);
    const courierLocationId = clean(body.courierLocation, 80);
    const selectedCourierLocation = deliveryMethod === "courier"
      ? courierLocations.find((location) => location.id === courierLocationId && location.carrier === courier && location.city === courierCity)
      : undefined;
    const hasValidEmail = Boolean(email && email.includes("@"));
    if (!name ||
      (kind === "enquiry" && (!hasValidEmail || !message)) ||
      (kind === "order" && (!hasValidEmail || !phone || (deliveryMethod === "courier" && !selectedCourierLocation))) ||
      (kind === "quick-order" && !phone)) {
      return Response.json({ ok: false, error: "invalid" }, { status: 400 });
    }
    const deliveryAddress = kind === "order" && deliveryMethod === "address"
      ? [`Начин: До адрес`, `Град: ${city || "—"}`, `Квартал: ${district || "—"}`, `Улица: ${street || "—"}`, `Блок: ${block || "—"}`, `Номер: ${streetNumber || "—"}`, `Вход: ${entrance || "—"}`, `Етаж: ${floor || "—"}`, `Апартамент: ${apartment || "—"}`].join("\n")
      : kind === "order" && selectedCourierLocation
        ? [`Начин: До офис`, `Куриер: ${courierNames[courier]}`, `Град: ${selectedCourierLocation.city}`, `Пощенски код: ${selectedCourierLocation.postCode || "—"}`, `Офис/автомат: ${selectedCourierLocation.name}`, `Код: ${selectedCourierLocation.code}`, `Адрес: ${selectedCourierLocation.address}`].join("\n")
      : "";
    const quickOrderMessage = "Ние ще се свържем с Вас.";
    const customerMessage = kind === "quick-order"
      ? quickOrderMessage
      : deliveryAddress
        ? `${message ? `${message}\n\n` : ""}Адрес за доставка:\n${deliveryAddress}`
        : message;

    const now = new Date();
    const legalRecord = `Правна информация: ${LEGAL_VERSION}; език: ${body.language === "en" ? "en" : "bg"}; дата: ${now.toISOString()}; Общи условия: ${kind === "order" ? "изрично приети" : "не се изисква приемане за запитване/обратно обаждане"}. Не е съгласие за маркетинг.`;
    const storedMessage = `${customerMessage}\n\n${legalRecord}`;
    const day = now.toISOString().slice(0, 10);
    await env.DB.batch([
      env.DB.prepare(
        "INSERT INTO messages (kind, name, email, phone, message, product, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ).bind(kind, name, email, phone || null, storedMessage, product || null, now.toISOString()),
      env.DB.prepare(
        `INSERT INTO daily_traffic (day, views, unique_visitors, enquiries, orders)
         VALUES (?, 0, 0, ?, ?)
         ON CONFLICT(day) DO UPDATE SET
           enquiries = enquiries + excluded.enquiries,
           orders = orders + excluded.orders`,
      ).bind(day, kind === "enquiry" ? 1 : 0, isOrder ? 1 : 0),
    ]);

    const subject = kind === "quick-order"
      ? "Нова бърза поръчка от сайта Nikky’S"
      : kind === "order"
        ? "Нова поръчка от сайта Nikky’S"
        : "Ново запитване от сайта Nikky’S";
    const form = new FormData();
    form.set("_subject", subject);
    form.set("_template", "table");
    form.set("_captcha", "false");
    form.set("Име", name);
    form.set("Имейл", email || "Не е посочен — бърза поръчка");
    form.set("Телефон", phone || "Не е посочен");
    form.set("Продукт", product || "Общо запитване");
    form.set("Правна информация", legalRecord);
    form.set(
      kind === "order" ? "Допълнителна информация" : "Съобщение",
      kind === "quick-order" ? quickOrderMessage : message || "Не е посочена",
    );
    if (deliveryAddress) {
      form.set("Доставка", deliveryAddress);
    }

    const delivery = await fetch(`https://formsubmit.co/ajax/${DESTINATION}`, {
      method: "POST",
      headers: { Accept: "application/json" },
      body: form,
    });
    if (!delivery.ok) throw new Error(`Email delivery failed: ${delivery.status}`);

    return Response.json({ ok: true });
  } catch (error) {
    console.error("contact", error);
    return Response.json({ ok: false, error: "unavailable" }, { status: 503 });
  }
}
