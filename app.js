const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll("nav button");
const hero = document.querySelector(".hero");

function go(pageId) {
  pages.forEach((page) => {
    page.classList.toggle("active", page.id === pageId);
  });

  navButtons.forEach((button) => {
    button.classList.toggle("on", button.dataset.page === pageId);
  });

  if (pageId === "home") {
    hero.style.display = "block";
  } else {
    hero.style.display = "none";
  }

  window.scrollTo(0, 0);
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    go(button.dataset.page);
  });
});

/* PWA Service Worker */
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js");
  });
}

/* Android / Chrome uygulama yükleme */
let deferredPrompt;
const installButton = document.getElementById("install");

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;

  if (installButton) {
    installButton.hidden = false;
  }
});

if (installButton) {
  installButton.addEventListener("click", async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    await deferredPrompt.userChoice;

    deferredPrompt = null;
    installButton.hidden = true;
  });
}

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;

  if (installButton) {
    installButton.hidden = true;
  }
});
