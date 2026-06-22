let deferredInstallPrompt = null;

function isStandaloneApp() {
  return window.matchMedia("(display-mode: standalone)").matches
    || window.navigator.standalone === true
    || document.referrer.includes("android-app://");
}

function isIosDevice() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function canShowInstallUi() {
  return !isStandaloneApp() && !localStorage.getItem("ironmen_install_dismissed");
}

function initPwa() {
  applyStandaloneClass();
  registerServiceWorker();
  listenForInstallPrompt();
  listenForAppInstalled();
}

function applyStandaloneClass() {
  if (isStandaloneApp()) {
    document.body.classList.add("app-standalone");
    document.documentElement.classList.add("app-standalone");
  }
}

function listenForInstallPrompt() {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    render();
  });
}

function listenForAppInstalled() {
  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    localStorage.removeItem("ironmen_install_dismissed");
    document.body.classList.add("app-standalone");
    render();
  });
}

async function installPwa() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    if (outcome === "accepted") render();
    return;
  }
  if (isIosDevice()) {
    alert("On iPhone/iPad: tap Share, then \"Add to Home Screen\" to install IronMen as an app.");
    return;
  }
  alert("Install from your browser menu: ⋮ → Install app, or Add to Home screen.");
}

function dismissInstallBanner() {
  localStorage.setItem("ironmen_install_dismissed", "1");
  render();
}

function renderInstallBanner(className = "pwa-install-banner") {
  if (!canShowInstallUi()) return "";

  const isIos = isIosDevice();
  const hasNativePrompt = !!deferredInstallPrompt;

  return `
    <div class="${className}" id="pwa-install-banner">
      <div class="pwa-install-inner">
        <div class="pwa-install-icon">📱</div>
        <div class="pwa-install-text">
          <strong>${isStandaloneApp() ? "IronMen App" : "Get the IronMen App"}</strong>
          <p>${hasNativePrompt
            ? "Install on your phone for offline access, SOS, and daily check-ins — no app store needed."
            : isIos
              ? "Tap Share → Add to Home Screen for the full app experience."
              : "Add to your home screen — works like a native app with one tap."}</p>
        </div>
        <div class="pwa-install-actions">
          <button class="btn btn-primary btn-sm" onclick="installPwa()">${hasNativePrompt ? "Install App" : "How to Install"}</button>
          <button class="btn btn-ghost btn-sm pwa-install-dismiss" onclick="dismissInstallBanner()" aria-label="Dismiss">✕</button>
        </div>
      </div>
    </div>
  `;
}

function renderGetAppSection() {
  if (isStandaloneApp()) return "";

  return `
    <section class="home-section home-section-alt" id="get-app">
      <div class="home-container">
        <div class="home-section-header">
          <p class="home-eyebrow">Website + App</p>
          <h2>One brotherhood — browse the site or install the app</h2>
          <p class="home-section-desc">Use IronMen in your browser like a website, or install it on your phone for a full-screen app with offline pages, SOS, and reminders.</p>
        </div>
        <div class="get-app-grid">
          <article class="card get-app-card">
            <div class="get-app-icon">🌐</div>
            <h3>Use as a website</h3>
            <p>Share the link, apply online, partner with us, and browse jobs from any browser — no download required.</p>
            <button class="btn btn-secondary btn-sm" onclick="scrollToSection('programs')">Explore programs</button>
          </article>
          <article class="card get-app-card get-app-card-featured">
            <div class="get-app-icon">📱</div>
            <h3>Install as an app</h3>
            <p>Add IronMen to your home screen. Opens full-screen like a native app — accountability, check-ins, The Forge, and SOS one tap away.</p>
            <button class="btn btn-primary btn-sm" onclick="installPwa()">Install IronMen App</button>
          </article>
        </div>
        <div class="get-app-platforms">
          <span>Android — Install prompt or Chrome menu</span>
          <span>iPhone — Safari → Share → Add to Home Screen</span>
          <span>Desktop — Chrome/Edge → Install app</span>
        </div>
      </div>
    </section>
  `;
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((reg) => {
      if (reg.active && !reg.active.scriptURL.includes("sw.js")) return;
      reg.update();
    });
  });

  navigator.serviceWorker.register("/sw.js?v=4").then((reg) => {
    reg.update();
    reg.addEventListener("updatefound", () => {
      const worker = reg.installing;
      if (!worker) return;
      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          showUpdateToast();
        }
      });
    });
  }).catch(() => {});
}

function showUpdateToast() {
  const existing = document.getElementById("pwa-update-toast");
  if (existing) return;

  const toast = document.createElement("div");
  toast.id = "pwa-update-toast";
  toast.className = "pwa-update-toast";
  toast.innerHTML = `
    <span>A new version of IronMen is ready.</span>
    <button class="btn btn-primary btn-sm" onclick="reloadForUpdate()">Update</button>
    <button class="btn btn-ghost btn-sm" onclick="this.parentElement.remove()">Later</button>
  `;
  document.body.appendChild(toast);
}

function reloadForUpdate() {
  navigator.serviceWorker.getRegistration().then((reg) => {
    if (reg?.waiting) reg.waiting.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  });
}