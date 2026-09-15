(() => {
  const params = new URLSearchParams(window.location.search);
  const file = params.get("file");
  const data = params.get("data");
  const requestedTitle = params.get("title");
  const language = params.get("lang") === "en" ? "en" : "fr";
  const messages = {
    fr: {
      back: "Retour au cours",
      download: "Télécharger le PDF",
      downloadData: "Télécharger les données",
      data: "Données",
      darkMode: "Mode sombre",
      lightMode: "Mode clair",
      missing: "Aucun document PDF n’a été indiqué.",
      invalid: "L’adresse du document PDF n’est pas valide.",
      forbidden: "Seuls les documents PDF hébergés sur ce site peuvent être affichés.",
      frameTitle: "Lecteur PDF",
    },
    en: {
      back: "Back to course",
      download: "Download PDF",
      downloadData: "Download data",
      data: "Data",
      darkMode: "Dark mode",
      lightMode: "Light mode",
      missing: "No PDF document was specified.",
      invalid: "The PDF document address is invalid.",
      forbidden: "Only PDF documents hosted on this site can be displayed.",
      frameTitle: "PDF reader",
    },
  }[language];
  const frame = document.querySelector("#pdf-reader-frame");
  const error = document.querySelector("#pdf-reader-error");
  const back = document.querySelector("#pdf-back");
  const themeButton = document.querySelector("#pdf-theme");
  const themeIcon = themeButton.querySelector("i");
  const download = document.querySelector("#pdf-download");
  const downloadData = document.querySelector("#pdf-data");
  const downloadDataLabel = document.querySelector("#pdf-data-label");

  document.documentElement.lang = language;
  back.setAttribute("aria-label", messages.back);
  back.title = messages.back;
  download.setAttribute("aria-label", messages.download);
  download.title = messages.download;
  downloadData.setAttribute("aria-label", messages.downloadData);
  downloadData.title = messages.downloadData;
  downloadDataLabel.textContent = messages.data;

  const showError = (message) => {
    frame.hidden = true;
    error.textContent = message;
    error.hidden = false;
    themeButton.hidden = true;
    download.hidden = true;
    downloadData.hidden = true;
  };

  if (!file) {
    showError(messages.missing);
    return;
  }

  let pdfUrl;

  try {
    pdfUrl = new URL(file, window.location.origin);
  } catch {
    showError(messages.invalid);
    return;
  }

  if (
    pdfUrl.origin !== window.location.origin ||
    !pdfUrl.pathname.toLowerCase().endsWith(".pdf")
  ) {
    showError(messages.forbidden);
    return;
  }

  const viewerUrl = new URL(
    "/content/tools/pdfjs/web/viewer.html",
    window.location.origin,
  );
  viewerUrl.searchParams.set("file", `${pdfUrl.pathname}${pdfUrl.search}`);
  viewerUrl.hash = "pagemode=none";

  let pdfTheme = "light";

  try {
    pdfTheme = window.localStorage.getItem("pdf-reader-theme") === "dark"
      ? "dark"
      : "light";
  } catch {
    pdfTheme = "light";
  }

  let themeObserver;

  const applyPdfTheme = () => {
    const isDark = pdfTheme === "dark";
    const themeLabel = isDark ? messages.lightMode : messages.darkMode;
    themeButton.setAttribute("aria-label", themeLabel);
    themeButton.setAttribute("aria-pressed", String(isDark));
    themeButton.title = themeLabel;
    themeIcon.className = isDark ? "bi bi-sun" : "bi bi-moon-stars";

    const frameDocument = frame.contentDocument;
    if (!frameDocument) {
      return;
    }

    themeObserver?.disconnect();
    frameDocument.documentElement.classList.toggle("teaching-pdf-dark", isDark);

    const updateRenderedPages = () => {
      const canvasWrappers = frameDocument.querySelectorAll(
        ".pdfViewer .page .canvasWrapper",
      );

      for (const canvasWrapper of canvasWrappers) {
        if (isDark) {
          canvasWrapper.style.setProperty(
            "filter",
            "invert(0.9) hue-rotate(180deg)",
            "important",
          );
          canvasWrapper.dataset.teachingPdfDark = "true";
        } else if (canvasWrapper.dataset.teachingPdfDark) {
          canvasWrapper.style.removeProperty("filter");
          delete canvasWrapper.dataset.teachingPdfDark;
        }
      }
    };

    updateRenderedPages();

    const viewer = frameDocument.querySelector("#viewer");
    if (isDark && viewer) {
      themeObserver = new MutationObserver(updateRenderedPages);
      themeObserver.observe(viewer, { childList: true, subtree: true });
    }
  };

  themeButton.addEventListener("click", () => {
    pdfTheme = pdfTheme === "dark" ? "light" : "dark";

    try {
      window.localStorage.setItem("pdf-reader-theme", pdfTheme);
    } catch {
      // The selected theme remains active for the current page.
    }

    applyPdfTheme();
  });
  frame.addEventListener("load", applyPdfTheme);
  applyPdfTheme();

  let backUrl;

  try {
    const referrerUrl = new URL(document.referrer);
    if (referrerUrl.origin === window.location.origin) {
      backUrl = `${referrerUrl.pathname}${referrerUrl.search}${referrerUrl.hash}`;
    }
  } catch {
    backUrl = undefined;
  }

  if (!backUrl) {
    const coursePath = pdfUrl.pathname.match(
      /^\/content\/courses\/([^/]+)\/(fr|en)\//,
    );
    backUrl = coursePath
      ? `/${coursePath[2]}/teaching/${coursePath[1]}/`
      : `/${language}/`;
  }
  back.href = backUrl;

  const title = requestedTitle || pdfUrl.pathname.split("/").pop() || "Document PDF";
  document.title = `${title} – TEACHING`;
  frame.title = `${messages.frameTitle}: ${title}`;
  const viewerPath = `${viewerUrl.pathname}${viewerUrl.search}${viewerUrl.hash}`;
  frame.src = viewerPath;
  download.href = `${pdfUrl.pathname}${pdfUrl.search}`;

  if (data) {
    try {
      const dataUrl = new URL(data, window.location.origin);
      const isDownloadableData = /\.(csv|ods|xlsx)$/i.test(dataUrl.pathname);

      if (dataUrl.origin === window.location.origin && isDownloadableData) {
        downloadData.href = `${dataUrl.pathname}${dataUrl.search}`;
        downloadData.hidden = false;
      }
    } catch {
      downloadData.hidden = true;
    }
  }
})();
