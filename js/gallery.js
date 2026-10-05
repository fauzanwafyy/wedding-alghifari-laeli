/**
 * "Our Moment": editorial mosaic + accessible lightbox (native <dialog>).
 * Layout restored from the first design (commit 2901493): two columns where
 * one feature photo spans the full width (4:5), followed by two halves side by
 * side (2:3), repeating; landscape photos (`wide: true`) always take a full
 * row (3:2). Photo order = order of `gallery` in js/config.js.
 * Keyboard: ←/→ to navigate, Esc to close. Touch: swipe left/right.
 */
(function (AWL) {
  "use strict";
  const { $, h, picture } = AWL;

  // Rendered widths: phones = 100vw − 2×24px gutters (− 10px gap for halves);
  // tablet = 46rem grid; desktop = the invitation column (≤ 560px).
  const SIZES = {
    half: "(min-width: 1024px) 250px, (min-width: 768px) 340px, calc(50vw - 29px)",
    full: "(min-width: 1024px) 512px, (min-width: 768px) 688px, calc(100vw - 48px)",
  };

  function initGallery(images, backdrop) {
    const grid = $("#gallery-grid");
    const dialog = $("#lightbox");
    if (!grid || !images || !images.length) return;

    const section = $("#gallery");
    // Absolute URL: a url() inside a CSS variable would otherwise resolve against css/
    if (section && backdrop) section.style.setProperty("--gallery-backdrop", `url("${new URL(backdrop, document.baseURI).href}")`);

    // Rhythm: one feature (full width), then two halves; landscapes always span.
    let slot = 0;
    images.forEach((img, i) => {
      let variant;
      if (img.wide) variant = "wide";
      else {
        variant = slot % 3 === 0 ? "feature" : "half";
        slot += 1;
      }
      const btn = h(
        "button",
        {
          type: "button",
          class: "mosaic__btn",
          "aria-label": `Perbesar foto ${i + 1} dari ${images.length}: ${img.alt}`,
          onclick: () => open(i),
        },
        picture(img, { sizes: variant === "half" ? SIZES.half : SIZES.full })
      );
      grid.append(h("li", { class: `mosaic__item mosaic__item--${variant}`, "data-reveal": "" }, btn));
    });

    let current = 0;

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
