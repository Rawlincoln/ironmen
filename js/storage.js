const STORAGE_KEY = "ironmen_user";

function getDefaultUser() {
  const today = new Date().toISOString().split("T")[0];
  return {
    name: "",
    role: "",
    inProgram: false,
    isGraduate: false,
    loggedIn: false,
    joinedDate: today,
    ageVerified: false,
    onboardingComplete: false,
    vices: {
      porn: { tracking: false, startDate: today, relapses: [] },
      gambling: { tracking: false, startDate: today, relapses: [] },
      drugs: { tracking: false, startDate: today, relapses: [] },
      other: { tracking: false, startDate: today, relapses: [], label: "" },
    },
    checkIns: [],
    goals: DEFAULT_GOALS.map((g) => ({ ...g, completed: false, streak: 0 })),
    journal: [],
    accountabilityPartner: "",
    lastDevotionalDay: 0,
    completedDevotionals: [],
  };
}

function loadUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultUser();
    const user = JSON.parse(raw);
    const merged = { ...getDefaultUser(), ...user };
    if (merged.onboardingComplete && merged.loggedIn === undefined) {
      merged.loggedIn = true;
    }
    return merged;
  } catch {
    return getDefaultUser();
  }
}

function saveUser(user) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function daysBetween(startDate, endDate = new Date()) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
}

function getStreak(vice) {
  if (!vice.tracking) return 0;
  const days = daysBetween(vice.startDate);
  return days;
}

function hasCheckedInToday(user) {
  const today = new Date().toISOString().split("T")[0];
  return user.checkIns.some((c) => c.date === today);
}

function getTodayCheckIn(user) {
  const today = new Date().toISOString().split("T")[0];
  return user.checkIns.find((c) => c.date === today);
}

function getActiveVices(user) {
  return VICES.filter((v) => user.vices[v.id]?.tracking);
}

function getViceDisplayName(viceDef, userRef = user) {
  if (viceDef.id === "other") {
    const label = userRef.vices.other?.label?.trim();
    return label || viceDef.name;
  }
  return viceDef.name;
}

function getLongestStreak(user) {
  const streaks = getActiveVices(user).map((v) => getStreak(user.vices[v.id]));
  return streaks.length ? Math.max(...streaks) : 0;
}

function getTotalCheckIns(user) {
  return user.checkIns.length;
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}