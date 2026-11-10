(() => {
  // Keep accented characters and compound emoji together when supported.
  const segmenter = typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("fr", { granularity: "grapheme" })
    : null;

  function init() {
    document.querySelectorAll(".wave").forEach((element) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        const node = walker.currentNode;
        if (!node.parentElement.closest("script, style, pre, code, textarea, .wave-char")) {
          nodes.push(node);
        }
      }

      let index = 0;
      nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        // Keep normal spaces and line wrapping between whole words.
        node.data.split(/(\s+)/u).forEach((word) => {
          if (!word || /^\s+$/u.test(word)) {
            fragment.append(document.createTextNode(word));
            return;
          }

          const wrapper = document.createElement("span");
          wrapper.className = "wave-word";
          const chars = segmenter
            ? Array.from(segmenter.segment(word), (part) => part.segment)
            : Array.from(word);

          chars.forEach((char) => {
            const letter = document.createElement("span");
            letter.className = "wave-char";
            letter.style.setProperty("--wave-index", index++);
            letter.textContent = char;
            wrapper.append(letter);
          });
          fragment.append(wrapper);
        });
        node.replaceWith(fragment);
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
