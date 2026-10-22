var Terminal = (function () {
  "use strict";

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function choose(items) {
    return items[randomInt(0, items.length - 1)];
  }

  function paddedId(prefix, digits) {
    return prefix + String(randomInt(0, Math.pow(10, digits) - 1)).padStart(digits, "0");
  }

  function decimal(min, max, places) {
    return (min + Math.random() * (max - min)).toFixed(places);
  }

  function formatTimestamp(date) {
    return [
      String(date.getHours()).padStart(2, "0"),
      String(date.getMinutes()).padStart(2, "0"),
      String(date.getSeconds()).padStart(2, "0")
    ].join(":") + "." + String(date.getMilliseconds()).padStart(3, "0");
  }

  var PATHS = [
    "/api/data", "/api/events", "/api/v2/search", "/checkout",
    "/dashboard", "/datasets/latest", "/login", "/metrics",
    "/orders", "/product/" + randomInt(1, 999), "/recommendations",
    "/reports/daily", "/stream/ingest", "/users/profile"
  ];

  var REGIONS = ["eu-west-1", "eu-central-1", "us-east-1", "ap-south-1"];
  var FORMATS = ["parquet", "jsonl", "avro", "csv", "protobuf"];

  var PROGRESS_TASKS = [
    ["dataset_" + randomInt(1, 999), "loading"],
    ["index_" + randomInt(1, 99), "building"],
    ["checkpoint_" + randomInt(1, 9999), "writing"],
    ["model_" + randomInt(1, 999), "loading"],
    ["partition_" + randomInt(1, 64), "rebalancing"],
    ["archive_" + randomInt(1, 999), "extracting"]
  ];

  function getEasterEggs() {
    return typeof TerminalEasterEggs !== "undefined" && Array.isArray(TerminalEasterEggs)
      ? TerminalEasterEggs
      : [];
  }

  function getEasterEggProbability() {
    var configured = typeof TerminalEasterEggProbability === "number"
      ? TerminalEasterEggProbability
      : 0.0075;
    return Math.max(0, Math.min(1, configured));
  }

  var EVENT_FACTORIES = [
    function () { return [paddedId("sensor_", 5), "temperature", decimal(-8, 42, 1) + " C"]; },
    function () { return [paddedId("sensor_", 5), "humidity", decimal(18, 98, 1) + " %"]; },
    function () { return [paddedId("sensor_", 5), "pressure", decimal(970, 1040, 1) + " hPa"]; },
    function () { return [paddedId("user_", 5), choose(["click", "view", "scroll"]), choose(PATHS)]; },
    function () { return [paddedId("session_", 7), "duration", randomInt(2, 7200) + " s"]; },
    function () { return [paddedId("node_", 3), "latency", randomInt(3, 240) + " ms"]; },
    function () { return [paddedId("node_", 3), "cpu", decimal(2, 99, 1) + " %"]; },
    function () { return [paddedId("node_", 3), "memory", decimal(0.4, 31.8, 1) + " GB"]; },
    function () { return [paddedId("worker_", 2), "processed", randomInt(1000, 999999) + " rows"]; },
    function () { return [paddedId("worker_", 2), "checkpoint", randomInt(1, 9999) + " committed"]; },
    function () { return [paddedId("request_", 5), choose(["GET", "POST", "PUT"]), choose(PATHS)]; },
    function () { return [paddedId("partition_", 2), "records", String(randomInt(10000, 9999999))]; },
    function () { return [paddedId("partition_", 2), "lag", randomInt(0, 18000) + " offsets"]; },
    function () { return ["throughput", "value", decimal(0.8, 48, 1) + " GB/s"]; },
    function () { return ["pipeline_" + randomInt(1, 24), "batch", paddedId("b-", 8)]; },
    function () { return ["topic_" + randomInt(1, 64), "messages", randomInt(100, 250000) + " received"]; },
    function () { return [paddedId("job_", 6), "runtime", decimal(0.1, 180, 2) + " s"]; },
    function () { return [paddedId("cache_", 3), "hit_rate", decimal(62, 99.9, 2) + " %"]; },
    function () { return ["storage_" + randomInt(1, 12), "write", decimal(1, 950, 1) + " MB/s"]; },
    function () { return ["schema_" + randomInt(1, 99), "validated", randomInt(5, 1800) + " fields"]; },
    function () { return [paddedId("model_", 4), "inference", decimal(1.2, 95, 1) + " ms"]; },
    function () { return [paddedId("stream_", 3), "watermark", randomInt(0, 12) + " s behind"]; },
    function () { return [choose(REGIONS), "replicated", decimal(0.2, 9.8, 1) + " TB"]; },
    function () { return [paddedId("dataset_", 4), choose(FORMATS), randomInt(12, 9800) + " partitions"]; }
  ];

  function TerminalEventGenerator() {
    this.clock = Date.now();
  }

  TerminalEventGenerator.prototype.nextTimestamp = function () {
    this.clock = Math.max(Date.now(), this.clock + randomInt(1, 9));
    return formatTimestamp(new Date(this.clock));
  };

  TerminalEventGenerator.prototype.next = function () {
    var easterEggs = getEasterEggs();
    var isEasterEgg = easterEggs.length > 0 && Math.random() < getEasterEggProbability();
    var event = isEasterEgg ? choose(easterEggs) : null;
    var fields = event
      ? [event.source, event.event, event.value]
      : choose(EVENT_FACTORIES)();

    return {
      timestamp: this.nextTimestamp(),
      source: fields[0],
      event: fields[1],
      value: fields[2]
    };
  };

  function TerminalCadence() {
    this.reset();
  }

  TerminalCadence.prototype.enterPhase = function (phase, now) {
    this.phase = phase;
    this.phaseStartedAt = now;

    if (phase === "calm") {
      this.phaseEndsAt = now + randomInt(7000, 16000);
    } else if (phase === "burst") {
      this.phaseEndsAt = now + randomInt(900, 2400);
    } else {
      this.phaseEndsAt = now + randomInt(3000, 5500);
    }
  };

  TerminalCadence.prototype.reset = function () {
    this.enterPhase("calm", performance.now());
  };

  TerminalCadence.prototype.next = function () {
    var now = performance.now();

    if (now >= this.phaseEndsAt) {
      if (this.phase === "calm") {
        this.enterPhase("burst", now);
      } else if (this.phase === "burst") {
        this.enterPhase("recovery", now);
      } else {
        this.enterPhase("calm", now);
      }
    }

    if (this.phase === "burst") {
      return {
        delay: randomInt(55, 100),
        count: Math.random() < 0.18 ? randomInt(2, 3) : 1
      };
    }

    if (this.phase === "recovery") {
      var duration = this.phaseEndsAt - this.phaseStartedAt;
      var progress = Math.min(1, (now - this.phaseStartedAt) / duration);
      return {
        delay: randomInt(
          Math.round(120 + progress * 300),
          Math.round(220 + progress * 520)
        ),
        count: 1
      };
    }

    return {
      delay: Math.random() < 0.06 ? randomInt(1200, 2000) : randomInt(420, 850),
      count: 1
    };
  };

  function createLine(data, animate) {
    var line = document.createElement("div");
    line.className = "terminal-line" + (animate ? " terminal-line-new" : "");

    [
      ["terminal-time", data.timestamp],
      ["terminal-source", data.source],
      ["terminal-event", data.event],
      ["terminal-value", data.value]
    ].forEach(function (field) {
      var span = document.createElement("span");
      span.className = field[0];
      span.textContent = field[1];
      line.appendChild(span);
    });

    return line;
  }

  function createProgressLine(generator) {
    var task = choose(PROGRESS_TASKS);
    var line = document.createElement("div");
    line.className = "terminal-line terminal-line-new terminal-progress";

    [
      ["terminal-time", generator.nextTimestamp()],
      ["terminal-source", task[0]],
      ["terminal-event", task[1]]
    ].forEach(function (field) {
      var span = document.createElement("span");
      span.className = field[0];
      span.textContent = field[1];
      line.appendChild(span);
    });

    var value = document.createElement("span");
    value.className = "terminal-value terminal-progress-value";

    var track = document.createElement("span");
    track.className = "terminal-progress-track";
    var fill = document.createElement("span");
    fill.className = "terminal-progress-fill";
    track.appendChild(fill);

    var percent = document.createElement("span");
    percent.className = "terminal-progress-percent";
    percent.textContent = "0%";

    value.appendChild(track);
    value.appendChild(percent);
    line.appendChild(value);

    return { element: line, fill: fill, percent: percent };
  }

  function TerminalController(deck, slide, generator) {
    this.deck = deck;
    this.slide = slide;
    this.generator = generator;
    this.cadence = new TerminalCadence();
    this.timer = null;
    this.activeProgress = null;
    this.nextProgressAt = performance.now() + randomInt(9000, 22000);
    this.layer = null;
    this.resizeObserver = null;
    this.createLayer();
    this.fill(false);
  }

  TerminalController.prototype.createLayer = function () {
    var parent;

    if (this.slide.classList.contains("status-terminal")) {
      // Keep the status slide's live stream in the slide itself. Reveal may
      // not have created its background layer yet when this plugin starts.
      this.slide.classList.add("terminal-inline-host");
      parent = this.slide;
    } else {
      var background = typeof this.deck.getSlideBackground === "function"
        ? this.deck.getSlideBackground(this.slide)
        : this.slide.slideBackgroundElement;

      if (background) {
        background.classList.add("terminal-background");
        parent = background.querySelector(".slide-background-content") || background;
      } else {
        this.slide.classList.add("terminal-inline-host");
        parent = this.slide;
      }
    }

    this.layer = document.createElement("div");
    this.layer.className = "terminal-stream";
    this.layer.setAttribute("aria-hidden", "true");
    parent.appendChild(this.layer);

    if (typeof ResizeObserver !== "undefined") {
      var self = this;
      this.resizeObserver = new ResizeObserver(function () {
        self.fill(false);
        self.trim();
      });
      this.resizeObserver.observe(this.layer);
    }
  };

  TerminalController.prototype.maxLines = function () {
    var style = window.getComputedStyle(this.layer);
    var lineHeight = parseFloat(style.lineHeight) || 22;
    var height = this.layer.clientHeight || window.innerHeight;
    return Math.max(12, Math.ceil(height / lineHeight) + 2);
  };

  TerminalController.prototype.appendLine = function (animate) {
    this.layer.appendChild(createLine(this.generator.next(), animate));
    this.trim();
  };

  TerminalController.prototype.fill = function (animate) {
    var target = this.maxLines();
    while (this.layer.childElementCount < target) {
      this.layer.appendChild(createLine(this.generator.next(), animate));
    }
  };

  TerminalController.prototype.trim = function () {
    var target = this.maxLines();
    while (this.layer.childElementCount > target) {
      this.layer.firstElementChild.remove();
    }
  };

  TerminalController.prototype.updateProgress = function () {
    var now = performance.now();

    if (!this.activeProgress) {
      if (now < this.nextProgressAt) {
        return false;
      }

      var progressLine = createProgressLine(this.generator);
      this.activeProgress = {
        element: progressLine.element,
        fill: progressLine.fill,
        percent: progressLine.percent,
        startedAt: now,
        duration: randomInt(3500, 7500)
      };
      this.layer.appendChild(progressLine.element);
      this.trim();
      return true;
    }

    var progress = Math.min(1, (now - this.activeProgress.startedAt) / this.activeProgress.duration);
    var percentage = Math.round(progress * 100);
    this.activeProgress.fill.style.width = percentage + "%";
    this.activeProgress.percent.textContent = percentage + "%";

    // Keep the active loader visible at the bottom during the data-stream pause.
    this.layer.appendChild(this.activeProgress.element);
    this.trim();

    if (progress >= 1) {
      this.activeProgress.element.classList.add("terminal-progress-complete");
      this.activeProgress = null;
      this.nextProgressAt = now + randomInt(14000, 32000);
      this.cadence.reset();
    }

    return true;
  };

  TerminalController.prototype.resetProgress = function () {
    if (this.activeProgress) {
      this.activeProgress.element.remove();
      this.activeProgress = null;
    }
    this.nextProgressAt = performance.now() + randomInt(9000, 22000);
  };

  TerminalController.prototype.start = function () {
    if (this.timer !== null || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    var self = this;
    function scheduleNext() {
      var step = self.activeProgress
        ? { delay: randomInt(140, 220), count: 0 }
        : self.cadence.next();

      self.timer = window.setTimeout(function () {
        self.timer = null;
        var loading = self.updateProgress();

        if (!loading) {
          for (var i = 0; i < step.count; i += 1) {
            self.appendLine(true);
          }
        }

        scheduleNext();
      }, step.delay);
    }
    scheduleNext();
  };

  TerminalController.prototype.stop = function () {
    if (this.timer !== null) {
      window.clearTimeout(this.timer);
      this.timer = null;
    }
    this.cadence.reset();
    this.resetProgress();
  };

  TerminalController.prototype.destroy = function () {
    this.stop();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  };

  function TerminalManager(deck) {
    this.deck = deck;
    this.controllers = new Map();
    this.generator = new TerminalEventGenerator();
    this.inOverview = false;
    var initialConfig = deck.getConfig();
    this.baseSlideSize = {
      width: Number(initialConfig.width),
      height: Number(initialConfig.height)
    };
    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.onMotionChange = this.onMotionChange.bind(this);
    this.fitFrame = null;
    this.scheduleStatusFit = this.scheduleStatusFit.bind(this);
    this.motionQuery.addEventListener("change", this.onMotionChange);
    window.addEventListener("resize", this.scheduleStatusFit);
  }

  TerminalManager.prototype.scheduleStatusFit = function () {
    var self = this;
    if (this.fitFrame !== null) {
      cancelAnimationFrame(this.fitFrame);
    }
    this.fitFrame = requestAnimationFrame(function () {
      self.fitFrame = null;

      var slide = self.deck.getCurrentSlide();
      var viewport = typeof self.deck.getViewportElement === "function"
        ? self.deck.getViewportElement()
        : self.deck.getRevealElement();
      if (!viewport) {
        return;
      }

      var isStatusSlide = slide && slide.classList.contains("status-terminal");
      var width = isStatusSlide ? viewport.clientWidth : self.baseSlideSize.width;
      var height = isStatusSlide ? viewport.clientHeight : self.baseSlideSize.height;
      if (!width || !height) {
        return;
      }

      var config = self.deck.getConfig();
      if (Number(config.width) !== width || Number(config.height) !== height) {
        self.deck.configure({ width: width, height: height });
      }
    });
  };

  TerminalManager.prototype.initialize = function () {
    var self = this;
    document.querySelectorAll(".reveal .slides section.terminal").forEach(function (slide) {
      if (!self.controllers.has(slide)) {
        self.controllers.set(slide, new TerminalController(self.deck, slide, self.generator));
      }
    });
    this.activate(this.deck.getCurrentSlide());
    this.scheduleStatusFit();
  };

  TerminalManager.prototype.activate = function (currentSlide) {
    var canRun = !this.inOverview && !document.hidden && !this.motionQuery.matches;
    this.controllers.forEach(function (controller, slide) {
      if (canRun && slide === currentSlide) {
        controller.start();
      } else {
        controller.stop();
      }
    });
  };

  TerminalManager.prototype.onMotionChange = function () {
    this.controllers.forEach(function (controller) {
      controller.stop();
      controller.fill(false);
      controller.trim();
    });
    this.activate(this.deck.getCurrentSlide());
  };

  TerminalManager.prototype.destroy = function () {
    this.motionQuery.removeEventListener("change", this.onMotionChange);
    window.removeEventListener("resize", this.scheduleStatusFit);
    if (this.fitFrame !== null) {
      cancelAnimationFrame(this.fitFrame);
      this.fitFrame = null;
    }
    this.controllers.forEach(function (controller) { controller.destroy(); });
    this.controllers.clear();
  };

  var manager = null;
  var visibilityHandler = null;

  return {
    id: "terminal",

    init: function (deck) {
      manager = new TerminalManager(deck);

      deck.on("ready", function () {
        manager.initialize();
      });

      // Reveal can become ready before this plugin's handler runs. In that
      // case the event has already passed, leaving status content visible but
      // never creating its animated terminal stream until a later reload.
      if (typeof deck.isReady === "function" && deck.isReady()) {
        manager.initialize();
      }

      deck.on("slidechanged", function (event) {
        manager.activate(event.currentSlide);
        manager.scheduleStatusFit();
      });

      deck.on("overviewshown", function () {
        manager.inOverview = true;
        manager.activate(null);
      });

      deck.on("overviewhidden", function () {
        manager.inOverview = false;
        manager.activate(deck.getCurrentSlide());
      });

      visibilityHandler = function () {
        manager.activate(deck.getCurrentSlide());
      };
      document.addEventListener("visibilitychange", visibilityHandler);
    },

    destroy: function () {
      if (visibilityHandler) {
        document.removeEventListener("visibilitychange", visibilityHandler);
      }
      if (manager) {
        manager.destroy();
      }
      visibilityHandler = null;
      manager = null;
    }
  };
})();
