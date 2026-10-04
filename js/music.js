/**
 * Background music. Never autoplays: playback starts inside the
 * "Buka Undangan" click (a user gesture). A floating toggle controls it.
 * States: idle → loading → playing | paused | blocked | unavailable.
 * The guest's choice to pause is remembered for their next visit.
 */
(function (AWL) {
  "use strict";
  const { $, store } = AWL;

  const PREF_KEY = "awl:music";

  function createMusic(cfg) {
    const audio = $("#bg-music");
    const btn = $("#music-toggle");
    const label = btn && $(".music__label", btn);
    let state = "idle";
    let resumeOnVisible = false;

    if (!cfg || !cfg.enabled || !audio || !btn) {
      if (btn) btn.hidden = true;
      return { start() {}, available: false };
    }

    function set(next) {
      state = next;
      btn.dataset.state = next;
      const playing = next === "playing";
      btn.setAttribute("aria-pressed", playing ? "true" : "false");
      const text =
        next === "unavailable" ? "Musik tidak tersedia"
          : next === "loading" ? "Memuat musik…"
            : playing ? "Jeda musik"
              : "Putar musik";
      btn.setAttribute("aria-label", text);
      btn.title = cfg.title ? `${text} · ${cfg.title}` : text;
      if (label) label.textContent = text;
      btn.disabled = next === "unavailable";
    }

    function ensureSource() {
      if (!audio.getAttribute("src")) {
        audio.src = cfg.src;
        audio.loop = true;
        audio.volume = typeof cfg.volume === "number" ? cfg.volume : 0.7; // ignored on iOS, harmless
      }
    }

    async function play() {
      if (state === "unavailable") return;
      ensureSource();
      set("loading");
      try {
        await audio.play();
        set("playing");
      } catch (err) {
        // NotAllowedError = browser blocked playback; anything else = media problem
        set(err && err.name === "NotAllowedError" ? "blocked" : audio.error ? "unavailable" : "paused");
      }
    }

    function pause() {
      audio.pause();
      set("paused");
    }

    audio.addEventListener("error", () => set("unavailable"));
    audio.addEventListener("waiting", () => state === "playing" && btn.classList.add("is-buffering"));
    audio.addEventListener("playing", () => {
      btn.classList.remove("is-buffering");
      if (state !== "playing") set("playing");
    });

    btn.addEventListener("click", () => {
      if (state === "playing" || state === "loading") {
        pause();
        store.set(PREF_KEY, "off");
      } else {
        store.set(PREF_KEY, "on");
        play();
      }
    });

    // Pause in background tabs; resume when the guest comes back
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        resumeOnVisible = state === "playing";
        if (resumeOnVisible) audio.pause();
      } else if (resumeOnVisible) {
        resumeOnVisible = false;
        play();
      }
    });

    set("idle");

    return {
      available: true,
      /** Call synchronously inside the "open invitation" click handler. */
      start() {
        btn.hidden = false;
        if (store.get(PREF_KEY) === "off") {
          set("paused");
          return;
        }
        play();
      },
    };
  }

  Object.assign(AWL, { createMusic });
})(window.AWL = window.AWL || {});
