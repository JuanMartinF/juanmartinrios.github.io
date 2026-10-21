/* ============================================================
   PROCESO — La pintura como algoritmo
   Secuencia documental + dos estudios web deterministas.

   La operación cromática es el grupo de Klein Z₂ × Z₂:
     A = 00 (identidad), R = 01, N = 10, V = 11
   La suma es XOR y se aplica componente a componente.
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var compact = window.matchMedia("(max-width: 768px)");

  var COLORS = {
    A: "#67b7c0",
    R: "#96372c",
    N: "#c46b2e",
    V: "#547d49"
  };

  var VALUES = { A: 0, R: 1, N: 2, V: 3 };
  var LETTERS = ["A", "R", "N", "V"];

  function pad(value) {
    return String(value).padStart(2, "0");
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function framePath(index) {
    return "slices/web/slice_" + String(index).padStart(3, "0") + ".webp";
  }

  /* ---------- Secuencia documental ------------------------- */

  function initProceso() {
    var section = document.querySelector("[data-proceso]");
    if (!section) return;

    var viewer = section.querySelector(".proceso-imagen");
    var layers = [
      section.querySelector("[data-frame-a]"),
      section.querySelector("[data-frame-b]")
    ];
    var counter = section.querySelector("[data-proceso-actual]");
    var phase = section.querySelector("[data-proceso-fase]");
    var progress = section.querySelector("[data-proceso-progreso]");
    var range = section.querySelector("[data-proceso-range]");
    var previous = section.querySelector("[data-proceso-anterior]");
    var next = section.querySelector("[data-proceso-siguiente]");
    var chapters = Array.prototype.slice.call(section.querySelectorAll(".proceso-paso"));

    var current = 1;
    var activeLayer = 0;
    var swapToken = 0;
    var ticking = false;
    var loaded = { 1: true };

    var phaseForFrame = function (index) {
      for (var i = 0; i < chapters.length; i += 1) {
        var from = Number(chapters[i].dataset.from);
        var to = Number(chapters[i].dataset.to);
        if (index >= from && index <= to) return chapters[i].dataset.fase;
      }
      return "Proceso";
    };

    function preload(index) {
      if (index < 1 || index > 22 || loaded[index]) return;
      var image = new Image();
      image.src = framePath(index);
      image.onload = function () { loaded[index] = true; };
    }

    function preloadSequence() {
      // First make the immediate interaction instant, then fill the cache at idle.
      [2, 3, 11, 14, 19, 22].forEach(preload);
      var loadRest = function () {
        for (var i = 1; i <= 22; i += 1) preload(i);
      };
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(loadRest, { timeout: 1800 });
      } else {
        window.setTimeout(loadRest, 350);
      }
    }

    function updateChapter(index) {
      chapters.forEach(function (chapter) {
        var from = Number(chapter.dataset.from);
        var to = Number(chapter.dataset.to);
        chapter.classList.toggle("activo", index >= from && index <= to);
      });
    }

    function updateMetadata(index) {
      counter.textContent = pad(index);
      phase.textContent = phaseForFrame(index);
      progress.style.transform = "scaleX(" + ((index - 1) / 21) + ")";
      range.value = index;
      viewer.setAttribute(
        "aria-label",
        "Secuencia documental del proceso pictórico. Estado " + index + " de 22. " + phaseForFrame(index) + "."
      );
      previous.disabled = index === 1;
      next.disabled = index === 22;
      updateChapter(index);
    }

    function showFrame(index, immediate) {
      index = clamp(Math.round(index), 1, 22);
      if (index === current && !immediate) return;

      current = index;
      updateMetadata(index);
      preload(index - 1);
      preload(index + 1);

      var token = ++swapToken;
      var incomingIndex = activeLayer === 0 ? 1 : 0;
      var incoming = layers[incomingIndex];
      var outgoing = layers[activeLayer];
      var src = framePath(index);

      var reveal = function () {
        if (token !== swapToken) return;
        incoming.classList.add("activo");
        outgoing.classList.remove("activo");
        activeLayer = incomingIndex;
      };

      incoming.onload = reveal;
      incoming.src = src;
      if (incoming.complete) reveal();
    }

    function frameFromScroll() {
      if (compact.matches || reduceMotion) return;

      var anchor = window.innerHeight * 0.52;
      var best = null;
      var distance = Infinity;

      chapters.forEach(function (chapter) {
        var rect = chapter.getBoundingClientRect();
        var chapterDistance = Math.abs((rect.top + rect.height * 0.5) - anchor);
        if (chapterDistance < distance) {
          distance = chapterDistance;
          best = { chapter: chapter, rect: rect };
        }
      });

      if (!best) return;
      var from = Number(best.chapter.dataset.from);
      var to = Number(best.chapter.dataset.to);
      var local = clamp((anchor - best.rect.top) / best.rect.height, 0, 0.999);
      showFrame(from + Math.floor(local * (to - from + 1)));
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(function () {
        frameFromScroll();
        ticking = false;
      });
    }

    // Controls read the public range value, so they remain authoritative even
    // if a pending scroll frame was calculated just before a viewport resize.
    previous.addEventListener("click", function () {
      showFrame(Number(range.value) - 1, true);
    });
    next.addEventListener("click", function () {
      showFrame(Number(range.value) + 1, true);
    });
    range.addEventListener("input", function () {
      showFrame(Number(range.value), true);
    });
    viewer.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showFrame(current - 1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showFrame(current + 1);
      }
    });

    if ("IntersectionObserver" in window) {
      var preloader = new IntersectionObserver(function (entries) {
        if (entries.some(function (entry) { return entry.isIntersecting; })) {
          preloadSequence();
          preloader.disconnect();
        }
      }, { rootMargin: "600px 0px" });
      preloader.observe(section);
    } else {
      preloadSequence();
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    showFrame(1, true);
    window.setTimeout(frameFromScroll, 80);
  }

  /* ---------- Utilidades canvas ---------------------------- */

  function fitCanvas(canvas, draw) {
    var resize = function () {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var width = Math.max(320, Math.round(rect.width));
      var height = Math.max(240, Math.round(rect.height));
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      var ctx = canvas.getContext("2d");
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, width, height);
    };

    if ("ResizeObserver" in window) {
      new ResizeObserver(resize).observe(canvas);
    } else {
      window.addEventListener("resize", resize);
    }
    resize();
    return resize;
  }

  /* ---------- Estudio 01: grupo de Klein ------------------- */

  function initKlein() {
    var study = document.querySelector("[data-klein]");
    if (!study) return;

    var canvas = study.querySelector("[data-klein-canvas]");
    var selectA = study.querySelector("[data-klein-a]");
    var selectB = study.querySelector("[data-klein-b]");
    var output = study.querySelector("[data-klein-resultado]");
    var stepButtons = Array.prototype.slice.call(study.querySelectorAll("[data-klein-paso]"));
    var steps = [1, 2, 4, 8];
    var rows = 8;
    var linen = "#d3c6af";
    var ink = "rgba(72, 58, 42, 0.5)";
    var pairs = [];

    LETTERS.forEach(function (first) {
      LETTERS.forEach(function (second) {
        pairs.push(first + second);
      });
    });

    pairs.forEach(function (pair) {
      var optionA = document.createElement("option");
      var optionB = document.createElement("option");
      optionA.value = optionA.textContent = pair;
      optionB.value = optionB.textContent = pair;
      selectA.appendChild(optionA);
      selectB.appendChild(optionB);
    });

    selectA.value = "RR";
    selectB.value = "RN";

    var dimensions = null;
    var target = -1;
    var shown = -1;
    var appear = 1;
    var animId = 0;
    var playback = 0;
    var started = false;

    function addLetters(a, b) {
      return LETTERS[VALUES[a] ^ VALUES[b]];
    }

    function addPairs(a, b) {
      return addLetters(a[0], b[0]) + addLetters(a[1], b[1]);
    }

    // Pasos 1 y 2 ejecutan α. En el 4 entra β sobre los lóbulos impares.
    // En el 8 la suma ocupa todo el campo.
    function letterFor(row, col, step, pairA, pairB) {
      if (step < 0 || row >= steps[step]) return null;
      var a = pairA[col % 2];
      var b = pairB[col % 2];
      if (step < 2) return a;
      if (step === 2) return col % 2 ? addLetters(a, b) : a;
      return addLetters(a, b);
    }

    function geometry(width, height) {
      var left = Math.round(width * 0.06);
      var top = Math.round(height * 0.07);
      var fieldW = width - left * 2;
      var fieldH = height - top * 2;
      var cols = width < 520 ? 7 : 11;
      return {
        left: left,
        top: top,
        fieldW: fieldW,
        fieldH: fieldH,
        cols: cols,
        cellW: fieldW / cols,
        cellH: fieldH / rows
      };
    }

    function paint() {
      if (!dimensions) return;
      var ctx = dimensions.ctx;
      var width = dimensions.width;
      var height = dimensions.height;
      var geom = geometry(width, height);
      var pairA = selectA.value;
      var pairB = selectB.value;
      var amplitude = geom.cellH * 0.18;
      var thickness = geom.cellH * 0.42;
      var row;
      var col;

      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = linen;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.beginPath();
      ctx.rect(geom.left, geom.top, geom.fieldW, geom.fieldH);
      ctx.clip();

      function waveY(x, rowIndex) {
        var yMid = geom.top + (rowIndex + 0.5) * geom.cellH;
        var phase = ((x - geom.left) / geom.cellW) * Math.PI * 2;
        return yMid + Math.sin(phase) * amplitude;
      }

      function trace(rowIndex, x0, x1) {
        var steps = 8;
        var i;
        var x;
        ctx.beginPath();
        for (i = 0; i <= steps; i += 1) {
          x = x0 + (x1 - x0) * (i / steps);
          if (i === 0) ctx.moveTo(x, waveY(x, rowIndex));
          else ctx.lineTo(x, waveY(x, rowIndex));
        }
      }

      ctx.strokeStyle = ink;
      ctx.lineWidth = 1.15;
      ctx.lineCap = "butt";
      ctx.lineJoin = "round";
      for (row = 0; row < rows; row += 1) {
        trace(row, geom.left, geom.left + geom.fieldW);
        ctx.stroke();
      }

      function fillLobe(rowIndex, colIndex, letter, alpha) {
        if (!letter || alpha <= 0) return;
        var x0 = geom.left + colIndex * geom.cellW;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.strokeStyle = COLORS[letter];
        ctx.lineWidth = thickness;
        ctx.lineCap = "butt";
        trace(rowIndex, x0 - 0.5, x0 + geom.cellW + 0.5);
        ctx.stroke();
        ctx.restore();
      }

      for (row = 0; row < rows; row += 1) {
        for (col = 0; col < geom.cols; col += 1) {
          var now = letterFor(row, col, target, pairA, pairB);
          var was = letterFor(row, col, shown, pairA, pairB);
          if (appear >= 1) {
            fillLobe(row, col, now, 1);
          } else if (was && !now) {
            fillLobe(row, col, was, 1 - appear);
          } else if (was && now && was !== now) {
            fillLobe(row, col, was, 1);
            fillLobe(row, col, now, appear);
          } else if (now) {
            fillLobe(row, col, now, was ? 1 : appear);
          }
        }
      }

      ctx.restore();
    }

    function updateLabel() {
      var result = addPairs(selectA.value, selectB.value);
      var paso = target < 0 ? 1 : steps[target];
      output.textContent = result;
      output.setAttribute(
        "aria-label",
        selectA.value + " más " + selectB.value + " es igual a " + result
      );
      canvas.setAttribute(
        "aria-label",
        "Paso " + paso + ". " + selectA.value + " más " + selectB.value + " es igual a " + result + "."
      );
    }

    function setPressed(step) {
      stepButtons.forEach(function (button, index) {
        button.setAttribute("aria-pressed", index === step ? "true" : "false");
      });
    }

    function goTo(step, animate) {
      if (step === target && appear === 1) {
        setPressed(step);
        updateLabel();
        paint();
        return;
      }
      shown = target;
      target = step;
      setPressed(step);
      updateLabel();
      animId += 1;
      if (!animate || reduceMotion) {
        appear = 1;
        shown = step;
        paint();
        return;
      }
      appear = 0;
      var start = performance.now();
      var id = animId;
      var frame = function (time) {
        if (id !== animId) return;
        appear = clamp((time - start) / 460, 0, 1);
        paint();
        if (appear < 1) window.requestAnimationFrame(frame);
        else shown = target;
      };
      window.requestAnimationFrame(frame);
    }

    function play() {
      var id = ++playback;
      started = true;
      [0, 1, 2, 3].forEach(function (step, index) {
        window.setTimeout(function () {
          if (id !== playback) return;
          goTo(step, true);
        }, index * 820);
      });
    }

    function redraw(ctx, width, height) {
      dimensions = { ctx: ctx, width: width, height: height };
      paint();
    }

    stepButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        playback += 1;
        started = true;
        goTo(Number(button.dataset.kleinPaso), !reduceMotion);
      });
    });

    function onRuleChange() {
      updateLabel();
      if (reduceMotion) {
        playback += 1;
        goTo(3, false);
      } else {
        play();
      }
    }

    selectA.addEventListener("change", onRuleChange);
    selectB.addEventListener("change", onRuleChange);
    fitCanvas(canvas, redraw);
    updateLabel();

    function watchPlayback() {
      if (started || reduceMotion) return;
      var rect = study.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.82 && rect.bottom > window.innerHeight * 0.18) {
        play();
        window.removeEventListener("scroll", watchPlayback);
      }
    }

    if (reduceMotion) {
      goTo(3, false);
    } else {
      window.addEventListener("scroll", watchPlayback, { passive: true });
      watchPlayback();
    }
  }

  /* ---------- Estudio 02: simetría recursiva --------------- */

  function initSimetria() {
    var study = document.querySelector("[data-simetria]");
    if (!study) return;

    var canvas = study.querySelector("[data-simetria-canvas]");
    var scale = study.querySelector("[data-simetria-escala]");
    var sequence = study.querySelector("[data-simetria-secuencia]");
    var buttons = Array.prototype.slice.call(study.querySelectorAll("[data-transform]"));
    var reset = study.querySelector("[data-simetria-reset]");
    var operations = [];
    var dimensions = null;
    var growth = 1;
    var growthStart = 0;
    var oldCount = 1;

    var names = { h: "H", v: "V", r: "R₂" };
    var operationValues = { h: 1, v: 2, r: 3 };
    var stateColors = ["#67b7c0", "#96372c", "#c46b2e", "#547d49"];

    function layout(count) {
      if (count === 1) return { cols: 1, rows: 1 };
      if (count === 2) return { cols: 2, rows: 1 };
      if (count === 4) return { cols: 2, rows: 2 };
      return { cols: 4, rows: 2 };
    }

    function stateForCell(cell) {
      var state = 0;
      for (var bit = 0; bit < operations.length; bit += 1) {
        if (cell & (1 << bit)) state ^= operationValues[operations[bit]];
      }
      return state;
    }

    function drawModule(ctx, x, y, width, height, state, alpha) {
      var sx = state === 2 || state === 3 ? -1 : 1;
      var sy = state === 1 || state === 3 ? -1 : 1;
      var color = stateColors[state];

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(x + width / 2, y + height / 2);
      ctx.scale(sx, sy);
      ctx.translate(-width / 2, -height / 2);

      var marginX = width * 0.13;
      var centerY = height * 0.50;
      var amplitude = height * 0.20;

      ctx.beginPath();
      ctx.moveTo(marginX, centerY);
      ctx.bezierCurveTo(
        width * 0.27, centerY - amplitude,
        width * 0.40, centerY - amplitude,
        width * 0.50, centerY
      );
      ctx.bezierCurveTo(
        width * 0.60, centerY + amplitude,
        width * 0.73, centerY + amplitude,
        width - marginX, centerY
      );
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = Math.max(10, height * 0.17);
      ctx.strokeStyle = color;
      ctx.stroke();

      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(236,228,211,.26)";
      ctx.stroke();

      // The inner articulation: two symmetries joined as one module.
      ctx.beginPath();
      ctx.moveTo(width * 0.46, centerY - height * 0.10);
      ctx.lineTo(width * 0.54, centerY + height * 0.10);
      ctx.strokeStyle = "rgba(11,10,8,.48)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }

    function drawStudy(ctx, width, height, amount) {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "#0e0c09";
      ctx.fillRect(0, 0, width, height);

      var count = Math.pow(2, operations.length);
      var grid = layout(count);
      var margin = Math.max(24, width * 0.055);
      var fieldW = width - margin * 2;
      var fieldH = height - margin * 2;
      var gap = Math.max(5, Math.min(12, width * 0.012));
      var cellW = (fieldW - gap * (grid.cols - 1)) / grid.cols;
      var cellH = (fieldH - gap * (grid.rows - 1)) / grid.rows;

      for (var row = 0; row < grid.rows; row += 1) {
        for (var col = 0; col < grid.cols; col += 1) {
          var index = row * grid.cols + col;
          if (index >= count) continue;
          var x = margin + col * (cellW + gap);
          var y = margin + row * (cellH + gap);
          var alpha = index < oldCount ? 1 : amount;

          ctx.strokeStyle = "rgba(236,228,211," + (0.08 * alpha) + ")";
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, cellW, cellH);
          drawModule(ctx, x, y, cellW, cellH, stateForCell(index), alpha);
        }
      }

    }

    function animate(time) {
      if (!dimensions) return;
      growth = reduceMotion ? 1 : clamp((time - growthStart) / 650, 0, 1);
      var eased = 1 - Math.pow(1 - growth, 3);
      drawStudy(dimensions.ctx, dimensions.width, dimensions.height, eased);
      if (growth < 1) window.requestAnimationFrame(animate);
    }

    function redraw(ctx, width, height) {
      dimensions = { ctx: ctx, width: width, height: height };
      drawStudy(ctx, width, height, growth);
    }

    function updateInterface() {
      var count = Math.pow(2, operations.length);
      scale.textContent = count;
      sequence.textContent = operations.length
        ? operations.map(function (op) { return names[op]; }).join(" → ")
        : "módulo";
      buttons.forEach(function (button) {
        button.disabled = count >= 8;
      });
      reset.disabled = operations.length === 0;
    }

    function apply(operation) {
      var count = Math.pow(2, operations.length);
      if (count >= 8) return;
      oldCount = count;
      operations.push(operation);
      growth = 0;
      growthStart = performance.now();
      updateInterface();
      window.requestAnimationFrame(animate);
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        apply(button.dataset.transform);
      });
    });

    reset.addEventListener("click", function () {
      operations = [];
      oldCount = 1;
      growth = 1;
      updateInterface();
      if (dimensions) drawStudy(dimensions.ctx, dimensions.width, dimensions.height, 1);
    });

    fitCanvas(canvas, redraw);
    updateInterface();
  }

  function init() {
    initProceso();
    initKlein();
    initSimetria();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
