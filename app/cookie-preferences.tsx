"use client";

import { useEffect, useRef, useState } from "react";
import { CONSENT_KEY, CONSENT_VERSION, VISITOR_KEY, VISITOR_EXPIRY_KEY, readChoice, type CookieChoice } from "./consent";

export function CookiePreferences() {
  const [language, setLanguage] = useState("bg");
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [choice, setChoice] = useState<CookieChoice | null>(null);
  const [storageError, setStorageError] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const sent = useRef(false);
  const bg = language !== "en";

  useEffect(() => {
    const syncLanguage = () => setLanguage(document.documentElement.lang);
    syncLanguage();
    const observer = new MutationObserver(syncLanguage);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
    const saved = (() => { try { return readChoice(localStorage.getItem(CONSENT_KEY)); } catch { return null; } })();
    setChoice(saved); setAnalytics(saved?.analytics ?? false); setOpen(!saved);
    if (!saved?.analytics) { try { localStorage.removeItem(VISITOR_KEY); localStorage.removeItem(VISITOR_EXPIRY_KEY); } catch {} }
    const reopen = () => {
      returnFocus.current = document.activeElement as HTMLElement;
      setOpen(true); setDetails(true);
    };
    window.addEventListener("nikkys-cookie-settings", reopen);
    return () => { observer.disconnect(); window.removeEventListener("nikkys-cookie-settings", reopen); };
  }, []);

  useEffect(() => {
    if (!choice?.analytics || sent.current) return;
    const controller = new AbortController();
    let visitorId: string;
    try {
      visitorId = localStorage.getItem(VISITOR_KEY) ?? "";
      const expires = Number(localStorage.getItem(VISITOR_EXPIRY_KEY));
      if (!visitorId || expires <= Date.now()) {
        visitorId = crypto.randomUUID();
        localStorage.setItem(VISITOR_KEY, visitorId);
        localStorage.setItem(VISITOR_EXPIRY_KEY, String(Date.now() + 30 * 86400000));
      }
    } catch { return; }
    sent.current = true;
    fetch("/api/analytics", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: controller.signal,
      body: JSON.stringify({ visitorId, consent: true, consentVersion: CONSENT_VERSION }),
    }).catch(() => undefined);
    return () => controller.abort();
  }, [choice]);

  useEffect(() => {
    if (open) panel.current?.focus({ preventScroll: true });
  }, [open, details]);

  function save(allow: boolean) {
    const next = { version: CONSENT_VERSION, analytics: allow, updatedAt: Date.now() };
    try {
      localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
      if (!allow) { localStorage.removeItem(VISITOR_KEY); localStorage.removeItem(VISITOR_EXPIRY_KEY); }
      setStorageError(false);
    } catch { setStorageError(true); }
    setChoice(next); setAnalytics(allow); setOpen(false); setDetails(false);
    returnFocus.current?.focus();
  }

  if (!open) return storageError ? <p className="cookie-storage-note" role="status">{bg ? "Изборът важи за това посещение. Браузърът не позволява запазване." : "Your choice applies to this visit. Browser storage is unavailable."}</p> : null;
  return <section className="cookie-panel" role="dialog" aria-modal="false" aria-labelledby="cookie-heading" tabIndex={-1} ref={panel}
    onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); save(choice?.analytics ?? false); } }}>
    <h2 id="cookie-heading">{bg ? "Този сайт използва бисквитки" : "This website uses cookies"}</h2>
    <p>{bg ? "Използваме бисквитки и подобни технологии за работата на магазина. С твое съгласие събираме и статистика за посещенията. Можеш да откажеш статистиката и да продължиш да разглеждаш и поръчваш." : "We use cookies and similar technologies to operate the shop. With your consent, we also collect visit statistics. You can decline analytics and continue browsing and ordering."} <a href={`/policies/cookies?lang=${language}`}>{bg ? "Политика за бисквитки" : "Cookie policy"}</a></p>
    {details && <div className="cookie-details">
      <p><strong>{bg ? "Необходими — винаги активни" : "Necessary — always active"}</strong><br/>{bg ? "Език, текуща количка, сигурност и запазване на избора за поверителност." : "Language, current basket, security and saving your privacy choice."}</p>
      <label><input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} /> <span><strong>{bg ? "Статистика — по избор" : "Analytics — optional"}</strong><br/>{bg ? "Брой посещения и посетители чрез случаен идентификатор. Без рекламни проследяващи технологии." : "Visit and visitor counts using a random identifier. No advertising trackers."}</span></label>
    </div>}
    <div className="cookie-actions">
      <button type="button" onClick={() => save(false)}>{bg ? "Само необходимите" : "Necessary only"}</button>
      <button type="button" onClick={() => save(true)}>{bg ? "Приемам всички" : "Accept all"}</button>
      <button type="button" onClick={() => details ? save(analytics) : setDetails(true)}>{details ? (bg ? "Запази избора" : "Save choices") : (bg ? "Настройки" : "Settings")}</button>
    </div>
  </section>;
}
