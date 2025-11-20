try {
  console.log("DevTools loader starting...");
  chrome.devtools.panels.create(
    "Detectdiv",
    "images/favicon/favicon-128x128-rounded.png",
    "panel.html",
    function() {
      console.log("Panel created successfully");
    }
  );
} catch (e) {
  console.error("Error creating panel", e);
}
