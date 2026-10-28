import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const source = await readFile(new URL("../app/search-dropdown.tsx", import.meta.url), "utf8");
let { outputText } = ts.transpileModule(source, { compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 } });
for (const specifier of ["react", "react/jsx-runtime", "lucide-react"]) {
  outputText = outputText.replaceAll(`from "${specifier}"`, `from "${import.meta.resolve(specifier)}"`);
}
const { SearchDropdown } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const options = [{ value: "sofia", label: "София", search: "София" }, { value: "office-1", label: "Офис Бокар", search: "Офис Бокар" }];

for (const [label, value, expected] of [["Град", "sofia", "София"], ["Офис или автомат", "office-1", "Офис Бокар"]]) {
  test(`${label}: selected value is shown with search and alternatives collapsed`, () => {
    const html = renderToStaticMarkup(createElement(SearchDropdown, { label, value, options, placeholder: "Избери", searchPlaceholder: "Търси", onChange() {} }));
    assert.match(html, /^<div class="courier-search" role="group"/);
    // Label activation was forwarding option clicks to the open/close trigger.
    assert.doesNotMatch(html, /<label\b/);
    assert.match(html, /aria-expanded="false"/);
    assert.ok(html.includes(expected));
    assert.doesNotMatch(html, /courier-search-menu|courier-search-results|<input/);
    assert.match(html, /type="button"/);
  });
}
