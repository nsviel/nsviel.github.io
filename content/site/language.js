(() => {
  const localizePage = () => {
    const path = window.location.pathname;


    const translatedPath = (language) => {

      if (path === `/${language}` || path.startsWith(`/${language}/`)) {
        return path;
      }

      const otherLanguage = language === "fr" ? "en" : "fr";
      if (path === `/${otherLanguage}` || path.startsWith(`/${otherLanguage}/`)) {
        return path.replace(new RegExp(`^/${otherLanguage}(?=/|$)`), `/${language}`);
      }

      return `/${language}/`;
    };

    const navbarBrand = document.querySelector(".navbar-brand");
    if (navbarBrand) {
      const isEnglish = path === "/en" || path.startsWith("/en/");
      navbarBrand.href = isEnglish ? "/en/" : "/fr/";
    }

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
