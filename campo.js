/* ============================================================
   CAMPO — interacciones de la galería de Juan Martín Ríos
   1. El Campo: malla triangular ondulante (paisaje de onda)
   2. Aparición al hacer scroll
   3. Galerías con fundido [data-slider]
   4. Menú móvil
   5. Colapsables de los escritos
   6. Vista previa flotante en el índice de proyectos
   ============================================================ */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- 1. El Campo ------------------------------------
     Una red triangular cuyos vértices respiran con ondas
     superpuestas. El puntero perturba el campo levemente.
     Algunos vértices prenden rombos de ocre: la trama viva. */

  function initCampo() {
    var canvas = document.getElementById("campo");
    if (!canvas) return;

    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, cols = 0, rows = 0, gap = 96;
    var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
    var running = true;
    var t = 0;

    function resize() {
      var rect = canvas.parentElement.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      gap = w < 720 ? 72 : 96;
      cols = Math.ceil(w / gap) + 3;
      rows = Math.ceil(h / (gap * 0.866)) + 3;
    }

    function wave(x, y, tt) {
      return (
        Math.sin(x * 0.0062 + tt * 0.5 + y * 0.0031) * 9 +
        Math.cos(y * 0.0052 - tt * 0.36 + x * 0.0026) * 8 +
        Math.sin((x + y) * 0.0021 + tt * 0.22) * 6
      );
    }

    function point(i, j, tt) {
      var x0 = (i - 1) * gap + (j % 2 ? gap * 0.5 : 0);
      var y0 = (j - 1) * gap * 0.866;
      var dx = wave(x0, y0, tt) * 0.6;
      var dy = wave(y0 + 120, x0 - 80, tt * 0.9) * 0.6;

      // Perturbación del puntero: el campo cede y se inclina
      var mdx = x0 - mouse.x;
      var mdy = y0 - mouse.y;
      var dist = Math.sqrt(mdx * mdx + mdy * mdy);
      if (dist < 180) {
        var f = (1 - dist / 180) * 16;
        dx += (mdx / (dist || 1)) * f;
        dy += (mdy / (dist || 1)) * f;
      }
      return [x0 + dx, y0 + dy, dx, dy];
    }

    function draw(tt) {
      ctx.clearRect(0, 0, w, h);
      var i, j, p, p1, p2, p3, lum, alpha;

      var grid = [];
      for (j = 0; j < rows; j++) {
        grid[j] = [];
        for (i = 0; i < cols; i++) {
          grid[j][i] = point(i, j, tt);
        }
      }

      // Líneas de la trama: la luminosidad sigue a la onda
      ctx.lineWidth = 1;
      for (j = 0; j < rows; j++) {
        for (i = 0; i < cols; i++) {
          p = grid[j][i];
          lum = Math.min(1, Math.abs(p[2] + p[3]) / 22);
          alpha = 0.028 + lum * 0.075;

          if (i + 1 < cols) {
            p1 = grid[j][i + 1];
            ctx.strokeStyle = "rgba(236,228,211," + alpha.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(p1[0], p1[1]);
            ctx.stroke();
          }
          if (j + 1 < rows) {
            p2 = grid[j + 1][i];
            ctx.strokeStyle = "rgba(236,228,211," + (alpha * 0.9).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(p[0], p[1]);
            ctx.lineTo(p2[0], p2[1]);
            ctx.stroke();
            if (i + (j % 2) < cols && i - 1 + (j % 2) >= 0) {
              p3 = grid[j + 1][i - 1 + (j % 2)];
              ctx.strokeStyle = "rgba(236,228,211," + (alpha * 0.55).toFixed(3) + ")";
              ctx.beginPath();
              ctx.moveTo(p[0], p[1]);
              ctx.lineTo(p3[0], p3[1]);
              ctx.stroke();
            }
          }

          // Rombos de ocre donde la onda cristaliza
          if (((i * 7 + j * 13) % 11 === 0) && lum > 0.62) {
            var s = 1.6 + lum * 2.2;
            ctx.fillStyle = "rgba(201,154,60," + (0.12 + lum * 0.3).toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(p[0], p[1] - s);
            ctx.lineTo(p[0] + s, p[1]);
            ctx.lineTo(p[0], p[1] + s);
            ctx.lineTo(p[0] - s, p[1]);
            ctx.closePath();
            ctx.fill();
          }
        }
      }
    }

    function frame() {
      if (!running) return;
      t += 0.011;
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      draw(t);
      requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", function () { resize(); if (reduceMotion) draw(t); });

    var hero = canvas.parentElement;
    hero.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left;
      mouse.ty = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", function () {
      mouse.tx = -9999;
      mouse.ty = -9999;
    });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { running = false; }
      else if (!reduceMotion) { running = true; requestAnimationFrame(frame); }
    });

    if (reduceMotion) {
      draw(4.2); // un único fotograma: el campo existe, pero no oscila
    } else {
      requestAnimationFrame(frame);
    }
  }

  /* ---------- 2. Aparición al hacer scroll ---------- */

  function initReveals() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) { el.classList.add("visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 3. Galerías con fundido ---------- */

  function initSliders() {
    document.querySelectorAll("[data-slider]").forEach(function (slider) {
      if (slider.dataset.bound) return;
      slider.dataset.bound = "1";
      var images = slider.querySelectorAll("img");
      if (images.length < 2) return;
      var index = 0;
      var interval = parseInt(slider.getAttribute("data-interval") || "4000", 10);
      if (reduceMotion) return; // se queda la primera imagen
      setInterval(function () {
        images[index].classList.remove("active");
        index = (index + 1) % images.length;
        images[index].classList.add("active");
      }, interval);
    });
  }

  /* ---------- 4. Menú móvil ---------- */

  function initMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var nav = document.querySelector("body > header nav");
    if (!toggle || !nav || toggle.dataset.bound) return;
    toggle.dataset.bound = "1";
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("active");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- 5. Colapsables ---------- */

  function initCollapsibles() {
    document.querySelectorAll(".collapsible").forEach(function (btn) {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", function () {
        btn.classList.toggle("active");
        var content = btn.nextElementSibling;
        if (!content) return;
        content.style.display = content.style.display === "block" ? "none" : "block";
      });
    });
  }

  /* ---------- 6. Vista previa flotante del índice ---------- */

  function initPreview() {
    if (!finePointer || reduceMotion) return;
    var lista = document.querySelector(".indice-proyectos");
    if (!lista) return;

    var preview = document.createElement("div");
    preview.id = "preview-flotante";
    preview.setAttribute("aria-hidden", "true");
    var img = document.createElement("img");
    img.alt = "";
    preview.appendChild(img);
    document.body.appendChild(preview);

    var x = 0, y = 0, tx = 0, ty = 0, visible = false, raf = null;

    function loop() {
      x += (tx - x) * 0.12;
      y += (ty - y) * 0.12;
      preview.style.left = x + 26 + "px";
      preview.style.top = y - preview.offsetHeight * 0.5 + "px";
      raf = visible ? requestAnimationFrame(loop) : null;
    }

    lista.querySelectorAll(".fila-proyecto[data-img]").forEach(function (fila) {
      fila.addEventListener("pointerenter", function () {
        var src = fila.getAttribute("data-img");
        if (img.getAttribute("src") !== src) img.setAttribute("src", src);
        preview.classList.add("activo");
        if (!visible) { visible = true; raf = requestAnimationFrame(loop); }
      });
      fila.addEventListener("pointerleave", function () {
        preview.classList.remove("activo");
        visible = false;
        if (raf) cancelAnimationFrame(raf);
        raf = null;
      });
    });

    lista.addEventListener("pointermove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });
  }

  /* ---------- Arranque ---------- */

  function init() {
    initCampo();
    initReveals();
    initSliders();
    initMenu();
    initCollapsibles();
    initPreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
