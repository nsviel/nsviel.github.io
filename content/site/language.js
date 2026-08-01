(() => {
  const localizePage = () => {
    const path = window.location.pathname;
    const isEnglish = path === "/en" || path.startsWith("/en/");

    const footer = document.getElementById("localized-footer");
    if (footer) {
      footer.textContent = isEnglish
        ? "© 2026 — Content licensed under CC BY-NC-SA 4.0"
        : "© 2026 — Contenus sous licence CC BY-NC-SA 4.0";
    }

    const localizedPaths = {
      fr: {
        "/fr/a-propos/": "/fr/a-propos/",
        "/en/about/": "/fr/a-propos/",
      },
      en: {
        "/fr/a-propos/": "/en/about/",
        "/en/about/": "/en/about/",
      },
    };

    const translatedPath = (language) => {
      const localizedPath = localizedPaths[language][path];
      if (localizedPath) {
        return localizedPath;
      }

      if (path === `/${language}` || path.startsWith(`/${language}/`)) {
        return path;
      }

      const otherLanguage = language === "fr" ? "en" : "fr";
      if (path === `/${otherLanguage}` || path.startsWith(`/${otherLanguage}/`)) {
        return path.replace(new RegExp(`^/${otherLanguage}(?=/|$)`), `/${language}`);
      }

      return `/${language}/`;
    };

    document.querySelectorAll(".navbar a").forEach((link) => {
      const label = link.textContent.trim();

      if (label === "FR") {
        link.href = translatedPath("fr");
      } else if (label === "EN") {
        link.href = translatedPath("en");
      }
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", localizePage, { once: true });
  } else {
    localizePage();
  }
})();
