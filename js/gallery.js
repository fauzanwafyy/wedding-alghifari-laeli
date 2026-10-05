/**
 * "Our Moment": staggered editorial grid + accessible lightbox (native <dialog>).
 * Portraits flow into 2 columns (the second gently offset, like prints laid
 * on a table); landscape photos (`wide: true`) sit on their own full row.
 * Keyboard: ←/→ to navigate, Esc to close. Touch: swipe left/right.
 */
(function (AWL) {
  "use strict";
  const { $, h, picture } = AWL;

  const COLUMNS = 2; // two calm columns on every screen size; the second is gently offset

  function initGallery(images, backdrop) {
    const grid = $("#gallery-grid");
    const dialog = $("#lightbox");
    if (!grid || !images || !images.length) return;

    const section = $("#gallery");
    // Absolute URL: a url() inside a CSS variable would otherwise resolve against css/
    if (section && backdrop) section.style.setProperty("--gallery-backdrop", `url("${new URL(backdrop, document.baseURI).href}")`);

    // Build every tile once; layout() only moves them between columns.
    const tiles = images.map((img, i) =>
      h("li", { class: `mosaic__item${img.wide ? " mosaic__item--wide" : ""}`, "data-reveal": "image" },
        h("button", {
          type: "button",
          class: "mosaic__btn",
          "aria-label": `Perbesar foto ${i + 1} dari ${images.length}: ${img.alt}`,
          onclick: () => open(i),
        }, picture(img, {
          sizes: img.wide
            ? "(min-width: 1024px) 440px, (min-width: 768px) 600px, calc(100vw - 48px)"
            : "(min-width: 1024px) 220px, (min-width: 768px) 290px, 45vw",
        })))
    );

    let current = 0;
    function layout() {
      const n = COLUMNS;
      const frag = document.createDocumentFragment();
      let group = null;
      let k = 0;
      tiles.forEach((tile, i) => {
        if (images[i].wide) {
          group = null;
          frag.append(h("ul", { class: "mosaic__row", role: "list" }, tile));
          return;
        }
        if (!group) {
          group = Array.from({ length: n }, (_, c) => h("ul", { class: `mosaic__col mosaic__col--${c + 1}`, role: "list" }));
          frag.append(h("div", { class: `mosaic__group mosaic__group--${n}` }, ...group));
          k = 0;
        }
        group[k % n].append(tile); // left-to-right reading order
        k += 1;
      });
      grid.replaceChildren(frag);
    }
    layout();

    if (!dialog || typeof dialog.showModal !== "function") {
      // Very old browsers: no lightbox; images stay in the grid.
      grid.querySelectorAll(".mosaic__btn").forEach((b) => (b.disabled = true));
      return;
    }

    const stage = $(".lightbox__stage", dialog);
    const idx = $("#lb-index", dialog);
    const total = $("#lb-total", dialog);
    const caption = $("#lb-caption", dialog);
    let opener = null;

    total.textContent = String(images.length).padStart(2, "0");

    const preload = (i) => {
      const img = images[(i + images.length) % images.length];
      const w = img.widths[img.widths.length - 1];
      const im = new Image();
      im.decoding = "async";
      im.src = `${img.src}-${w}.webp`;
    };

    function show(i) {
      current = (i + images.length) % images.length;
      const img = images[current];
      const pic = picture(img, { sizes: "100vw", loading: "eager", className: "lightbox__pic", position: "50% 50%" });
      stage.replaceChildren(pic);
      idx.textContent = String(current + 1).padStart(2, "0");
      caption.textContent = img.alt;
      preload(current + 1);
      preload(current - 1);
    }

    function open(i) {
      opener = document.activeElement;
      show(i);
      dialog.showModal();
      document.documentElement.classList.add("is-lightbox");
    }

    function close() {
      dialog.close();
    }

    dialog.addEventListener("close", () => {
      document.documentElement.classList.remove("is-lightbox");
      stage.replaceChildren();
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    });

    $(".lightbox__close", dialog).addEventListener("click", close);
    $(".lightbox__nav--prev", dialog).addEventListener("click", () => show(current - 1));
    $(".lightbox__nav--next", dialog).addEventListener("click", () => show(current + 1));

    dialog.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "ArrowLeft") show(current - 1);
    });

    // Click on the dark backdrop (outside the photo) closes
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog || e.target === stage) close();
    });

    // Swipe
    let startX = 0;
    let startY = 0;
    let tracking = false;
    stage.addEventListener("pointerdown", (e) => {
      tracking = true;
      startX = e.clientX;
      startY = e.clientY;
    });
    stage.addEventListener("pointerup", (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.2) show(current + (dx < 0 ? 1 : -1));
    });
    stage.addEventListener("pointercancel", () => (tracking = false));
  }

  Object.assign(AWL, { initGallery });
})(window.AWL = window.AWL || {});
