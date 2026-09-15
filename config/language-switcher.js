(() => {
  const supportedLanguages = ["fr", "en"];
  const pathMatch = window.location.pathname.match(/^\/(fr|en)(?=\/|$)/);
  const currentLanguage = pathMatch?.[1];
  const languageSuffix = pathMatch
    ? window.location.pathname.slice(pathMatch[0].length)
    : "";
  const locationSuffix = `${window.location.search}${window.location.hash}`;
  const navbarBrand = document.querySelector(".navbar-brand");

  if (navbarBrand && currentLanguage) {
    navbarBrand.href = `/${currentLanguage}`;
  }

  document.querySelectorAll(".navbar a").forEach((link) => {
    const language = link.textContent.trim().toLowerCase();

    if (!supportedLanguages.includes(language)) {
      return;
    }

    link.href = `/${language}${languageSuffix}${locationSuffix}`;
    link.classList.add("language-link");

    if (language === currentLanguage) {
      link.classList.add("is-current-language");
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove("is-current-language");
      link.removeAttribute("aria-current");
    }
  });

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a.pdf-viewer");

    if (!link) {
      return;
    }

    event.preventDefault();

    const params = new URLSearchParams({
      file: link.getAttribute("href"),
      title: link.textContent.trim(),
    });
    const dataFile = link.dataset.file;

    if (dataFile) {
      params.set("data", dataFile);
    }

    if (currentLanguage === "en") {
      params.set("lang", "en");
    }

    window.location.href = `/tool/pdf/?${params}`;
  });
})();
