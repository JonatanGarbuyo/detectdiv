try {
  console.log("DevTools script loading...");
  chrome.runtime.sendMessage({ action: "log", message: "DevTools script loading..." });

  chrome.devtools.panels.create(
    "Detectdiv",
    "/images/favicon/favicon-128x128-rounded.png",
    "panel.html",
    (panel) => {
      console.log("Detectdiv panel created", panel);
      chrome.runtime.sendMessage({ action: "log", message: "Detectdiv panel created" });
    }
  );
} catch (e) {
  console.error("DevTools script error", e);
  chrome.runtime.sendMessage({ action: "log", message: "DevTools script error: " + e.message });
}
