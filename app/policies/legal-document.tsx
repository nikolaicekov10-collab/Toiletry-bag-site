"use client";

import { useEffect, useState } from "react";
import { LEGAL_VERSION, merchant } from "../legal-config";
import { policies, slugs, type PolicySlug } from "./content";

export function LegalDocument({ slug }: { slug: PolicySlug }) {
  const [language, setLanguage] = useState<"bg" | "en">("bg");
  useEffect(() => {
    const param = new URLSearchParams(window.location.search).get("lang");
    let saved: string | null = null;
    try { saved = localStorage.getItem("nikkys-language"); } catch {}
    setLanguage(param === "en" || (!param && saved === "en") ? "en" : "bg");
  }, []);
  const bg = language === "bg";
  const policy = policies[language][slug];
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = `${policy.title} | Nikky’S`;
  }, [language, policy.title]);

  function switchLanguage() {
    const next = bg ? "en" : "bg";
    setLanguage(next);
    try { localStorage.setItem("nikkys-language", next); } catch {}
    history.replaceState(null, "", `${location.pathname}?lang=${next}`);
  }

  return <main className="legal-shell">
    <header className="legal-header"><a className="wordmark" href="/">Nikky’S</a><a href="/">← {bg ? "Към магазина" : "Back to shop"}</a><button className="language-toggle" type="button" onClick={switchLanguage}>BG | EN</button></header>
    <div className="legal-layout">
      <nav className="legal-nav" aria-label={bg ? "Информация за клиента" : "Customer information"}>
        <p className="eyebrow">{bg ? "Спокойно пазаруване" : "Shop with confidence"}</p>
        {slugs.map((item) => <a key={item} href={`/policies/${item}?lang=${language}`} aria-current={slug === item ? "page" : undefined}>{policies[language][item].title}</a>)}
        <button type="button" onClick={() => window.dispatchEvent(new Event("nikkys-cookie-settings"))}>{bg ? "Настройки на бисквитките" : "Cookie settings"}</button>
      </nav>
      <article className="legal-article">
        <p className="eyebrow">Nikky’S · {bg ? "Версия" : "Version"} {LEGAL_VERSION}</p>
        <h1>{policy.title}</h1><p className="legal-intro">{policy.intro}</p>
        {merchant.incompleteMerchantDetails && <aside className="legal-draft" role="note">{bg ? "Продавач: Nikky’S Handmade. Адрес и регистрационни данни не са предоставени. За въпроси и рекламации използвай контактите по-долу." : "Seller: Nikky’S Handmade. An address and registration details have not been provided. For questions and complaints, use the contact details below."}</aside>}
        <nav className="legal-toc" aria-label={bg ? "Съдържание" : "Contents"}>{policy.sections.map((section, index) => <a key={section.title} href={`#section-${index}`}>{index + 1}. {section.title}</a>)}</nav>
        {policy.sections.map((section, index) => <section className="legal-section" id={`section-${index}`} key={section.title}><h2>{section.title}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</section>)}
        {slug === "returns" && <div className="legal-tools"><a href={`mailto:${merchant.email}?subject=${encodeURIComponent(bg ? "Уведомление за отказ / рекламация" : "Withdrawal notice / complaint")}&body=${encodeURIComponent(bg ? "Име:\nПродукт:\nДата на получаване:\nНомер на поръчка (ако е наличен):\nУведомление / описание:\n" : "Name:\nProduct:\nDate received:\nOrder number (if available):\nNotice / description:\n")}`}>{bg ? "Пиши ни за връщане или рекламация" : "Email about a return or complaint"}</a><button type="button" onClick={() => window.print()}>{bg ? "Разпечатай страницата" : "Print this page"}</button></div>}
        {slug === "cookies" && <button className="primary-button" type="button" onClick={() => window.dispatchEvent(new Event("nikkys-cookie-settings"))}>{bg ? "Промени избора си" : "Change your choices"}</button>}
        <div className="legal-contact"><h2>{bg ? "Нужда от съдействие?" : "Need help?"}</h2><a href={`mailto:${merchant.email}`}>{merchant.email}</a><a href={`tel:${merchant.phone}`}>0896 253 141</a></div>
        <p className="legal-authorities"><a href="https://kzp.bg/" target="_blank" rel="noopener noreferrer">{bg ? "Комисия за защита на потребителите" : "Commission for Consumer Protection"}</a> · <a href="https://cpdp.bg/" target="_blank" rel="noopener noreferrer">{bg ? "Комисия за защита на личните данни" : "Commission for Personal Data Protection"}</a></p>
      </article>
    </div>
  </main>;
}
