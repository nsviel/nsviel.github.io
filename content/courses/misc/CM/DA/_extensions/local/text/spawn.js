(() => {
  const EFFECT_DURATION_MS = 3000;
  const SPAWN_INTERVAL_MS = 110;
  const activeSpawns = new Map();
  let revealBound = false;

  function randomBetween(min, max) {
    return min + Math.random() * Math.max(0, max - min);
  }

  function makeCopy(source, layer, slide) {
    const copy = document.createElement("div");
    copy.className = Array.from(source.classList)
      .filter((name) => !["fragment", "visible", "current-fragment", "spawn"].includes(name))
      .concat("spawn-copy")
      .join(" ");
    copy.innerHTML = source.innerHTML;
    copy.setAttribute("aria-hidden", "true");

    const sourceStyle = window.getComputedStyle(source);
    ["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "letterSpacing", "color", "textShadow", "textTransform"]
      .forEach((property) => {
        copy.style[property] = sourceStyle[property];
      });

    layer.appendChild(copy);

    const width = copy.offsetWidth;
    const height = copy.offsetHeight;
    const maxLeft = Math.max(0, slide.clientWidth - width);
    const maxTop = Math.max(0, slide.clientHeight - height);
    copy.style.left = `${randomBetween(0, maxLeft) + width / 2}px`;
    copy.style.top = `${randomBetween(0, maxTop) + height / 2}px`;

    copy.addEventListener("animationend", () => copy.remove(), { once: true });
  }

  function stopSpawn(source, finish = false) {
    const state = activeSpawns.get(source);
    if (!state) return;

    window.clearInterval(state.interval);
    window.clearTimeout(state.timeout);
    state.layer.remove();

    if (source.isConnected) {
      if (state.oldVisibility) {
        source.style.setProperty("visibility", state.oldVisibility, state.oldPriority);
      } else {
        source.style.removeProperty("visibility");
      }
      if (finish) source.classList.add("spawn-finished");
    }

    activeSpawns.delete(source);
  }

  function startSpawn(source) {
    if (!source.isConnected || activeSpawns.has(source)) return;

    const slide = source.closest("section");
    if (!slide) return;

    const layer = document.createElement("div");
    layer.className = "spawn-layer";
    layer.setAttribute("aria-hidden", "true");
    slide.appendChild(layer);

    const state = {
      layer,
      oldVisibility: source.style.getPropertyValue("visibility"),
      oldPriority: source.style.getPropertyPriority("visibility"),
      interval: null,
      timeout: null,
    };
    activeSpawns.set(source, state);
    source.style.setProperty("visibility", "hidden", "important");

    makeCopy(source, layer, slide);
    state.interval = window.setInterval(() => {
      if (!source.isConnected || !slide.classList.contains("present")) {
        stopSpawn(source);
        return;
      }
      makeCopy(source, layer, slide);
    }, SPAWN_INTERVAL_MS);
    state.timeout = window.setTimeout(() => stopSpawn(source, true), EFFECT_DURATION_MS);
  }

  function getSpawnTargets(fragment) {
    if (!fragment || fragment.nodeType !== Node.ELEMENT_NODE) return [];
    const targets = fragment.matches(".spawn") ? [fragment] : Array.from(fragment.querySelectorAll(".spawn"));
    return targets.filter((target) => {
      const parentFragment = target.closest(".fragment");
      return !parentFragment || parentFragment.classList.contains("visible");
    });
  }

  function bindReveal() {
    const deck = window.Reveal;
    if (!deck || typeof deck.on !== "function") {
      window.setTimeout(bindReveal, 50);
      return;
    }
    if (typeof deck.isReady === "function" && !deck.isReady()) {
      deck.on("ready", () => bindReveal());
      return;
    }
    if (revealBound) return;
    revealBound = true;

    deck.on("fragmentshown", (event) => {
      getSpawnTargets(event.fragment).forEach(startSpawn);
    });

    deck.on("fragmenthidden", (event) => {
      for (const source of activeSpawns.keys()) {
        if (source === event.fragment || event.fragment.contains(source)) {
          stopSpawn(source);
        }
      }
      const finished = event.fragment.matches(".spawn-finished")
        ? [event.fragment]
        : Array.from(event.fragment.querySelectorAll(".spawn-finished"));
      finished.forEach((source) => source.classList.remove("spawn-finished"));
    });

    deck.on("slidechanged", (event) => {
      for (const source of activeSpawns.keys()) {
        if (!event.currentSlide || !event.currentSlide.contains(source)) {
          stopSpawn(source);
        }
      }
      if (event.previousSlide) {
        event.previousSlide.querySelectorAll(".spawn-finished").forEach((source) => {
          source.classList.remove("spawn-finished");
        });
      }
      if (event.currentSlide) {
        event.currentSlide.querySelectorAll(".spawn").forEach((source) => {
          const fragment = source.closest(".fragment");
          if (fragment && fragment.classList.contains("visible")) startSpawn(source);
        });
      }
    });

    const currentSlide = deck.getCurrentSlide();
    if (currentSlide) {
      currentSlide.querySelectorAll(".spawn").forEach((source) => {
        const fragment = source.closest(".fragment");
        if (fragment && fragment.classList.contains("visible")) startSpawn(source);
      });
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      for (const source of activeSpawns.keys()) stopSpawn(source);
    }
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindReveal, { once: true });
  } else {
    bindReveal();
  }
})();
