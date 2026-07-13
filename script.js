/* Malá farma u Soběslavi — sdílené interakce (minimální JS) */
(function () {
  "use strict";

  // --- Mobilní menu ---
  var burger = document.querySelector(".burger");
  var mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = mobileNav.classList.toggle("show");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mobileNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        mobileNav.classList.remove("show");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- Kontaktní formulář → e-mail ---
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = (form.elements.name && form.elements.name.value || "").trim();
      var contact = (form.elements.contact && form.elements.contact.value || "").trim();
      var message = (form.elements.message && form.elements.message.value || "").trim();
      var body =
        "Dobrý den,\n\n" +
        (message || "mám zájem o termín na farmě.") +
        "\n\nJméno: " + (name || "-") +
        "\nKontakt: " + (contact || "-");
      var url =
        "mailto:info@malafarma.cz" +
        "?subject=" + encodeURIComponent("Poptávka z webu — Malá farma") +
        "&body=" + encodeURIComponent(body);
      window.location.href = url;
    });
  }

  // --- Galerie: carousel + lightbox ---
  var lb = document.getElementById("lightbox");
  function openLb(src, alt) {
    if (!lb) return;
    var lbImg = lb.querySelector("img");
    lbImg.src = src; lbImg.alt = alt || "";
    lb.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  if (lb) {
    var lbClose = lb.querySelector(".close");
    var closeLb = function () {
      lb.classList.remove("show");
      lb.querySelector("img").src = "";
      document.body.style.overflow = "";
    };
    lbClose.addEventListener("click", closeLb);
    lb.addEventListener("click", function (e) { if (e.target === lb) closeLb(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeLb(); });
  }

  var carousel = document.getElementById("galCarousel");
  if (carousel) {
    var track = carousel.querySelector(".carousel-track");
    var slides = Array.prototype.slice.call(track.children);
    var prevBtn = carousel.querySelector(".prev");
    var nextBtn = carousel.querySelector(".next");
    var dotsWrap = carousel.querySelector(".carousel-dots");
    var index = 0;
    var startX = 0, curX = 0, dragging = false, dragMoved = false;

    var perView = function () {
      return window.innerWidth <= 1000 ? 1 : 2;
    };
    var maxIndex = function () { return Math.max(0, slides.length - perView()); };

    var buildDots = function () {
      dotsWrap.innerHTML = "";
      var pages = maxIndex() + 1;
      for (var i = 0; i < pages; i++) {
        var b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Přejít na snímek " + (i + 1));
        (function (i) { b.addEventListener("click", function () { go(i); }); })(i);
        dotsWrap.appendChild(b);
      }
    };
    var update = function () {
      var slideW = slides[0].getBoundingClientRect().width;
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 20) || 20;
      track.style.transform = "translateX(" + (-(index * (slideW + gap))) + "px)";
      if (prevBtn) prevBtn.disabled = index <= 0;
      if (nextBtn) nextBtn.disabled = index >= maxIndex();
      Array.prototype.forEach.call(dotsWrap.children, function (d, i) {
        d.classList.toggle("active", i === index);
      });
    };
    var go = function (i) { index = Math.max(0, Math.min(i, maxIndex())); update(); };

    if (nextBtn) nextBtn.addEventListener("click", function () { go(index + 1); });
    if (prevBtn) prevBtn.addEventListener("click", function () { go(index - 1); });

    slides.forEach(function (s) {
      s.addEventListener("click", function () {
        if (dragMoved) return;
        openLb(s.getAttribute("data-lightbox"), s.getAttribute("data-alt"));
      });
      s.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openLb(s.getAttribute("data-lightbox"), s.getAttribute("data-alt"));
        }
      });
    });

    var down = function (x) { dragging = true; dragMoved = false; startX = curX = x; track.classList.add("dragging"); };
    var move = function (x) { if (!dragging) return; curX = x; if (Math.abs(curX - startX) > 6) dragMoved = true; };
    var up = function () {
      if (!dragging) return;
      dragging = false;
      track.classList.remove("dragging");
      var dx = curX - startX;
      if (dx < -40) go(index + 1);
      else if (dx > 40) go(index - 1);
      else update();
    };
    track.addEventListener("mousedown", function (e) { down(e.clientX); });
    window.addEventListener("mousemove", function (e) { move(e.clientX); });
    window.addEventListener("mouseup", up);
    track.addEventListener("touchstart", function (e) { down(e.touches[0].clientX); }, { passive: true });
    track.addEventListener("touchmove", function (e) { move(e.touches[0].clientX); }, { passive: true });
    track.addEventListener("touchend", up);

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { buildDots(); go(Math.min(index, maxIndex())); }, 150);
    });

    buildDots();
    update();
  }

  // --- Hravé efekty (respektují prefers-reduced-motion) ---
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && "IntersectionObserver" in window) {

    // Reveal při scrollu — sekce a karty jemně vyplavou
    var revealEls = document.querySelectorAll(
      ".section .split, .section-head, .link-card, .review, .stat, .band .inner, .faq details, .contact-grid > *"
    );
    revealEls.forEach(function (el, i) {
      el.classList.add("reveal");
      el.style.transitionDelay = (Math.min(i % 3, 2) * 80) + "ms";
    });
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          revObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revObs.observe(el); });

    // Počítadla čísel — .stat .n s číslem naskáče od nuly
    var counters = document.querySelectorAll(".stat .n");
    var cntObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        cntObs.unobserve(e.target);
        var el = e.target;
        var raw = el.textContent.trim();
        var m = raw.match(/^(\d+)(.*)$/);
        if (!m) return;
        var target = parseInt(m[1], 10);
        var suffix = m[2] || "";
        if (target <= 0 || target > 100000) return;
        var start = null, dur = 900;
        function step(ts) {
          if (start === null) start = ts;
          var p = Math.min((ts - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(eased * target) + suffix;
          if (p < 1) requestAnimationFrame(step);
        }
        el.textContent = "0" + suffix;
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cntObs.observe(el); });
  }

  // --- Stopy tlapek za kurzorem (jen myš, ne dotyk) ---
  var finePointer = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
  if (!reduce && finePointer) {
    var layer = document.createElement("div");
    layer.className = "paw-layer";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    var pawSvg =
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 60'>" +
      "<g fill='%COLOR%'>" +
      "<ellipse cx='30' cy='40' rx='12' ry='10'/>" +
      "<ellipse cx='13' cy='22' rx='5.5' ry='7.5'/>" +
      "<ellipse cx='25' cy='12' rx='5.5' ry='7.5'/>" +
      "<ellipse cx='38' cy='12' rx='5.5' ry='7.5'/>" +
      "<ellipse cx='49' cy='23' rx='5.5' ry='7.5'/>" +
      "</g></svg>";

    var lastX = null, lastY = null, dist = 0, side = 1;
    var STEP = 42; // px mezi stopami

    function dropPaw(x, y, angleDeg, s, color) {
      var el = document.createElement("div");
      el.className = "paw-step";
      var svg = pawSvg.replace("%COLOR%", color);
      el.style.backgroundImage = "url(\"data:image/svg+xml," + svg + "\")";
      el.style.backgroundSize = "contain";
      el.style.backgroundRepeat = "no-repeat";
      // perpendikulární posun pro L/P + malá velikost
      var rad = angleDeg * Math.PI / 180;
      var offset = 7 * s;
      var ox = Math.cos(rad + Math.PI / 2) * offset;
      var oy = Math.sin(rad + Math.PI / 2) * offset;
      var size = 18;
      el.style.transform =
        "translate(" + (x + ox - size / 2) + "px," + (y + oy - size / 2) + "px) rotate(" + (angleDeg + 90) + "deg)";
      el.style.width = size + "px";
      el.style.height = size + "px";
      layer.appendChild(el);
      // vstupní opacity, pak plynulé zmizení
      requestAnimationFrame(function () {
        el.style.transition = "opacity 1100ms ease-out";
        el.style.opacity = "0.42";
        requestAnimationFrame(function () { el.style.opacity = "0"; });
      });
      setTimeout(function () { el.remove(); }, 1200);
    }

    window.addEventListener("mousemove", function (e) {
      var x = e.clientX, y = e.clientY;
      if (lastX === null) { lastX = x; lastY = y; return; }
      var dx = x - lastX, dy = y - lastY;
      dist += Math.sqrt(dx * dx + dy * dy);
      if (dist >= STEP) {
        var angle = Math.atan2(dy, dx) * 180 / Math.PI;
        // kontrastní barva podle pozadí pod kurzorem
        var onDark = e.target && e.target.closest &&
          e.target.closest(".hero,.strip,.section.teal,.section.dark,.band,.site-header,.site-footer,.form-card");
        var color = onDark ? "%23FFFAE9" : "%2318555C"; // krémová na tmavém, zelená na světlém
        dropPaw(x, y, angle, side, color);
        side *= -1;      // střídavě levá / pravá stopa
        dist = 0;
      }
      lastX = x; lastY = y;
    }, { passive: true });
  }

  // --- Cookie lišta (GDPR) ---
  var banner = document.getElementById("cookie-banner");
  if (banner) {
    var cAll = document.getElementById("cookie-all");
    var cSel = document.getElementById("cookie-selected");
    var cDecline = document.getElementById("cookie-decline");
    var cAnalytics = document.getElementById("cookie-analytics");
    var cMarketing = document.getElementById("cookie-marketing");
    var cReopen = document.getElementById("cookie-reopen");

    var CONSENT_KEY = "gdprConsent";
    var CONSENT_VERSION = 1;
    var CONSENT_EXPIRY_DAYS = 180;

    var applyConsent = function (analytics, marketing) {
      if (typeof window.gtag === "function") {
        window.gtag("consent", "update", {
          "analytics_storage": analytics ? "granted" : "denied",
          "ad_storage": marketing ? "granted" : "denied",
          "ad_user_data": marketing ? "granted" : "denied",
          "ad_personalization": marketing ? "granted" : "denied"
        });
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ "event": "consent_updated" });
    };
    var showBanner = function () {
      banner.classList.add("show");
      if (cReopen) cReopen.classList.remove("show");
    };
    var saveConsent = function (analytics, marketing) {
      try {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
          analytics: analytics, marketing: marketing,
          version: CONSENT_VERSION, timestamp: Date.now()
        }));
      } catch (e) {}
      applyConsent(analytics, marketing);
      banner.classList.remove("show");
      if (cReopen) cReopen.classList.add("show");
    };

    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(CONSENT_KEY)); } catch (e) {}
    var isValid = saved && saved.version === CONSENT_VERSION && saved.timestamp &&
      (Date.now() - saved.timestamp) < CONSENT_EXPIRY_DAYS * 864e5;

    if (!isValid) {
      showBanner();
    } else {
      applyConsent(!!saved.analytics, !!saved.marketing);
      if (cAnalytics) cAnalytics.checked = !!saved.analytics;
      if (cMarketing) cMarketing.checked = !!saved.marketing;
      if (cReopen) cReopen.classList.add("show");
    }

    if (cAll) cAll.addEventListener("click", function () {
      if (cAnalytics) cAnalytics.checked = true;
      if (cMarketing) cMarketing.checked = true;
      saveConsent(true, true);
    });
    if (cSel) cSel.addEventListener("click", function () {
      saveConsent(!!(cAnalytics && cAnalytics.checked), !!(cMarketing && cMarketing.checked));
    });
    if (cDecline) cDecline.addEventListener("click", function () {
      if (cAnalytics) cAnalytics.checked = false;
      if (cMarketing) cMarketing.checked = false;
      saveConsent(false, false);
    });
    if (cReopen) cReopen.addEventListener("click", showBanner);

    // Znovuotevření z patičky
    document.querySelectorAll(".open-cookies").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        showBanner();
      });
    });
  }
})();
