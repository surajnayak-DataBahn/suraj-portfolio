/* Suraj Nayak — Portfolio interactions */
(() => {
  "use strict";

  /* ---------- Year stamp ---------- */
  const yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();

  /* ---------- Theme toggle (persisted) ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById("themeToggle");
  const stored = localStorage.getItem("theme");
  if (stored) root.setAttribute("data-theme", stored);

  themeBtn?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");
  navToggle?.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });
  // close menu on link click (mobile)
  navLinks?.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      if (navLinks.classList.contains("is-open")) {
        navLinks.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      }
    });
  });

  /* ---------- Sticky nav border on scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    nav?.classList.toggle("is-scrolled", window.scrollY > 16);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-spy: active nav link ---------- */
  const navAnchors = Array.from(document.querySelectorAll(".nav__links a[data-section]"));
  const sectionIds = navAnchors.map(a => a.dataset.section);
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navAnchors.forEach(a => a.classList.toggle("is-active", a.dataset.section === id));
      }
    });
  }, { rootMargin: "-45% 0px -50% 0px", threshold: 0 });
  sections.forEach(s => spy.observe(s));

  /* ---------- Reveal-on-scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  const revealer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  revealEls.forEach(el => revealer.observe(el));

  /* ---------- Animated counters in the impact strip ---------- */
  const counters = document.querySelectorAll(".impact__num [data-count]");
  const startCount = (el) => {
    if (el.dataset.done === "1") return;
    el.dataset.done = "1";
    const target = parseInt(el.dataset.count, 10);
    if (!Number.isFinite(target)) {
      el.textContent = el.dataset.count;
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(target * ease(t)).toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startCount(entry.target);
          countObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -8% 0px" });
    counters.forEach(el => countObserver.observe(el));
  } else {
    counters.forEach(startCount);
  }
  // Safety net: if the observer never fires (impact strip already in view, weird timing),
  // animate any remaining counters 2 s after load.
  setTimeout(() => counters.forEach(startCount), 2000);

  /* ---------- Hero typewriter for roles ---------- */
  const rolesEl = document.getElementById("rolesText");
  if (rolesEl) {
    const roles = [
      "Principal Engineer · DevOps & Platform",
      "GitOps at 12-cluster scale",
      "Backstage IDP architect",
      "Istio · mTLS · service mesh",
      "FinOps · $200K+/yr saved",
      "Incident Commander · Mentor",
      "CKA · CKS · CKAD · Terraform",
    ];
    let idx = 0, chr = 0, deleting = false;
    const tick = () => {
      const word = roles[idx];
      if (!deleting) {
        chr++;
        rolesEl.textContent = word.slice(0, chr);
        if (chr === word.length) { deleting = true; setTimeout(tick, 1600); return; }
      } else {
        chr--;
        rolesEl.textContent = word.slice(0, chr);
        if (chr === 0) { deleting = false; idx = (idx + 1) % roles.length; }
      }
      setTimeout(tick, deleting ? 35 : 70);
    };
    tick();
  }

  /* ---------- Project filter ---------- */
  const filterBar = document.getElementById("projFilter");
  const projGrid = document.getElementById("projGrid");
  const projEmpty = document.getElementById("projEmpty");
  if (filterBar && projGrid) {
    const cards = Array.from(projGrid.querySelectorAll(".proj-card"));
    filterBar.addEventListener("click", (e) => {
      const btn = e.target.closest(".proj-filter__btn");
      if (!btn) return;
      filterBar.querySelectorAll(".proj-filter__btn").forEach(b => {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn);
      });
      const filter = btn.dataset.filter;
      let shown = 0;
      cards.forEach(card => {
        const tags = (card.dataset.tags || "").split(/\s+/);
        const match = filter === "all" || tags.includes(filter);
        card.classList.toggle("is-hidden", !match);
        if (match) shown++;
      });
      projEmpty.hidden = shown !== 0;
    });
  }

  /* ---------- Make cert cards clickable to Credly ---------- */
  const credlyUrl = "https://www.credly.com/users/surajnayak88";
  document.querySelectorAll(".cert-card").forEach((card) => {
    card.classList.add("cert-card--clickable");
    card.setAttribute("role", "link");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", `${card.querySelector("h4")?.textContent ?? "Certification"} — verify on Credly`);
    const open = () => window.open(credlyUrl, "_blank", "noopener");
    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });
  });

  /* ---------- Scroll progress bar ---------- */
  const progress = document.getElementById("scrollProgress");
  const updateProgress = () => {
    const h = document.documentElement;
    const total = h.scrollHeight - h.clientHeight;
    const pct = total > 0 ? (h.scrollTop / total) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
  };
  document.addEventListener("scroll", updateProgress, { passive: true });
  updateProgress();

  /* ---------- Cursor spotlight (desktop, fine pointer) ---------- */
  const fine = window.matchMedia("(pointer: fine)").matches;
  if (fine) {
    let raf = 0, mx = -1000, my = -1000;
    const spot = document.querySelector(".cursor-spot");
    const apply = () => {
      if (spot) {
        spot.style.setProperty("--mx", mx + "px");
        spot.style.setProperty("--my", my + "px");
      }
      raf = 0;
    };
    document.addEventListener("mousemove", (e) => {
      mx = e.clientX; my = e.clientY;
      document.body.classList.add("has-cursor");
      if (!raf) raf = requestAnimationFrame(apply);
    });
    document.addEventListener("mouseleave", () => {
      document.body.classList.remove("has-cursor");
    });
  }

  /* ---------- 3D tilt on cards (fine pointer only) ---------- */
  if (fine && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const tiltMax = 7; // degrees
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const px = x / rect.width;
        const py = y / rect.height;
        const rx = (py - 0.5) * -tiltMax * 2;
        const ry = (px - 0.5) *  tiltMax * 2;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        card.style.setProperty("--tilt-mx", (px * 100) + "%");
        card.style.setProperty("--tilt-my", (py * 100) + "%");
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ---------- Konami code easter egg ---------- */
  const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown",
                  "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
  let kIdx = 0;
  const toast = document.getElementById("toast");
  const showToast = (msg, ms = 4200) => {
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add("is-show"));
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.classList.remove("is-show");
      setTimeout(() => { toast.hidden = true; }, 300);
    }, ms);
  };
  const emojiBurst = () => {
    const emojis = ["🚀","⚡","☸️","🛡️","📊","🔐","💚","🟢","✨","🎯"];
    for (let i = 0; i < 28; i++) {
      const e = document.createElement("span");
      e.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      Object.assign(e.style, {
        position: "fixed",
        left: (Math.random() * 100) + "vw",
        top: "-5vh",
        fontSize: (18 + Math.random() * 22) + "px",
        pointerEvents: "none",
        zIndex: 150,
        transition: `transform ${2 + Math.random() * 2}s linear, opacity 2s linear`,
      });
      document.body.appendChild(e);
      requestAnimationFrame(() => {
        e.style.transform = `translate(${(Math.random() - 0.5) * 200}px, 110vh) rotate(${Math.random() * 720}deg)`;
        e.style.opacity = "0";
      });
      setTimeout(() => e.remove(), 5000);
    }
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === konami[kIdx]) {
      kIdx++;
      if (kIdx === konami.length) {
        emojiBurst();
        showToast("🎩 Hat-trick unlocked — built with 0 KB of framework.");
        kIdx = 0;
      }
    } else {
      kIdx = (e.key === konami[0]) ? 1 : 0;
    }
  });

  /* ---------- Contact form (mailto fallback) ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("cfStatus");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const subject = form.subject.value;
    const message = form.message.value.trim();
    const subjectLine = `Portfolio enquiry — ${subject}`;
    const body =
      `From: ${name} <${email}>\n` +
      `Subject category: ${subject}\n\n${message}`;
    const mailto = `mailto:surajnayak88@gmail.com?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    status.textContent = "✔ Opening your mail client…";
    status.classList.remove("is-err");
    status.classList.add("is-ok");
    setTimeout(() => { form.reset(); }, 1500);
  });
})();
