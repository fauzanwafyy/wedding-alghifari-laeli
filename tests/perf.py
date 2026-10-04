"""Transfer-size budget: what a phone downloads before and after opening the invitation."""
import asyncio, sys
from playwright.async_api import async_playwright
async def run(w, h, mobile):
    async with async_playwright() as p:
        b = await p.chromium.launch()
        ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=3 if mobile else 1, is_mobile=mobile)
        pg = await ctx.new_page()
        sizes = {}
        async def on_resp(r):
            try:
                body = await r.body(); sizes[r.url.split('8091/')[-1]] = len(body)
            except Exception: pass
        pg.on("response", lambda r: asyncio.ensure_future(on_resp(r)))
        await pg.goto("http://127.0.0.1:8091/?to=Pujo", wait_until="networkidle")
        await pg.wait_for_timeout(800)
        before = dict(sizes)
        lcp = await pg.evaluate("""new Promise(res => { new PerformanceObserver(l => { const e = l.getEntries(); res(Math.round(e[e.length-1].startTime)); }).observe({type:'largest-contentful-paint', buffered:true}); setTimeout(()=>res(-1), 2000); })""")
        cls = await pg.evaluate("""new Promise(res => { let v=0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) v += e.value; }).observe({type:'layout-shift', buffered:true}); setTimeout(()=>res(v), 500); })""")
        await pg.click("#open-invitation"); await pg.wait_for_timeout(2500)
        after = {k: v for k, v in sizes.items() if k not in before}
        kb = lambda d: sum(d.values()) / 1024
        print(f"\n=== {w}x{h} dpr={'3' if mobile else '1'} ===")
        print(f"Before opening: {len(before)} requests, {kb(before):.0f} KB  | LCP {lcp} ms (local)  | CLS {cls:.3f}")
        for k, v in sorted(before.items(), key=lambda x: -x[1])[:8]: print(f"   {v/1024:7.1f} KB  {k}")
        audio = {k: v for k, v in after.items() if k.endswith('.mp3')}
        print(f"After opening (first screen): +{len(after)} requests, {kb(after) - kb(audio):.0f} KB (+ music {kb(audio):.0f} KB streamed)")
        await b.close()
asyncio.run(run(390, 844, True)); asyncio.run(run(1440, 900, False))
