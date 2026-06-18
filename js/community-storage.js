const COMMUNITY_STORAGE_KEY = "ironmen_community";

function loadCommunity() {
  try {
    const raw = localStorage.getItem(COMMUNITY_STORAGE_KEY);
    if (!raw) return getDefaultCommunity();
    const data = JSON.parse(raw);
    const defaults = getDefaultCommunity();
    const opportunities = (data.opportunities?.length ? data.opportunities : defaults.opportunities).map((o) => ({
      ...o,
      priorityDays: o.priorityDays ?? DEFAULT_PRIORITY_DAYS,
    }));
    return {
      ...defaults,
      ...data,
      partners: data.partners?.length ? data.partners : defaults.partners,
      womenSupporters: data.womenSupporters?.length ? data.womenSupporters : defaults.womenSupporters,
      supporterInquiries: data.supporterInquiries || [],
      opportunities,
      paymentInfo: { ...defaults.paymentInfo, ...(data.paymentInfo || {}) },
    };
  } catch {
    return getDefaultCommunity();
  }
}

function saveCommunity(community) {
  localStorage.setItem(COMMUNITY_STORAGE_KEY, JSON.stringify(community));
}

function isActiveResident(house, userName) {
  if (!userName || !house) return false;
  const cohort = getActiveCohort(house);
  if (!cohort) return false;
  return cohort.residents.some(
    (r) => r.name.toLowerCase() === userName.toLowerCase() && r.status === "active"
  );
}

function isGraduate(house, userName, user) {
  if (!userName) return false;
  if (user?.isGraduate) return true;
  if (!house) return false;
  return house.cohorts.some((c) =>
    c.residents.some(
      (r) => r.name.toLowerCase() === userName.toLowerCase() && r.status === "graduated"
    )
  );
}

function getUserJobTier(user, house) {
  if (!user?.name) return "public";
  if (user.role === "director" || user.role === "mentor") return "staff";
  if (
    isActiveResident(house, user.name) ||
    (user.role === "resident" && user.inProgram) ||
    isGraduate(house, user.name, user)
  ) {
    return "priority";
  }
  return "brotherhood";
}

function getOpportunityPublicDate(opp) {
  const days = opp.priorityDays ?? DEFAULT_PRIORITY_DAYS;
  return addDays(opp.postedDate, days);
}

function isInPriorityWindow(opp, date = new Date()) {
  const publicDate = getOpportunityPublicDate(opp);
  const today = new Date(date);
  today.setHours(0, 0, 0, 0);
  const opens = new Date(publicDate);
  opens.setHours(0, 0, 0, 0);
  return today < opens;
}

function canAccessOpportunity(opp, user, house) {
  const tier = getUserJobTier(user, house);
  if (tier === "staff" || tier === "priority") return true;
  return !isInPriorityWindow(opp);
}

function canExpressInterest(opp, user, house) {
  if (!user?.name) return false;
  return canAccessOpportunity(opp, user, house);
}

function getOpenOpportunities(community, filter = "all") {
  let list = community.opportunities.filter((o) => o.status === "open");
  if (filter !== "all") list = list.filter((o) => o.type === filter);
  return list.sort((a, b) => b.postedDate.localeCompare(a.postedDate));
}

function getPartnersByType(community, type) {
  return community.partners.filter((p) => !type || p.type === type);
}