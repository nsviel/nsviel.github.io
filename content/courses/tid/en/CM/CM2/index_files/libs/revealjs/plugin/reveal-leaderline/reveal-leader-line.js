// Reveal plugin entrypoint
window.RevealLeaderline = function () {
  return {
    id: "RevealLeaderline",
    init: function (deck) {
      revealleaderlineinit(deck);
    },
  };
};

// Global store (ok si tu veux le garder global)
var leaderline_vector = [];

function revealleaderlineinit(deck) {
  const leaderline_default_values = {
    drawEffect: "none",
    animateDuration: 1000,
    color: "orange",
    labelPosition: "middle",
    endSocket: "auto",
    startSocket: "auto",
  };

  // convert integers to number (tu ne convertis plus réellement ici, je garde ton comportement)
  function convertIntObj(obj) {
    const res = {};
    for (const key in obj) {
      res[key] = obj[key];
    }
    return res;
  }

  function convertToCamelCase(inputString) {
    return inputString
      .split("-")
      .map((word, index) =>
        index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join("");
  }

  function convertAttributesToData(element) {
    for (let i = element.attributes.length - 1; i >= 0; i--) {
      const attr = element.attributes[i];
      if (
        attr.name === "class" ||
        attr.name === "id" ||
        Object.keys(element.dataset).includes(attr.name)
      ) {
        continue;
      }
      if (!attr.name.startsWith("data-")) {
        const name = convertToCamelCase(attr.name);
        element.dataset[name] = attr.value;
        element.removeAttribute(attr.name);
      }
    }
  }

  // parse style
  function parseStyle(style) {
    let output = {};
    if (style == null) return output;

    style = String(style).trim();
    if (!style) return output;

    if (style[0] === "{") {
      style = style.replace(/^\{|\}$/g, "");
    }

    style.split(/[,;](?![^{]*})/).forEach((s) => {
      const idx = s.indexOf(":");
      if (idx === -1) {
        // pas de "key: value" → on ignore ou on retourne brut
        return;
      }

      const key = s.slice(0, idx).trim();
      let value = s.slice(idx + 1).trim();

      if (value[0] === "{") {
        value = parseStyle(value);
      } else {
        if (/^\d+(\.\d+)?$/.test(value)) {
          value = value.includes(".") ? parseFloat(value) : parseInt(value, 10);
        } else if (value === "true" || value === "false") {
          value = value === "true";
        }
      }
      output[key] = value;
    });

    return output;
  }

  function retrieveBorder(df, type = "start") {
    const dom = typeof df[type] === "object" ? df[type] : document.querySelector(df[type]);
    if (!dom) return null;

    let out = dom;
    if (df[type + "BorderStyle"] !== undefined) {
      df[type + "Border"] = "true";
      out = LeaderLine.areaAnchor(dom, parseStyle(df[type + "BorderStyle"]));
    } else if (df[type + "Border"] === "true") {
      out = LeaderLine.areaAnchor(dom);
    }
    return out;
  }

  function findSlideId(element) {
    let parent = element.parentNode;
    while (parent && parent.tagName !== "SECTION") {
      parent = parent.parentNode;
    }
    return parent ? parent.id : "";
  }

  function addText(df, line) {
    if (!["start", "middle", "end"].includes(df.labelPosition)) {
      df.labelPosition = "middle";
    }

    ["path", "caption"].forEach((type) => {
      const labelKey = type + "Label";
      if (df[labelKey] !== undefined) {
        if (df.labelStyle !== undefined) {
          line[df.labelPosition + "Label"] = LeaderLine[type + "Label"](
            String(df[labelKey]),
            parseStyle(df.labelStyle)
          );
        } else {
          line[df.labelPosition + "Label"] = LeaderLine[type + "Label"](String(df[labelKey]));
        }
      }
    });

    return line;
  }

  const leaderline_attributes_history = {};

  function updateLine(line, updates) {
    if (!line) return;

    const oldAtt = {};
    const df = convertIntObj(updates.dataset);

    for (const key in line) {
      if (typeof line[key] !== "function") {
        oldAtt[key] = line[key];
        if (df[key] === undefined) df[key] = line[key];
      }
    }

    const start = retrieveBorder(df, "start");
    const end = retrieveBorder(df, "end");

    oldAtt.fragment = updates.dataset.fragmentIndex;
    oldAtt.start = line.start;
    oldAtt.end = line.end;

    if (!line.lineid) return;
    if (!leaderline_attributes_history[line.lineid]) leaderline_attributes_history[line.lineid] = [];
    leaderline_attributes_history[line.lineid].push(oldAtt);

    line.setOptions(convertIntObj(updates.dataset));
    if (start) line.start = start;
    if (end) line.end = end;
    addText(df, line);

    if (df.action === "hide") line.hide();
    else if (df.action === "show") line.show();
  }

  // -------------------------
  // IMPORTANT: run after Reveal is ready
  // -------------------------
  deck.on("ready", () => {
    // get leaderLine lines
    const leaderlineSpans = document.querySelectorAll("span.leaderline:not(.setAttribute)");
    leaderlineSpans.forEach((d) => {
      convertAttributesToData(d);
      d.dataset.slideId = findSlideId(d);

      // scope selectors to slide
      if (d.dataset.start) d.dataset.start = "#" + d.dataset.slideId + " " + d.dataset.start;
      if (d.dataset.end) d.dataset.end = "#" + d.dataset.slideId + " " + d.dataset.end;

      if (d.dataset.lineid !== undefined) {
        d.dataset.lineid = d.dataset.slideId + "_" + d.dataset.lineid;
      }

      for (const key in leaderline_default_values) {
        if (d.dataset[key] === undefined) d.dataset[key] = leaderline_default_values[key];
      }
    });

    const leaderlineSetAttribute = document.querySelectorAll("span.leaderline.setAttribute");
    leaderlineSetAttribute.forEach((d) => {
      convertAttributesToData(d);
      d.dataset.slideId = findSlideId(d);

      if (d.dataset.lineid !== undefined) {
        d.dataset.lineid = d.dataset.slideId + "_" + d.dataset.lineid;
      }
      if (d.dataset.start !== undefined) {
        d.dataset.start = "#" + d.dataset.slideId + " " + d.dataset.start;
      }
      if (d.dataset.end !== undefined) {
        d.dataset.end = "#" + d.dataset.slideId + " " + d.dataset.end;
      }
    });

    // add fragment class if it is missing but index is defined
    document
      .querySelectorAll("span.leaderline:not(.fragment)[data-index]")
      .forEach((d) => d.classList.add("fragment"));

    // match parent's fragment if it is not defined
    document.querySelectorAll(".fragment:has(.leaderline:not(.fragment))").forEach((d) =>
      d.querySelectorAll(".leaderline:not(.fragment)").forEach((dd) => {
        dd.classList.add("fragment");
        dd.dataset.fragmentIndex = d.dataset.fragmentIndex;
        dd.dataset.index = dd.dataset.fragmentIndex;
      })
    );

    leaderlineSetAttribute.forEach((d) => (d.dataset.fragmentIndex = d.dataset.index));

    // build lines
    leaderlineSpans.forEach((d) => {
      d.dataset.fragmentIndex = d.dataset.index;

      const df = convertIntObj(d.dataset);
      const start = retrieveBorder(df, "start");
      const end = retrieveBorder(df, "end");
      if (!start || !end) return;

      const line = new LeaderLine(start, end);

      // set options
      for (const key in df) {
        // NB: ta condition originale (key!= start | key!= end) n'avait pas de sens (start/end sont des objets)
        // Je laisse simplement appliquer les options parseables
        if (key === "start" || key === "end") continue;
        const value = parseStyle(df[key]);
        // si parseStyle renvoie {}, ça peut casser certaines propriétés ; on applique brut sinon
        line[key] = (value && Object.keys(value).length) ? value : df[key];
      }

      addText(df, line);
      d.setAttribute("data-line-index", line._id);

      if (df.lineid !== undefined) {
        line.lineid = df.lineid;
        leaderline_attributes_history[df.lineid] = [];

        const svg = document.querySelector(
          "svg.leader-line:has(#leader-line-" + line._id + "-line-path)"
        );
        if (svg) svg.id = df.lineid;
      }

      if (df.lineclass !== undefined) {
        const svg = document.querySelector(
          "svg.leader-line:has(#leader-line-" + line._id + "-line-path)"
        );
        if (svg) svg.classList.add(df.lineclass);
      }

      if (df.link !== undefined) {
        const linkedObj = document.querySelector(df.link);
        if (linkedObj && linkedObj.classList.contains("fragment")) {
          d.dataset.fragmentIndex = linkedObj.dataset.fragmentIndex;
          d.classList.add("fragment");
        }
      }

      leaderline_vector.push(line);
    });

    // hide all lines
    leaderline_vector.forEach((d) => d.hide("none"));

    // only show current lines on current slide
    const curr = deck.getCurrentSlide();
    if (curr) {
      const slideLines = curr.querySelectorAll(
        "span.leaderline:not(.setAttribute, .fragment), span.leaderline.fragment.visible:not(.setAttribute)"
      );
      slideLines.forEach((d) => {
        const line = leaderline_vector[d.dataset.lineIndex - 1];
        if (line) line.show();
      });
    }

    // z index of lines
    document
      .querySelectorAll("svg.leader-line, svg.leader-line-areaAnchor")
      .forEach((d) => (d.style.zIndex = 100));
  });

  // -------------------------
  // Sync with Reveal (use deck events)
  // -------------------------
  deck.on("slidechanged", (event) => {
    leaderline_vector.forEach((d) => d.position());

    const curr = event.currentSlide || deck.getCurrentSlide();
    if (!curr) return;

    const slideLines = curr.querySelectorAll(
      "span.leaderline:not(.setAttribute, .fragment), span.leaderline.fragment.visible:not(.setAttribute)"
    );
    slideLines.forEach((d) => {
      const line = leaderline_vector[d.dataset.lineIndex - 1];
      if (!line) return;
      line.show(d.dataset.drawEffect, { duration: d.dataset.animateDuration });
    });

    if (event.previousSlide) {
      const slideLinesB = event.previousSlide.querySelectorAll(".leaderline:not(.setAttribute)");
      slideLinesB.forEach((d) => leaderline_vector[d.dataset.lineIndex - 1]?.hide("none"));
    }

    if (curr.querySelectorAll(".fragment.visible").length > 0) {
      const s = curr.querySelectorAll("span.leaderline:not(.setAttribute)[data-lineid]");
      s.forEach((ss) => {
        const atts = curr.querySelectorAll(
          ".leaderline.setAttribute[data-lineid='" + ss.dataset.lineid + "']"
        );
        const line = leaderline_vector[ss.dataset.lineIndex - 1];
        if (!line || !line.lineid) return;

        leaderline_attributes_history[line.lineid] = [];
        updateLine(line, ss);
        atts.forEach((fragment) => updateLine(line, fragment));
      });
    }
  });

  deck.on("fragmentshown", (event) => {
    const curr = event.currentSlide || deck.getCurrentSlide();
    if (!curr) return;

    const currIndex = curr.dataset.fragment;
    const fragmentLines = curr.querySelectorAll(
      "span.leaderline:not(.setAttribute)[data-fragment-index='" + currIndex + "']"
    );
    fragmentLines.forEach((d) => {
      leaderline_vector[d.dataset.lineIndex - 1]?.show(d.dataset.drawEffect, {
        duration: d.dataset.animateDuration,
      });
    });

    (event.fragments || []).forEach((fragment) => {
      if (fragment.classList.contains("leaderline") && fragment.classList.contains("setAttribute")) {
        const line = leaderline_vector.find((d) => d.lineid == fragment.dataset.lineid);
        updateLine(line, fragment);
        if (fragment.dataset.action === "hide") line?.hide();
        else if (fragment.dataset.action === "show") line?.show();
      }
    });
  });

  deck.on("fragmenthidden", (event) => {
    const curr = event.currentSlide || deck.getCurrentSlide();
    if (!curr) return;

    const perIndex = parseInt(curr.dataset.fragment || "0", 10) + 1;
    const fragmentLines = curr.querySelectorAll(
      "span.leaderline:not(.setAttribute)[data-fragment-index='" + perIndex + "']"
    );
    fragmentLines.forEach((d) => leaderline_vector[d.dataset.lineIndex - 1]?.hide());

    (event.fragments || []).forEach((fragment) => {
      if (fragment.classList.contains("leaderline") && fragment.classList.contains("setAttribute")) {
        const line = leaderline_vector.find((d) => d.lineid == fragment.dataset.lineid);
        if (!line || !line.lineid) return;

        const hist = leaderline_attributes_history[line.lineid] || [];
        const oldAtt = hist[hist.length - 1];
        if (!oldAtt) return;

        line.setOptions(convertIntObj(oldAtt));
        line.start = oldAtt.start;
        line.end = oldAtt.end;
        addText(oldAtt, line);
        hist.pop();

        if (fragment.dataset.action === "hide") line.show();
        else if (fragment.dataset.action === "show") line.hide();
      }
    });
  });

  // Printing / resize
  // (deprecated addListener, mais je garde ta logique)
  window.matchMedia("print").addListener(function (media) {
    if (media.matches) {
      window.dispatchEvent(new Event("resize"));
      leaderline_vector.forEach((d) => d.show());
    }
  });

  deck.on("resize", () => {
    leaderline_vector.forEach((d) => d.position());
  });
}
