/**
 * "Our Moment": editorial mosaic + accessible lightbox (native <dialog>).
 * Keyboard: ←/→ to navigate, Esc to close. Touch: swipe left/right.
 */
import { $, h, picture } from "./utils.js";

export function initGallery(images) {
  const grid = $("#gallery-grid");
  const dialog = $("#lightbox");
  if (!grid || !images || !images.length) return;

  // Rhythm: one feature (full width), then two halves; landscapes always span.
  let slot = 0;
  images.forEach((img, i) => {
    let variant;
    if (img.wide) variant = "wide";
    else {
      variant = slot % 3 === 0 ? "feature" : "half";
      slot += 1;
    }
    const sizes =
      variant === "half"
        ? "(min-width: 1024px) 260px, (min-width: 768px) 33vw, 50vw"
        : "(min-width: 1024px) 520px, (min-width: 768px) 66vw, 100vw";
    const btn = h(
      "button",
      {
        type: "button",
        class: "mosaic__btn",
        "aria-label": `Perbesar foto ${i + 1} dari ${images.length}: ${img.alt}`,
        onclick: () => open(i),
      },
      picture(img, { sizes })
    );
    grid.append(h("li", { class: `mosaic__item mosaic__item--${variant}`, "data-reveal": "" }, btn));
  });

  if (!dialog || typeof dialog.showModal !== "function") {
    // Very old browsers: no lightbox; images stay in the grid.
    grid.querySelectorAll(".mosaic__btn").forEach((b) => (b.disabled = true));
    return;
  }

  const stage = $(".lightbox__stage", dialog);
  const idx = $("#lb-index", dialog);
  const total = $("#lb-total", dialog);
  const caption = $("#lb-caption", dialog);
  let current = 0;
  let opener = null;

  total.textContent = String(images.length);

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
    const pic = picture(img, { sizes: "100vw", loading: "eager", className: "lightbox__pic" });
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
