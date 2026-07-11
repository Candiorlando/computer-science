"use client";

// Reliable client-side print / save-as-PDF. Instead of window.print()
// with fragile @media-print visibility hacks (which fight the dark
// theme and can emit a 0-byte PDF), this writes a clean, self-contained
// light-theme document into a hidden iframe and prints THAT. The iframe
// approach avoids popup blockers and always produces a real page.

import type { RenderedDocument } from "./case-documents";

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraphs(body: string): string {
  return body
    .split("\n")
    .map((line) =>
      line.trim()
        ? `<p>${esc(line)}</p>`
        : `<div style="height:8px"></div>`,
    )
    .join("");
}

export function printRenderedDocument(
  doc: RenderedDocument,
  footer: string,
): void {
  if (typeof window === "undefined") return;

  const metaRows = doc.meta
    .map(
      (m) =>
        `<div><span class="k">${esc(m.label)}:</span> <span class="v">${esc(m.value)}</span></div>`,
    )
    .join("");

  const sections = doc.sections
    .map(
      (s) =>
        `<section>${s.heading ? `<h2>${esc(s.heading)}</h2>` : ""}${paragraphs(s.body)}</section>`,
    )
    .join("");

  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${esc(doc.title)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; }
  body {
    font-family: Georgia, "Times New Roman", Times, serif;
    font-size: 12px;
    line-height: 1.6;
    padding: 36px 44px;
    max-width: 760px;
    margin: 0 auto;
  }
  header.doc { border-bottom: 2px solid #333; padding-bottom: 14px; margin-bottom: 20px; }
  .subtitle { text-transform: uppercase; letter-spacing: .12em; font-size: 10px; color: #555; }
  h1 { font-size: 22px; margin: 6px 0 10px; }
  .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 2px 24px; font-size: 11px; }
  .meta .k { color: #555; }
  .meta .v { font-weight: 700; }
  section { margin-bottom: 18px; page-break-inside: avoid; }
  h2 { font-size: 13px; text-transform: uppercase; letter-spacing: .06em; color: #333; margin: 0 0 6px; }
  p { margin: 0 0 6px; white-space: pre-wrap; }
  footer.doc { border-top: 1px solid #999; margin-top: 24px; padding-top: 12px; font-size: 10px; color: #666; font-style: italic; }
  @page { margin: 0.6in; }
</style></head>
<body>
  <header class="doc">
    <div class="subtitle">${esc(doc.subtitle)}</div>
    <h1>${esc(doc.title)}</h1>
    <div class="meta">${metaRows}</div>
  </header>
  ${sections}
  <footer class="doc">${esc(footer)}</footer>
</body></html>`;

  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const cleanup = () => {
    // Give the print dialog time to grab the document before removal.
    window.setTimeout(() => {
      if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
    }, 1000);
  };

  const win = iframe.contentWindow;
  if (!win) {
    cleanup();
    return;
  }

  win.document.open();
  win.document.write(html);
  win.document.close();

  // Print once the iframe document has laid out.
  const doPrint = () => {
    try {
      win.focus();
      win.print();
    } catch {
      /* no-op */
    }
    cleanup();
  };

  if (win.document.readyState === "complete") {
    window.setTimeout(doPrint, 150);
  } else {
    iframe.onload = () => window.setTimeout(doPrint, 150);
    // Fallback in case onload doesn't fire for a written doc.
    window.setTimeout(doPrint, 500);
  }
}
