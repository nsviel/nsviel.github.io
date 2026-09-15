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
      open: "Ouvrir un PDF",
      choose: "Glissez-déposez un fichier ici ou cliquez pour le sélectionner.",
      drop: "Déposez le PDF ici",
      pdfOnly: "Veuillez sélectionner un fichier PDF.",
      invalidFile: "Ce fichier n’est pas un document PDF valide.",
      readError: "Impossible de lire ce fichier PDF.",
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
      open: "Open a PDF",
      choose: "Drag and drop a file here or click to select it.",
      drop: "Drop the PDF here",
      pdfOnly: "Please select a PDF file.",
      invalidFile: "This file is not a valid PDF document.",
      readError: "Unable to read this PDF file.",
    },
  }[language];
  const reader = document.querySelector(".pdf-reader");
  const frame = document.querySelector("#pdf-reader-frame");
  const welcome = document.querySelector("#pdf-reader-welcome");
  const welcomeTitle = document.querySelector("#pdf-reader-welcome-title");
  const welcomeHint = document.querySelector("#pdf-reader-welcome-hint");
  const fileInput = document.querySelector("#pdf-reader-input");
  const dropLabel = document.querySelector("#pdf-reader-drop-label");
  const error = document.querySelector("#pdf-reader-error");
  const back = document.querySelector("#pdf-back");
  const themeButton = document.querySelector("#pdf-theme");
  const themeIcon = themeButton.querySelector("i");
  const download = document.querySelector("#pdf-download");
  const downloadData = document.querySelector("#pdf-data");
  const downloadDataLabel = document.querySelector("#pdf-data-label");

  document.documentElement.lang = language;
  reader.setAttribute("aria-label", messages.frameTitle);
  welcomeTitle.textContent = messages.open;
  welcomeHint.textContent = messages.choose;
  dropLabel.textContent = messages.drop;
  back.setAttribute("aria-label", messages.back);
  back.title = messages.back;
  download.setAttribute("aria-label", messages.download);
  download.title = messages.download;
  downloadData.setAttribute("aria-label", messages.downloadData);
  downloadData.title = messages.downloadData;
  downloadDataLabel.textContent = messages.data;

  const showError = (message) => {
    frame.hidden = true;
    welcome.hidden = true;
    error.textContent = message;
    error.hidden = false;
    themeButton.hidden = true;
    download.hidden = true;
    downloadData.hidden = true;
  };

  const showLocalError = (message) => {
    error.textContent = message;
    error.hidden = false;
  };

  let pdfUrl;

  if (file) {
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
  }

  const viewerUrl = new URL(
    "/content/tools/pdfjs/web/viewer.html",
    window.location.origin,
  );
  viewerUrl.searchParams.set(
    "file",
    pdfUrl ? `${pdfUrl.pathname}${pdfUrl.search}` : "",
  );
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
    const coursePath = pdfUrl?.pathname.match(
      /^\/content\/courses\/([^/]+)\/(fr|en)\//,
    );
    backUrl = coursePath
      ? `/${coursePath[2]}/teaching/${coursePath[1]}/`
      : `/${language}/`;
  }
  back.href = backUrl;

  const setTitle = (title) => {
    document.title = `${title} – TEACHING`;
    frame.title = `${messages.frameTitle}: ${title}`;
  };

  if (pdfUrl) {
    const title = requestedTitle || pdfUrl.pathname.split("/").pop() || "Document PDF";
    setTitle(title);
    welcome.hidden = true;
    download.href = `${pdfUrl.pathname}${pdfUrl.search}`;
  } else {
    setTitle(messages.open);
    frame.hidden = true;
    download.hidden = true;
  }

  if (pdfUrl && data) {
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

  let localDownloadUrl;
  let localLoadId = 0;

  const getPdfApplication = async () => {
    if (!frame.contentWindow?.PDFViewerApplication) {
      if (frame.contentDocument?.readyState === "complete") {
        throw new Error("PDF.js failed to initialize.");
      }
      await new Promise((resolve) => frame.addEventListener("load", resolve, { once: true }));
    }

    const application = frame.contentWindow?.PDFViewerApplication;
    if (!application) {
      throw new Error("PDF.js failed to initialize.");
    }
    await application.initializedPromise;
    return application;
  };

  const loadLocalFile = async (localFile) => {
    const loadId = ++localLoadId;
    error.hidden = true;

    if (
      !localFile ||
      (localFile.type !== "application/pdf" && !localFile.name.toLowerCase().endsWith(".pdf"))
    ) {
      showLocalError(messages.pdfOnly);
      return;
    }

    let buffer;
    try {
      buffer = await localFile.arrayBuffer();
    } catch {
      if (loadId === localLoadId) {
        showLocalError(messages.readError);
      }
      return;
    }

    if (loadId !== localLoadId) {
      return;
    }

    const header = new TextDecoder("latin1").decode(
      new Uint8Array(buffer, 0, Math.min(buffer.byteLength, 1024)),
    );
    if (!header.includes("%PDF-")) {
      showLocalError(messages.invalidFile);
      return;
    }

    let application;
    try {
      application = await getPdfApplication();
      if (loadId !== localLoadId) {
        return;
      }
      await application.open({
        data: new Uint8Array(buffer),
        filename: localFile.name,
      });
    } catch {
      if (loadId === localLoadId) {
        showLocalError(messages.readError);
        if (!application?.pdfDocument) {
          frame.hidden = true;
          welcome.hidden = false;
          download.hidden = true;
        }
      }
      return;
    }

    if (loadId !== localLoadId) {
      return;
    }

    if (localDownloadUrl) {
      URL.revokeObjectURL(localDownloadUrl);
    }
    localDownloadUrl = URL.createObjectURL(localFile);
    download.href = localDownloadUrl;
    download.download = localFile.name;
    download.hidden = false;
    downloadData.hidden = true;
    welcome.hidden = true;
    frame.hidden = false;
    setTitle(localFile.name);
    applyPdfTheme();
  };

  const hasDraggedFiles = (event) =>
    Array.from(event.dataTransfer?.types || []).includes("Files");

  const handleDrag = (event) => {
    if (!hasDraggedFiles(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer.dropEffect = "copy";
    reader.classList.add("is-dragging");
  };

  const handleDragLeave = (event) => {
    if (event.relatedTarget === null) {
      reader.classList.remove("is-dragging");
    }
  };

  const handleDrop = (event) => {
    if (!hasDraggedFiles(event)) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    reader.classList.remove("is-dragging");
    loadLocalFile(event.dataTransfer.files[0]);
  };

  const attachDropTarget = (target, trackDragLeave = true) => {
    target.addEventListener("dragenter", handleDrag, true);
    target.addEventListener("dragover", handleDrag, true);
    if (trackDragLeave) {
      target.addEventListener("dragleave", handleDragLeave, true);
    }
    target.addEventListener("drop", handleDrop, true);
  };

  welcome.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", () => {
    loadLocalFile(fileInput.files[0]);
    fileInput.value = "";
  });
  attachDropTarget(reader);
  window.addEventListener("dragend", () => reader.classList.remove("is-dragging"));
  frame.addEventListener("load", () => {
    applyPdfTheme();
    attachDropTarget(frame.contentDocument, false);
  });

  const viewerPath = `${viewerUrl.pathname}${viewerUrl.search}${viewerUrl.hash}`;
  frame.src = viewerPath;
})();
