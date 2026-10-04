"""Lightweight accessibility audit (no external deps): names, labels, alt text, headings, landmarks, contrast."""
import asyncio, json, sys
from playwright.async_api import async_playwright

JS = r"""
() => {
  const issues = [];
  const vis = (el) => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length) && getComputedStyle(el).visibility !== 'hidden';
  const name = (el) => (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') && document.getElementById(el.getAttribute('aria-labelledby'))?.textContent || el.textContent || el.getAttribute('title') || '').trim();
  document.querySelectorAll('img').forEach(img => { if (!img.hasAttribute('alt')) issues.push('img without alt: ' + img.src.slice(-60)); });
  document.querySelectorAll('button, a[href]').forEach(el => { if (vis(el) && !name(el)) issues.push('control without name: ' + el.outerHTML.slice(0, 90)); });
  document.querySelectorAll('input:not([type=hidden]), textarea, select').forEach(el => {
    if (el.closest('.hp')) return;
    const labelled = el.labels && el.labels.length || el.getAttribute('aria-label') || el.getAttribute('aria-labelledby');
    if (!labelled) issues.push('unlabelled field: ' + (el.name || el.id));
  });
  const hs = [...document.querySelectorAll('main h1, main h2, main h3, main h4')].filter(h => !h.closest('[hidden]'));
  let prev = 0; hs.forEach(h => { const l = +h.tagName[1]; if (prev && l > prev + 1) issues.push(`heading jump h${prev}→h${l}: ${h.textContent.trim().slice(0,40)}`); prev = l; });
  if (document.querySelectorAll('main h1').length !== 1) issues.push('main should have exactly one h1');
  const ids = {}; document.querySelectorAll('[id]').forEach(e => { ids[e.id] = (ids[e.id]||0)+1; }); Object.entries(ids).forEach(([k,v]) => v>1 && issues.push('duplicate id: '+k));
  document.querySelectorAll('[aria-describedby],[aria-controls],[aria-labelledby]').forEach(e => ['aria-describedby','aria-controls','aria-labelledby'].forEach(a => (e.getAttribute(a)||'').split(/\s+/).filter(Boolean).forEach(id => { if (!document.getElementById(id)) issues.push(`${a} → missing #${id}`); })));
  // contrast of visible text
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const lum = ({r,g,b}) => [r,g,b].map(v => { v/=255; return v<=.03928? v/12.92 : Math.pow((v+.055)/1.055, 2.4); }).reduce((s,v,i)=> s + v*[.2126,.7152,.0722][i], 0);
  const bgOf = (el) => { while (el) { const c = parse(getComputedStyle(el).backgroundColor); if (c && c.a > .9) return c; el = el.parentElement; } return {r:23,g:19,b:15,a:1}; };
  const low = [];
  document.querySelectorAll('main p, main span, main a, main label, main legend, main h1, main h2, main h3, main button, .cover p, .cover span, .dock span').forEach(el => {
    if (!vis(el) || ![...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim())) return;
    if (el.closest('.hero, .closing__figure, .cover, .stage')) return; // text over photos checked visually
    const cs = getComputedStyle(el); const fg = parse(cs.color); if (!fg || +cs.opacity === 0) return;
    const bg = bgOf(el); const L1 = lum(fg), L2 = lum(bg); const ratio = (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 600; const large = size >= 24 || (size >= 18.66 && bold);
    if (ratio < (large ? 3 : 4.5)) low.push(`${ratio.toFixed(2)} ${size}px "${el.textContent.trim().slice(0,30)}"`);
  });
  return { issues, low: [...new Set(low)].slice(0, 30), landmarks: { main: !!document.querySelector('main'), nav: !!document.querySelector('nav[aria-label]') } };
}
"""
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        pg = await b.new_page(viewport={"width": 390, "height": 844}, reduced_motion="reduce")
        await pg.goto("http://127.0.0.1:8091/?to=Pujo" if len(sys.argv) < 2 else sys.argv[1])
        await pg.wait_for_selector("#cover.is-ready")
        await pg.click("#open-invitation"); await pg.wait_for_timeout(500)
        await pg.click("#gift-toggle"); await pg.wait_for_timeout(500)
        res = await pg.evaluate(JS)
        print(json.dumps(res, indent=1, ensure_ascii=False))
        # keyboard: tab through first 25 stops, make sure focus is visible
        await pg.evaluate("window.scrollTo(0,0)")
        stops = []
        for _ in range(25):
            await pg.keyboard.press("Tab")
            stops.append(await pg.evaluate("(() => { const e = document.activeElement; const cs = getComputedStyle(e); return (e.id || e.className || e.tagName).toString().slice(0,30) + ' outline=' + cs.outlineStyle; })()"))
        print("tab order:", *stops, sep="\n  ")
        await b.close()
asyncio.run(main())
