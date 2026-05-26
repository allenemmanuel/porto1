(() => {
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const prefersLight = window.matchMedia?.("(prefers-color-scheme: light)")?.matches;

  // Theme (dark/light)
  const root = document.documentElement;
  const storedTheme = (() => {
    try { return localStorage.getItem("theme"); } catch { return null; }
  })();
  const initialTheme = storedTheme || (prefersLight ? "light" : "dark");
  root.setAttribute("data-theme", initialTheme);

  const themeBtn = document.querySelector("[data-theme-toggle]");
  const setTheme = (theme) => {
    root.setAttribute("data-theme", theme);
    try { localStorage.setItem("theme", theme); } catch {}
    if (themeBtn) {
      const isLight = theme === "light";
      themeBtn.setAttribute("aria-pressed", isLight ? "true" : "false");
      themeBtn.textContent = isLight ? "Light" : "Dark";
    }
  };
  if (themeBtn) {
    setTheme(initialTheme);
    themeBtn.addEventListener("click", () => {
      const current = root.getAttribute("data-theme") || "dark";
      setTheme(current === "light" ? "dark" : "light");
    });
  }

  // Fixed header offset (prevents content sitting under navbar)
  const header = document.querySelector(".site-header");
  const updateHeaderOffset = () => {
    if (!header) return;
    root.style.setProperty("--header-offset", `${header.offsetHeight}px`);
  };
  updateHeaderOffset();
  window.addEventListener("resize", updateHeaderOffset);
  if (document.fonts?.ready) {
    document.fonts.ready.then(updateHeaderOffset).catch(() => {});
  }

  // Header menu toggle (mobile)
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("#site-nav");

  if (header && toggle && nav) {
    const setOpen = (open) => {
      header.setAttribute("data-menu-open", open ? "true" : "false");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      requestAnimationFrame(updateHeaderOffset);
    };

    toggle.addEventListener("click", () => {
      const open = header.getAttribute("data-menu-open") === "true";
      setOpen(!open);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  // Footer year
  const year = document.querySelector("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Lightbox (gallery)
  const lightbox = document.querySelector(".lightbox");
  const lightboxImg = document.querySelector("[data-lightbox-image]");
  const lightboxCaption = document.querySelector("[data-lightbox-caption]");
  const closeBtn = document.querySelector("[data-lightbox-close]");
  const triggers = document.querySelectorAll("[data-lightbox-src]");

  if (lightbox && lightboxImg && lightboxCaption && closeBtn && triggers.length) {
    let lastActive = null;

    const open = (src, title) => {
      lastActive = document.activeElement;
      lightboxImg.setAttribute("src", src);
      lightboxImg.setAttribute("alt", title || "Preview image");
      lightboxCaption.textContent = title || "Preview";
      lightbox.setAttribute("aria-hidden", "false");
      if (!prefersReducedMotion) lightbox.style.opacity = "1";
      closeBtn.focus();
    };

    const close = () => {
      lightbox.setAttribute("aria-hidden", "true");
      lightboxImg.setAttribute("src", "");
      if (lastActive && typeof lastActive.focus === "function") lastActive.focus();
    };

    triggers.forEach((btn) => {
      btn.addEventListener("click", () => {
        const src = btn.getAttribute("data-lightbox-src");
        const title = btn.getAttribute("data-lightbox-title") || "";
        if (src) open(src, title);
      });
    });

    closeBtn.addEventListener("click", close);
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) close();
    });
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && lightbox.getAttribute("aria-hidden") === "false") close();
    });
  }
})();
