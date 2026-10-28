"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export function SearchDropdown({ label, placeholder, searchPlaceholder, value, options, onChange, disabled = false }: {
  label: string;
  placeholder: string;
  searchPlaceholder: string;
  value: string;
  options: { value: string; label: string; search: string }[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const id = useId();
  const selectedLabel = options.find((option) => option.value === value)?.label;
  const normalizedQuery = query.trim().toLocaleLowerCase("bg");
  const filtered = options.filter((option) => !normalizedQuery || option.search.toLocaleLowerCase("bg").includes(normalizedQuery)).slice(0, 100);

  function close(restoreFocus = false) {
    search.current?.blur();
    setOpen(false);
    setQuery("");
    if (restoreFocus) trigger.current?.focus({ preventScroll: true });
  }

  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);

  useEffect(() => { setOpen(false); setQuery(""); }, [disabled, value]);

  // A label around multiple buttons forwards an option click to the trigger,
  // reopening the menu on Safari. Use a labelled group instead.
  return <div className="courier-search" role="group" aria-labelledby={`${id}-label`} ref={root}
    onKeyDown={(event) => { if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); } }}>
    <span id={`${id}-label`}>{label}</span>
    <button type="button" className="courier-search-trigger" ref={trigger} disabled={disabled}
      aria-labelledby={`${id}-label ${id}-value`} aria-expanded={open} aria-controls={open ? `${id}-menu` : undefined}
      onClick={() => { if (open) close(); else { setQuery(""); setOpen(true); } }}>
      <span id={`${id}-value`} className={selectedLabel ? "" : "placeholder"}>{selectedLabel || placeholder}</span>
      <ChevronDown size={17} aria-hidden="true" />
    </button>
    {open && !disabled && <div className="courier-search-menu" id={`${id}-menu`}>
      <input ref={search} autoFocus value={query} onChange={(event) => setQuery(event.target.value)}
        placeholder={searchPlaceholder} aria-label={searchPlaceholder} autoComplete="off" />
      <div className="courier-search-results">
        {filtered.map((option) => <button type="button" key={option.value} className={option.value === value ? "active" : ""}
          aria-pressed={option.value === value} onClick={() => { close(true); onChange(option.value); }}>
          {option.label}
        </button>)}
        {!filtered.length && <p>—</p>}
      </div>
    </div>}
  </div>;
}
