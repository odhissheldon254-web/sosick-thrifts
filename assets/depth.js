// Sosick 3D layer: spins the hero parcel (auto + drag/swipe), tilts cards
// toward the mouse on computers, and keeps the plain-words fee text honest.
(function () {
  "use strict";
  var calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia && matchMedia("(hover: hover) and (pointer: fine)").matches;
  var S = window.SOSICK || {};

  /* ---------- fee wording follows data.js, never invents a price ---------- */
  if (S.deliveryFeeFrom) {
    var fee = "KES " + Number(S.deliveryFeeFrom).toLocaleString("en-KE");
    var f1 = document.getElementById("factFee");
    if (f1) f1.textContent = "The item's price plus delivery, from " + fee + ". We confirm the exact fee on WhatsApp before the rider leaves.";
    var f2 = document.getElementById("faqFee");
    if (f2) f2.innerHTML = "You pay the item's price plus delivery, starting <strong>from " + fee + "</strong>. We confirm the exact fee on WhatsApp <strong>before</strong> the rider leaves.";
  }

  /* ---------- the parcel ---------- */
  var stage = document.getElementById("parcelStage");
  var box = document.getElementById("parcel");
  if (stage && box) {
    var rx = -18, ry = 30, vy = calm ? 0 : 0.35, dragging = false, lastX = 0, lastY = 0, lastT = 0, visible = true;
    var apply = function () { box.style.setProperty("--rx", rx + "deg"); box.style.setProperty("--ry", ry + "deg"); };
    var tick = function () {
      if (!dragging && visible) {
        // ease back to the gentle default spin after a flick
        var cruise = calm ? 0 : 0.35;
        vy += (cruise - vy) * 0.02;
        ry += vy;
        rx += (-18 - rx) * 0.04;
        apply();
      }
      requestAnimationFrame(tick);
    };
    stage.addEventListener("pointerdown", function (e) {
      dragging = true; lastX = e.clientX; lastY = e.clientY; lastT = performance.now();
      stage.classList.add("is-dragging");
      try { stage.setPointerCapture(e.pointerId); } catch (_) {}
    });
    stage.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var now = performance.now(), dx = e.clientX - lastX, dy = e.clientY - lastY;
      ry += dx * 0.6; rx = Math.max(-60, Math.min(40, rx - dy * 0.4));
      vy = dx * 0.6 / Math.max(8, now - lastT) * 16;   // fling speed, per frame
      lastX = e.clientX; lastY = e.clientY; lastT = now;
      apply();
    });
    var end = function () { dragging = false; stage.classList.remove("is-dragging"); };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);
    // Tap/click the box: give it a spin and nudge people to order.
    stage.addEventListener("dblclick", function () { vy = 12; });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }).observe(stage);
    }
    apply();
    requestAnimationFrame(tick);
  }

  /* ---------- tilt cards toward the mouse (computers only) ---------- */
  if (finePointer && !calm) {
    var SEL = ".engine, .cat-tile, .product, .plug, .fact, .steps li, .test-list li, .vibe, .fit-card";
    var arm = function (el) {
      if (el.dataset.tilt) return;
      el.dataset.tilt = "1";
      el.classList.add("tilt");
      var glare = document.createElement("span");
      glare.className = "tilt-glare"; glare.setAttribute("aria-hidden", "true");
      el.appendChild(glare);
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.classList.remove("is-settling");
        el.classList.add("is-tilting");
        el.style.setProperty("--ty", ((px - 0.5) * 14).toFixed(2) + "deg");
        el.style.setProperty("--tx", ((0.5 - py) * 12).toFixed(2) + "deg");
        el.style.setProperty("--gx", (px * 100).toFixed(1) + "%");
        el.style.setProperty("--gy", (py * 100).toFixed(1) + "%");
      });
      el.addEventListener("pointerleave", function () {
        el.classList.remove("is-tilting");
        el.classList.add("is-settling");
        setTimeout(function () { el.classList.remove("is-settling"); }, 460);
      });
    };
    var scan = function () { document.querySelectorAll(SEL).forEach(arm); };
    scan();
    // Plugs, tiles and products arrive later from the database: arm them too.
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
  }
})();
