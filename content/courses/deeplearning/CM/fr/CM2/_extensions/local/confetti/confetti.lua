-- _extensions/confetti/confetti.lua
--
-- Quarto/Pandoc filter: auto-inject canvas-confetti for Reveal.js
-- Triggers on fragments with class ".confetti"
-- Optional per-fragment overrides via:
--   data-confetti='{"particleCount":500,"spread":100,"origin":{"y":0.7}}'
-- Exposes window.confettiBurst() for buttons.

local MARKER = "quarto-confetti-injected"

local function is_reveal_or_html(fmt)
  fmt = fmt or FORMAT or ""
  fmt = tostring(fmt)
  -- Quarto revealjs often sets FORMAT = "revealjs"
  if fmt:match("revealjs") then return true end
  if fmt:match("html") then return true end
  return false
end

local function ensure_meta_list(x)
  if x == nil then
    return pandoc.MetaList({})
  end
  if x.t == "MetaList" then
    return x
  end
  return pandoc.MetaList({ x })
end

local function meta_contains_marker(meta_list)
  if meta_list == nil or meta_list.t ~= "MetaList" then
    return false
  end

  for _, item in ipairs(meta_list) do
    -- item can be MetaBlocks / MetaInlines / MetaString etc.
    if item.t == "MetaBlocks" then
      for _, b in ipairs(item) do
        if b.t == "RawBlock" and tostring(b.text):find(MARKER, 1, true) then
          return true
        end
      end
    elseif item.t == "MetaInlines" then
      for _, i in ipairs(item) do
        if i.t == "RawInline" and tostring(i.text):find(MARKER, 1, true) then
          return true
        end
      end
    elseif item.t == "MetaString" then
      if tostring(item.text):find(MARKER, 1, true) then
        return true
      end
    end
  end

  return false
end

return {
  Pandoc = function(doc)
    if not is_reveal_or_html(FORMAT) then
      return doc
    end

    doc.meta = doc.meta or pandoc.Meta({})

    local hi = ensure_meta_list(doc.meta["header-includes"])
    if meta_contains_marker(hi) then
      doc.meta["header-includes"] = hi
      return doc
    end

    local html = [[
<!-- ]] .. MARKER .. [[ -->
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.3/dist/confetti.browser.min.js"></script>
<script>
(function () {
  if (window.__quarto_confetti_init__) return;
  window.__quarto_confetti_init__ = true;

  // Debug (décommente si besoin)
  // console.log("[confetti] init ok");

  window.confettiBurst = function (opts) {
    if (typeof window.confetti !== "function") return;

    // Ajustés pour limiter le fade perceptible
    var defaults = {
      particleCount: 200,
      spread: 100,
      origin: { y: 0.7 }

    };

    try {
      window.confetti(Object.assign({}, defaults, (opts || {})));
    } catch (e) {}
  };

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.Reveal) return;

    function parseMaybeJSON(s) {
      if (!s) return {};
      var t = String(s).trim();
      if (t === "") return {};
      try { return JSON.parse(t); } catch (e) { return {}; }
    }

    Reveal.on("fragmentshown", function (event) {
      var frag = event && event.fragment;
      if (!frag) return;

      // Option 3: class ".confetti"
      if (!frag.classList || !frag.classList.contains("confetti")) return;

      // Optional overrides
      var optsText =
        (frag.getAttribute && (frag.getAttribute("data-confetti") || frag.getAttribute("confetti"))) || "";

      window.confettiBurst(parseMaybeJSON(optsText));
    });
  });
})();
</script>
]]

    hi:insert(pandoc.MetaBlocks({ pandoc.RawBlock("html", html) }))
    doc.meta["header-includes"] = hi
    return doc
  end
}
