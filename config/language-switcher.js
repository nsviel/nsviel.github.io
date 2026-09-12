(() => {
  const supportedLanguages = ["fr", "en"];
  const pathMatch = window.location.pathname.match(/^\/(fr|en)(?=\/|$)/);
  const languageSuffix = pathMatch
    ? window.location.pathname.slice(pathMatch[0].length)
    : "";
  const locationSuffix = `${window.location.search}${window.location.hash}`;

  document.querySelectorAll(".navbar a").forEach((link) => {
    const language = link.textContent.trim().toLowerCase();

    if (!supportedLanguages.includes(language)) {
      return;
    }

    link.href = `/${language}${languageSuffix}${locationSuffix}`;
  });
})();
