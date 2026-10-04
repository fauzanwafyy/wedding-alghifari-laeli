"""
Visual smoke test: screenshots the cover and the full opened page at several
viewports and prints console errors / failed requests.

    python3 tests/shoot.py [base_url] [out_dir] [--widths 390,1440] [--query "?to=Pujo"]
"""
import argparse
import asyncio
import os

from playwright.async_api import async_playwright

VIEWPORTS = {
    360: (360, 780), 390: (390, 844), 430: (430, 932),
    768: (768, 1024), 1024: (1024, 768), 1440: (1440, 900),
}


async def shoot(base, out, widths, query, full):
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        for w in widths:
            vw, vh = VIEWPORTS.get(w, (w, 900))
            mobile = w < 768
            ctx = await browser.new_context(viewport={"width": vw, "height": vh}, device_scale_factor=1,
                                            is_mobile=mobile, has_touch=mobile)
            page = await ctx.new_page()
            errors = []
            page.on("console", lambda m: errors.append(f"console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
            page.on("pageerror", lambda e: errors.append(f"pageerror: {e}"))
            page.on("requestfailed", lambda r: errors.append(f"requestfailed: {r.url} {r.failure}"))
            page.on("response", lambda r: errors.append(f"HTTP {r.status}: {r.url}") if r.status >= 400 else None)
            await page.goto(base + query, wait_until="networkidle")
            await page.wait_for_timeout(1800)
            await page.screenshot(path=f"{out}/{w}-cover.png")
            await page.click("#open-invitation")
            await page.wait_for_timeout(2200)
            await page.screenshot(path=f"{out}/{w}-opened.png")
            if full:
                # Trigger every reveal by scrolling through the page
                height = await page.evaluate("document.documentElement.scrollHeight")
                y = 0
                while y < height:
                    await page.evaluate(f"window.scrollTo(0, {y})")
                    await page.wait_for_timeout(120)
                    y += vh // 2
                    height = await page.evaluate("document.documentElement.scrollHeight")
                await page.wait_for_timeout(1500)
                await page.evaluate("window.scrollTo(0, 0)")
                await page.wait_for_timeout(400)
                await page.screenshot(path=f"{out}/{w}-full.png", full_page=True)
            overflow = await page.evaluate("document.documentElement.scrollWidth - document.documentElement.clientWidth")
            print(f"[{w}] horizontal overflow: {overflow}px; page height {await page.evaluate('document.documentElement.scrollHeight')}")
            for e in errors:
                print(f"[{w}] {e}")
            await ctx.close()
        await browser.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("base", nargs="?", default="http://127.0.0.1:8080/")
    ap.add_argument("out", nargs="?", default="/tmp/claude-0/shots")
    ap.add_argument("--widths", default="390")
    ap.add_argument("--query", default="?to=Pujo+%26+Partner")
    ap.add_argument("--no-full", action="store_true")
    a = ap.parse_args()
    asyncio.run(shoot(a.base, a.out, [int(x) for x in a.widths.split(",")], a.query, not a.no_full))
