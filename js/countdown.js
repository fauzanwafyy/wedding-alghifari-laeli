/**
 * Live countdown to the wedding, computed from absolute timestamps with the
 * +07:00 offset, so it is correct for visitors in any timezone.
 *
 * States: "counting" → "today" (from start until celebrationEnds) → "after".
 */
const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function getCountdownState(nowMs, targetMs, endsMs) {
  const diff = targetMs - nowMs;
  if (diff > 0) {
    return {
      state: "counting",
      days: Math.floor(diff / DAY),
      hours: Math.floor((diff % DAY) / HOUR),
      minutes: Math.floor((diff % HOUR) / MINUTE),
      seconds: Math.floor((diff % MINUTE) / SECOND),
    };
  }
  return { state: nowMs < endsMs ? "today" : "after", days: 0, hours: 0, minutes: 0, seconds: 0 };
}

export function initCountdown(root, wedding, copy) {
  if (!root) return;
  const target = Date.parse(wedding.countdownTarget);
  const ends = Date.parse(wedding.celebrationEnds);
  if (Number.isNaN(target)) return;

  const units = {
    days: root.querySelector('[data-unit="days"]'),
    hours: root.querySelector('[data-unit="hours"]'),
    minutes: root.querySelector('[data-unit="minutes"]'),
    seconds: root.querySelector('[data-unit="seconds"]'),
  };
  const timer = root.querySelector(".timer");
  const done = root.querySelector(".timer-done");
  const doneTitle = root.querySelector(".timer-done__title");
  const doneSub = root.querySelector(".timer-done__sub");
  const labels = copy.countdownLabels || {};
  root.querySelectorAll("[data-unit-label]").forEach((el) => {
    const label = labels[el.dataset.unitLabel];
    if (label) el.textContent = label;
  });

  let last = "";
  let handle;

  const render = () => {
    const s = getCountdownState(Date.now(), target, ends);
    if (s.state === "counting") {
      const pad = (n) => String(n).padStart(2, "0");
      // Only touch the DOM for values that changed
      for (const [key, el] of Object.entries(units)) {
        if (!el) continue;
        const v = pad(s[key]);
        if (el.textContent !== v) el.textContent = v;
      }
    }
    if (s.state !== last) {
      last = s.state;
      root.dataset.state = s.state;
      if (timer) timer.hidden = s.state !== "counting";
      if (done) {
        done.hidden = s.state === "counting";
        if (s.state === "today") {
          doneTitle.textContent = copy.countdownToday;
          doneSub.textContent = copy.countdownTodaySub;
        } else if (s.state === "after") {
          doneTitle.textContent = copy.countdownAfter;
          doneSub.textContent = copy.countdownAfterSub;
        }
      }
    }
    return s.state;
  };

  const tick = () => {
    const state = render();
    if (state === "after") return; // nothing left to update
    // Align to the next whole second for a steady tick
    handle = setTimeout(tick, SECOND - (Date.now() % SECOND) + 5);
  };

  tick();
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      clearTimeout(handle);
      tick();
    }
  });
}
