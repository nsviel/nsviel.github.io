(() => {
  const storageKey = "site-theme";
  const themes = ["light", "dark", "warm"];
  const themeClasses = themes.map((theme) => `site-theme-${theme}`);

  const installMenu = () => {
    const navbar = document.querySelector("nav.navbar");
    const navList = navbar?.querySelector(".navbar-nav");
    const themeToggle = document.querySelector(".quarto-color-scheme-toggle");

    if (!navbar || !navList || !themeToggle) {
      return;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "site-menu";
    wrapper.innerHTML = `
      <button class="site-menu-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="site-menu-panel">
        <span></span><span></span><span></span>
      </button>
      <div class="site-menu-panel" id="site-menu-panel" hidden>
        <nav class="site-menu-links" aria-label="Site links"></nav>
        <details class="site-menu-themes">
          <summary>Theme</summary>
          <ul class="site-menu-theme-list" aria-label="Themes">
            ${themes.map((theme) => `<li><button type="button" data-theme="${theme}">${theme}</button></li>`).join("")}
          </ul>
        </details>
      </div>
    `;

    const menuButton = wrapper.querySelector(".site-menu-toggle");
    const panel = wrapper.querySelector(".site-menu-panel");
    const menuLinks = wrapper.querySelector(".site-menu-links");
    const languageLinks = document.createElement("div");
    languageLinks.className = "site-menu-languages";
    languageLinks.setAttribute("role", "group");
    languageLinks.setAttribute("aria-label", "Language");

    navList.querySelectorAll("a").forEach((link) => {
      const navItem = link.closest("li");

      if (link.querySelector(".navbar-tool-icon")) {
        link.classList.add("site-menu-tool-link");
        navItem?.remove();
        navbar.append(link);
        return;
      }

      if (link.classList.contains("language-link")) {
        languageLinks.append(link);
        navItem?.remove();
        return;
      }

      const item = document.createElement("div");
      item.className = "site-menu-language";
      item.append(link);
      menuLinks.append(item);
      navItem?.remove();
    });

    const setMenuOpen = (open) => {
      panel.hidden = !open;
      menuButton.setAttribute("aria-expanded", String(open));
    };

    const applyTheme = (theme) => {
      if (!themes.includes(theme)) return;

      document.body.classList.remove(...themeClasses);
      document.body.classList.add(`site-theme-${theme}`);
      document.documentElement.dataset.siteTheme = theme;
      localStorage.setItem(storageKey, theme);

      wrapper.querySelectorAll("[data-theme]").forEach((button) => {
        const isCurrentTheme = button.dataset.theme === theme;
        button.classList.toggle("is-current-theme", isCurrentTheme);
        button.setAttribute("aria-pressed", String(isCurrentTheme));
      });

      if ((theme !== "light") !== document.body.classList.contains("quarto-dark")) {
        themeToggle.click();
      }
    };

    const storedTheme = localStorage.getItem(storageKey);
    const initialTheme = themes.includes(storedTheme)
      ? storedTheme
      : document.body.classList.contains("quarto-dark")
        ? "dark"
        : "light";

    menuButton.addEventListener("click", () => {
      setMenuOpen(panel.hidden);
    });
    wrapper.querySelectorAll("[data-theme]").forEach((button) => {
      button.addEventListener("click", () => applyTheme(button.dataset.theme));
    });
    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target)) setMenuOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.focus();
      }
    });

    applyTheme(initialTheme);
    navbar.append(languageLinks);
    navbar.append(wrapper);
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installMenu, { once: true });
  } else {
    installMenu();
  }
})();
