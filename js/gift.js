/**
 * Wedding Gift: reveal bank details + copy account number.
 */
(function (AWL) {
  "use strict";
  const { $, h, toast } = AWL;

  /**
   * Visual groups for an account number: 10 digits → 3·3·4 ("736 150 4589"),
   * otherwise groups of 4. Groups are separate elements (no space characters),
   * so selecting the number by hand also copies the plain digits.
   */
  const digitGroups = (d) => (d.length === 10 ? [d.slice(0, 3), d.slice(3, 6), d.slice(6)] : d.match(/.{1,4}/g) || []);

  /** Each digit sits in an equal-width box: Fraunces has no tabular figures (no `tnum`). */
  function accountNumber(digits) {
    return h("p", { class: "account__number", "aria-label": `Nomor rekening ${digits.split("").join(" ")}` },
      ...digitGroups(digits).map((g) =>
        h("span", { class: "account__group" }, ...g.split("").map((c) => h("span", { class: "account__digit", text: c })))));
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {
      /* fall through to legacy method */
    }
    const ta = h("textarea", { readonly: true, "aria-hidden": "true", style: "position:fixed;top:-1000px;opacity:0" });
    ta.value = text;
    document.body.append(ta);
    ta.select();
    ta.setSelectionRange(0, text.length);
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }

  const copyIcon = () => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<rect x="8.5" y="8.5" width="11" height="11" rx="1.5"/><path d="M15.5 8.5V6A1.5 1.5 0 0 0 14 4.5H6A1.5 1.5 0 0 0 4.5 6v8A1.5 1.5 0 0 0 6 15.5h2.5"/>';
    return svg;
  };

  function initGift(gift) {
    const list = $("#gift-accounts");
    const toggle = $("#gift-toggle");
    const panel = $("#gift-panel");
    if (!list || !gift) return;

    gift.accounts.forEach((acc) => {
      const digits = String(acc.accountNumber).replace(/\D/g, "");
      const btnLabel = h("span", { text: "Salin Nomor Rekening" });
      const btn = h(
        "button",
        { type: "button", class: "account__copy", "aria-label": `Salin nomor rekening ${acc.bank} ${digits} atas nama ${acc.accountHolder}` },
        copyIcon(),
        btnLabel
      );
      btn.addEventListener("click", async () => {
        const ok = await copyText(digits);
        if (ok) {
          btn.classList.add("is-copied");
          btnLabel.textContent = "Tersalin";
          toast(`Nomor rekening ${acc.bank} berhasil disalin`);
          setTimeout(() => {
            btn.classList.remove("is-copied");
            btnLabel.textContent = "Salin Nomor Rekening";
          }, 2200);
        } else {
          toast(`Gagal menyalin. Nomor rekening: ${digits}`);
        }
      });

      list.append(
        h(
          "li",
          { class: "account" },
          h("div", { class: "account__top" },
            h("span", { class: "account__label", text: acc.label }),
            h("span", { class: "account__bank", text: acc.bank })),
          accountNumber(digits),
          h("p", { class: "account__holder" }, h("span", { text: "a.n. " }), acc.accountHolder),
          btn
        )
      );
    });

    if (toggle && panel) {
      toggle.addEventListener("click", () => {
        const open = toggle.getAttribute("aria-expanded") !== "true";
        toggle.setAttribute("aria-expanded", String(open));
        panel.classList.toggle("is-open", open);
        panel.inert = !open;
        toggle.querySelector(".btn__label").textContent = open ? "Sembunyikan Rekening" : "Lihat Rekening";
      });
    }
  }

  Object.assign(AWL, { initGift });
})(window.AWL = window.AWL || {});
