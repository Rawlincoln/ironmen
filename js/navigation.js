let historyPop = false;

const PUBLIC_VIEWS = ["landing", "partner", "opportunities", "apply", "alumni"];

const APP_VIEWS = [
  "dashboard", "streaks", "checkin", "devotional", "goals", "resources", "journal", "accountability",
  "friday", "partner", "opportunities", "apply", "alumni",
  "director-dash", "applications", "placement",
  "house", "intake", "residents", "curriculum", "schedule", "training", "skills", "graduation", "alumni", "documents", "myprogram",
  "onboarding",
];

function getDefaultViewForRole() {
  if (user.role === "director") return "director-dash";
  if (user.role === "mentor") return "house";
  if (user.role === "resident") return "myprogram";
  return "dashboard";
}

function getHistoryUrl(view) {
  if (!view || view === "landing") {
    return window.location.pathname + window.location.search;
  }
  return `#${view}`;
}

function pushHistory(view, options = {}) {
  if (historyPop) return;

  const state = { view };
  if (view === "onboarding") state.onboardingStep = onboardingStep;

  const url = getHistoryUrl(view);
  if (options.replace) {
    history.replaceState(state, "", url);
  } else {
    history.pushState(state, "", url);
  }
}

function navigate(view, options = {}) {
  if (!view) return;

  currentView = view;
  selectedMood = "";
  selectedVictory = null;
  document.getElementById("sidebar")?.classList.remove("open");

  pushHistory(view, options);
  render();
}

function initNavigation() {
  window.addEventListener("popstate", (e) => {
    historyPop = true;

    if (e.state?.view) {
      currentView = e.state.view;
      if (e.state.onboardingStep !== undefined) {
        onboardingStep = e.state.onboardingStep;
      }
    } else {
      currentView = "landing";
      onboardingStep = 0;
    }

    render();
    historyPop = false;
  });

  const hash = location.hash.slice(1).split("?")[0];
  if (hash === "women") {
    currentView = "partner";
    partnerFormType = "women";
  } else if (hash && APP_VIEWS.includes(hash)) {
    currentView = hash;
  } else if (user.loggedIn && user.onboardingComplete) {
    currentView = getDefaultViewForRole();
  } else {
    currentView = "landing";
  }

  if (!user.loggedIn && !PUBLIC_VIEWS.includes(currentView)) {
    currentView = "landing";
  }

  if (user.loggedIn && user.onboardingComplete && currentView === "onboarding") {
    currentView = getDefaultViewForRole();
  }

  history.replaceState(
    { view: currentView, onboardingStep },
    "",
    getHistoryUrl(currentView)
  );
}

function logout() {
  user.loggedIn = false;
  saveUser(user);
  clearStaffToken();
  currentView = "landing";
  onboardingStep = 0;
  closeModal();
  history.replaceState({ view: "landing" }, "", getHistoryUrl("landing"));
  render();
}

function onboardingNavigate(step, options = {}) {
  onboardingStep = step;
  currentView = "onboarding";
  pushHistory("onboarding", options);
  render();
}