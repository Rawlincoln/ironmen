const HOUSE_STORAGE_KEY = "ironmen_house";

function loadHouse() {
  try {
    const raw = localStorage.getItem(HOUSE_STORAGE_KEY);
    if (!raw) return getDefaultHouse();
    const house = JSON.parse(raw);
    const defaults = getDefaultHouse();
    return {
      ...defaults,
      ...house,
      fridayService: { ...defaults.fridayService, ...(house.fridayService || {}) },
    };
  } catch {
    return getDefaultHouse();
  }
}

function saveHouse(house) {
  localStorage.setItem(HOUSE_STORAGE_KEY, JSON.stringify(house));
}

function getActiveCohort(house) {
  return house.cohorts.find((c) => c.status === "active") || null;
}

function getUpcomingCohort(house) {
  return house.cohorts.find((c) => c.status === "upcoming") || null;
}

function getGraduatedCohorts(house) {
  return house.cohorts.filter((c) => c.status === "graduated");
}

function getCohortWeek(cohort, date = new Date()) {
  const start = new Date(cohort.startDate);
  const now = new Date(date);
  start.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const days = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.min(PROGRAM_WEEKS, Math.max(1, Math.ceil((days + 1) / 7)));
}

function getDaysRemaining(cohort, date = new Date()) {
  const end = new Date(cohort.endDate);
  const now = new Date(date);
  end.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((end - now) / (1000 * 60 * 60 * 24)));
}

function getProgramProgress(cohort, date = new Date()) {
  const start = new Date(cohort.startDate);
  const end = new Date(cohort.endDate);
  const now = new Date(date);
  const total = end - start;
  const elapsed = now - start;
  return Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
}

function getOccupancy(house) {
  const cohort = getActiveCohort(house);
  if (!cohort) return { occupied: 0, capacity: house.capacity, available: house.capacity };
  const occupied = cohort.residents.filter((r) => r.status === "active").length;
  return { occupied, capacity: house.capacity, available: house.capacity - occupied };
}

function canAddResident(house) {
  const { available } = getOccupancy(house);
  return available > 0 && getActiveCohort(house) !== null;
}

function getAvailableRooms(house) {
  const cohort = getActiveCohort(house);
  if (!cohort) return Array.from({ length: house.capacity }, (_, i) => i + 1);
  const taken = cohort.residents.filter((r) => r.status === "active").map((r) => r.room);
  return Array.from({ length: house.capacity }, (_, i) => i + 1).filter((r) => !taken.includes(r));
}

function findResident(house, residentId) {
  for (const cohort of house.cohorts) {
    const resident = cohort.residents.find((r) => r.id === residentId);
    if (resident) return { cohort, resident };
  }
  return { cohort: null, resident: null };
}

function findResidentByName(house, name) {
  const cohort = getActiveCohort(house);
  if (!cohort) return null;
  return cohort.residents.find((r) => r.name.toLowerCase() === name.toLowerCase() && r.status === "active");
}

function getAverageSkillScore(resident) {
  const scores = SKILL_PILLARS.map((p) => resident.skills[p.id]?.current || 0);
  const sum = scores.reduce((a, b) => a + b, 0);
  return scores.length ? (sum / scores.length).toFixed(1) : "0";
}

function getSkillLevel(score) {
  if (score >= 8) return { label: "Excellent", class: "skill-excellent" };
  if (score >= 6) return { label: "Proficient", class: "skill-good" };
  if (score >= 4) return { label: "Developing", class: "skill-mid" };
  return { label: "Needs Work", class: "skill-low" };
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

function getNextFriday(date = new Date(), serviceTime = FRIDAY_SERVICE.time) {
  const d = new Date(date);
  const day = d.getDay();
  const [hours, minutes] = serviceTime.split(":").map(Number);

  if (day === 5) {
    const serviceToday = new Date(d);
    serviceToday.setHours(hours, minutes, 0, 0);
    if (date < serviceToday) return serviceToday;
  }

  const daysUntilFriday = day === 5 ? 7 : (5 - day + 7) % 7;
  d.setDate(d.getDate() + daysUntilFriday);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function formatServiceDateTime(date) {
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getTimeUntilService(nextFriday) {
  const now = new Date();
  const diff = nextFriday - now;
  if (diff <= 0) return "Service time — join now!";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (days > 0) return `${days}d ${hours}h until service`;
  if (hours > 0) return `${hours}h ${mins}m until service`;
  return `${mins} minutes until service`;
}

function getCurrentServiceTopic(house) {
  const idx = house.fridayService?.currentTopicIndex || 0;
  return SERVICE_TOPICS[idx % SERVICE_TOPICS.length];
}

function hasRSVPd(session, userName) {
  return session?.attendance?.some((a) => a.name.toLowerCase() === userName.toLowerCase());
}

function getUserServiceAttendance(house, userName) {
  return (house.fridayService?.sessions || []).filter((s) =>
    s.attendance?.some((a) => a.name.toLowerCase() === userName.toLowerCase() && a.present)
  ).length;
}