/* AtticCraft Dublin — site behaviour (no dependencies) */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.remove("no-js");

  /* ---------- Safe storage ---------- */
  function store(key, val) {
    try {
      if (val === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, val);
    } catch (e) { return null; }
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() { if (header) header.classList.toggle("scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var burger = document.querySelector(".burger");
  var nav = document.getElementById("nav");
  var dd = document.querySelector(".nav-dd");
  var ddBtn = dd ? dd.querySelector("button") : null;

  function closeDD() { if (dd) { dd.classList.remove("open"); ddBtn.setAttribute("aria-expanded", "false"); } }
  function setNav(open) {
    if (!nav || !burger) return;
    nav.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    if (!open) closeDD();
  }
  if (burger) burger.addEventListener("click", function () { setNav(!nav.classList.contains("open")); });

  if (ddBtn) {
    ddBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !dd.classList.contains("open");
      dd.classList.toggle("open", open);
      ddBtn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }
  document.addEventListener("click", function (e) {
    if (dd && !e.target.closest(".nav-dd")) closeDD();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeDD(); setNav(false); }
  });
  if (nav) nav.querySelectorAll("a").forEach(function (a) {
    a.addEventListener("click", function () { setNav(false); });
  });

  /* ---------- Cookie consent (Google Consent Mode v2) ---------- */
  var banner = document.getElementById("cookie");
  function applyConsent(choice) {
    if (typeof window.gtag !== "function") return;
    var v = choice === "accepted" ? "granted" : "denied";
    window.gtag("consent", "update", {
      analytics_storage: v, ad_storage: v, ad_user_data: v, ad_personalization: v
    });
  }
  var saved = store("attic-cookie");
  if (saved) applyConsent(saved);
  else if (banner) banner.classList.add("show");
  document.querySelectorAll("[data-cookie]").forEach(function (b) {
    b.addEventListener("click", function () {
      var choice = b.getAttribute("data-cookie");
      store("attic-cookie", choice);
      applyConsent(choice);
      if (banner) banner.classList.remove("show");
    });
  });

  /* ---------- Privacy dialog ---------- */
  var dlg = document.getElementById("privacy");
  document.querySelectorAll("[data-privacy]").forEach(function (b) {
    b.addEventListener("click", function (e) {
      e.preventDefault();
      if (!dlg) return;
      if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    });
  });
  if (dlg) {
    dlg.addEventListener("click", function (e) { if (e.target === dlg) dlg.close(); });
    dlg.querySelectorAll("[data-close]").forEach(function (b) { b.addEventListener("click", function () { dlg.close(); }); });
  }

  /* ---------- Survey form (Formspree, AJAX with graceful fallback) ---------- */
  var form = document.getElementById("survey-form");
  if (form && window.fetch && window.FormData) {
    var status = document.getElementById("form-status");
    var btn = form.querySelector("button[type=submit]");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_gotcha"]').value) return;
      var label = btn.innerHTML;
      btn.disabled = true; btn.textContent = "Sending…";
      status.className = "form-status"; status.textContent = "";
      fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } })
        .then(function (r) {
          if (!r.ok) throw new Error("bad status");
          form.reset();
          status.className = "form-status ok";
          status.textContent = "✓ Thanks! We'll be in touch within 2 hours.";
          btn.style.display = "none";
          if (typeof window.gtag === "function") window.gtag("event", "generate_lead", { form: "free_survey" });
        })
        .catch(function () {
          status.className = "form-status err";
          status.innerHTML = 'Sorry, something went wrong. Please WhatsApp us on <a href="https://wa.me/353899403341">089 940 3341</a>.';
          btn.disabled = false; btn.innerHTML = label;
        });
    });
  }

  /* ---------- Track WhatsApp / phone clicks ---------- */
  document.addEventListener("click", function (e) {
    var a = e.target.closest("a[href*='wa.me'], a[href^='tel:']");
    if (a && typeof window.gtag === "function") {
      window.gtag("event", a.href.indexOf("wa.me") > -1 ? "whatsapp_click" : "phone_click", { link_url: a.href });
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Article table of contents highlight ---------- */
  var tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length && "IntersectionObserver" in window) {
    var map = {};
    tocLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          tocLinks.forEach(function (a) { a.classList.remove("active"); });
          var l = map[en.target.id]; if (l) l.classList.add("active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    Object.keys(map).forEach(function (id) { var h = document.getElementById(id); if (h) tio.observe(h); });
  }

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
