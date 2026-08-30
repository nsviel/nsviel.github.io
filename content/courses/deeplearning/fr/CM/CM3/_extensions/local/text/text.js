(() => {
  const SWAP_IN_DURATION_MS = 240;
  const HOLD_DURATION_MS = 500;
  const SWAP_OUT_DURATION_MS = 240;
  const MIN_DELAY_MS = 1200;
  const MAX_DELAY_MS = 2400;

  let activeElement = null;
  let lastElement = null;
  let cycleTimer = null;

  function randomInt(max) {
    return Math.floor(Math.random() * max);
  }

  function randomDelay() {
    return MIN_DELAY_MS + Math.floor(Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS + 1));
  }

  function isVisibleScramble(el) {
    if (!el || !el.isConnected) {
      return false;
    }

    if (document.hidden) {
      return false;
    }

    const slide = el.closest("section");
    if (slide && !slide.classList.contains("present")) {
      return false;
    }

    const hiddenFragment = el.closest(".fragment");
    if (hiddenFragment && !hiddenFragment.classList.contains("visible")) {
      return false;
    }

    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") {
      return false;
    }

    const original = el.dataset.scrambleOriginal || el.textContent || "";
    return Array.from(original).length >= 2;
  }

  function getEligibleElements() {
    const all = Array.from(document.querySelectorAll(".scramble"))
      .filter(isVisibleScramble);

    if (all.length <= 1) {
      return all;
    }

    const withoutLast = all.filter((el) => el !== lastElement);
    return withoutLast.length > 0 ? withoutLast : all;
  }

  function escapeHtml(text) {
    return text
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function pickSwapIndices(chars) {
    if (chars.length < 2) {
      return null;
    }

    const candidates = [];
    for (let i = 0; i < chars.length - 1; i += 1) {
      if (chars[i].trim() === "" || chars[i + 1].trim() === "") {
        continue;
      }
      if (chars[i] === chars[i + 1]) {
        continue;
      }
      candidates.push(i);
    }

    if (candidates.length === 0) {
      return null;
    }

    return candidates[randomInt(candidates.length)];
  }

  function renderSwapMarkup(chars, start, phase = "swap-in") {
    return chars.map((char, index) => {
      const content = escapeHtml(char);
      if (index === start) {
        const phaseClass = phase === "swap-out" ? "scramble-swap-back-left" : "scramble-swap-left";
        return `<span class="scramble-swap ${phaseClass}">${content}</span>`;
      }
      if (index === start + 1) {
        const phaseClass = phase === "swap-out" ? "scramble-swap-back-right" : "scramble-swap-right";
        return `<span class="scramble-swap ${phaseClass}">${content}</span>`;
      }
      return content;
    }).join("");
  }

  function scrambleOnce(el) {
    const original = el.dataset.scrambleOriginal || el.textContent || "";
    const chars = Array.from(original);
    const start = pickSwapIndices(chars);

    if (start === null) {
      return false;
    }

    const swapped = chars.slice();
    [swapped[start], swapped[start + 1]] = [swapped[start + 1], swapped[start]];

    activeElement = el;
    lastElement = el;
    el.classList.add("is-scrambling");
    el.innerHTML = renderSwapMarkup(swapped, start, "swap-in");

    window.setTimeout(() => {
      el.innerHTML = escapeHtml(swapped.join(""));

      window.setTimeout(() => {
        el.innerHTML = renderSwapMarkup(chars, start, "swap-out");

        window.setTimeout(() => {
          el.textContent = original;
          el.classList.remove("is-scrambling");
          if (activeElement === el) {
            activeElement = null;
          }
          scheduleNext();
        }, SWAP_OUT_DURATION_MS);
      }, HOLD_DURATION_MS);
    }, SWAP_IN_DURATION_MS);

    return true;
  }

  function runCycle() {
    cycleTimer = null;

    if (activeElement) {
      scheduleNext(250);
      return;
    }

    const eligible = getEligibleElements();
    if (eligible.length === 0) {
      scheduleNext(800);
      return;
    }

    const target = eligible[randomInt(eligible.length)];
    if (!scrambleOnce(target)) {
      scheduleNext(800);
    }
  }

  function scheduleNext(delay = randomDelay()) {
    if (cycleTimer) {
      window.clearTimeout(cycleTimer);
    }
    cycleTimer = window.setTimeout(runCycle, delay);
  }

  function primeElements() {
    document.querySelectorAll(".scramble").forEach((el) => {
      if (!el.dataset.scrambleOriginal) {
        el.dataset.scrambleOriginal = el.textContent || "";
      }
      el.textContent = el.dataset.scrambleOriginal;
      el.classList.remove("is-scrambling");
    });
  }

  function init() {
    primeElements();
    scheduleNext(900);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (cycleTimer) {
        window.clearTimeout(cycleTimer);
        cycleTimer = null;
      }
      if (activeElement) {
        activeElement.textContent = activeElement.dataset.scrambleOriginal || activeElement.textContent || "";
        activeElement.classList.remove("is-scrambling");
        activeElement = null;
      }
      return;
    }

    primeElements();
    scheduleNext(400);
  });

  document.addEventListener("DOMContentLoaded", init);

  if (window.Reveal && typeof window.Reveal.on === "function") {
    window.Reveal.on("slidechanged", () => {
      primeElements();
      scheduleNext(400);
    });
    window.Reveal.on("fragmentshown", () => {
      primeElements();
      scheduleNext(250);
    });
    window.Reveal.on("fragmenthidden", () => {
      primeElements();
      scheduleNext(250);
    });
  }
})();
