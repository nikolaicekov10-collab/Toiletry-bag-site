"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, X } from "lucide-react";
import galleries from "./data/custom-gallery.json";

export function CustomGallery({ language, onEnquiry }: { language: "bg" | "en"; onEnquiry: () => void }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [photo, setPhoto] = useState(0);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const entry = selected === null ? null : galleries[selected];
  const text = (bg: string, en: string) => language === "bg" ? bg : en;
  const name = (item: typeof galleries[number]) => language === "bg" ? item.name : item.nameEn;
  const close = () => setSelected(null);

  useEffect(() => {
    if (selected === null) return;
    const modal = dialog.current;
    modal?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      modal?.close();
      document.body.style.overflow = previous;
      trigger.current?.focus({ preventScroll: true });
    };
  }, [selected]);

  return <section className="custom-gallery" id="custom" aria-label={text("Твоят дизайн, създаден от Nikky’S", "Your design, created by Nikky’S")}>
    <div className="custom-gallery-intro">
      <p className="eyebrow">{text("По твоя идея", "Inspired by you")}</p>
      <p>{text("Понякога търсиш нещо, което още не си открил. Различен размер, любим цвят или детайл, който има значение за теб. Тук са част от идеите на други клиенти, които вече превърнах в готови изделия. Следващата може да бъде твоята.", "Sometimes you are looking for something you haven’t found yet. A different size, a favourite colour or a detail that matters to you. Here are some of the ideas from other customers that I have already brought to life. The next one could be yours.")}</p>
    </div>
    <div className="custom-gallery-grid">
      {galleries.map((item, index) => <article key={item.id}>
        <button type="button" className="custom-gallery-card" aria-label={text("Разгледай: ", "View: ") + name(item)} onClick={(event) => { trigger.current = event.currentTarget; setPhoto(0); setSelected(index); }}>
          <div className="custom-gallery-cover"><img src={item.images[0]} alt={name(item)} loading="lazy" width="1086" height="1448" /><span>{text("Разгледай", "View gallery")} <ArrowRight size={17} /></span></div>
          <h3>{name(item)}</h3>
        </button>
      </article>)}
    </div>
    <div className="custom-gallery-cta">
      <h2>{text("Вече си представяш нещо свое?", "Already imagining something of your own?")}</h2>
      <button className="primary-button" type="button" onClick={onEnquiry}>{text("Разкажи ми идеята си", "Tell me your idea")} <ArrowRight size={18} /></button>
    </div>
    {entry && <dialog ref={dialog} className="custom-gallery-dialog" aria-labelledby="custom-gallery-title" onCancel={close} onClick={(event) => { if (event.target === event.currentTarget) close(); }} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); setPhoto((photo + entry.images.length - 1) % entry.images.length); }
      if (event.key === "ArrowRight") { event.preventDefault(); setPhoto((photo + 1) % entry.images.length); }
    }}>
      <div className="custom-gallery-viewer">
        <header><h2 id="custom-gallery-title">{name(entry)}</h2><button type="button" className="gallery-icon" autoFocus aria-label={text("Затвори галерията", "Close gallery")} onClick={close}><X /></button></header>
        <div className="custom-gallery-stage">
          <img src={entry.images[photo]} alt={`${name(entry)} — ${text("снимка", "photo")} ${photo + 1}`} />
          {entry.images.length > 1 && <><button type="button" className="gallery-icon gallery-prev" aria-label={text("Предишна снимка", "Previous photo")} onClick={() => setPhoto((photo + entry.images.length - 1) % entry.images.length)}><ArrowLeft /></button><button type="button" className="gallery-icon gallery-next" aria-label={text("Следваща снимка", "Next photo")} onClick={() => setPhoto((photo + 1) % entry.images.length)}><ArrowRight /></button></>}
        </div>
        <p className="custom-gallery-count" aria-live="polite">{photo + 1} / {entry.images.length}</p>
        {entry.images.length > 1 && <div className="custom-gallery-thumbnails">{entry.images.map((src, index) => <button key={src} type="button" aria-label={`${text("Снимка", "Photo")} ${index + 1}`} aria-pressed={photo === index} onClick={() => setPhoto(index)}><img src={src} alt="" loading="lazy" /></button>)}</div>}
      </div>
    </dialog>}
  </section>;
}
