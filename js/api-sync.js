let apiOnline = false;
let staffToken = localStorage.getItem("ironmen_staff_token") || "";
let applicationsData = loadApplicationsLocal();

function loadApplicationsLocal() {
  try {
    const raw = localStorage.getItem("ironmen_applications");
    if (raw) return JSON.parse(raw);
  } catch {}
  return { applications: [], mpesaConfirmations: [], placementMatches: [] };
}

function saveApplicationsLocal(data) {
  applicationsData = data;
  localStorage.setItem("ironmen_applications", JSON.stringify(data));
}

async function initApiSync() {
  try {
    const res = await fetch("/api/health", { method: "GET" });
    if (!res.ok) return;
    apiOnline = true;
    const sync = await fetch("/api/sync");
    if (!sync.ok) return;
    const data = await sync.json();
    if (data.house && Object.keys(data.house).length) {
      house = { ...getDefaultHouse(), ...data.house, fridayService: { ...getDefaultFridayService(), ...(data.house.fridayService || {}) } };
      localStorage.setItem("ironmen_house", JSON.stringify(house));
    }
    if (data.community && Object.keys(data.community).length) {
      community = loadCommunityFromData(data.community);
      saveCommunity(community, { skipApi: true });
    }
    if (data.siteConfig && Object.keys(data.siteConfig).length) {
      siteConfig = { ...getDefaultSiteConfig(), ...data.siteConfig };
      localStorage.setItem("ironmen_site_config", JSON.stringify(siteConfig));
    }
    if (data.applications) {
      saveApplicationsLocal({
        applications: data.applications.applications || [],
        mpesaConfirmations: data.applications.mpesaConfirmations || [],
        placementMatches: data.applications.placementMatches || applicationsData.placementMatches || [],
      });
    }
  } catch {
    apiOnline = false;
  }
}

function loadCommunityFromData(data) {
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
}

async function publicSubmit(channel, payload) {
  payload.date = payload.date || new Date().toISOString().split("T")[0];
  let apiOk = false;
  if (apiOnline) {
    try {
      const res = await fetch("/api/public/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, payload, date: payload.date }),
      });
      apiOk = res.ok;
    } catch {}
  }
  if (channel === "application") {
    if (!applicationsData.applications.some((a) => a.id === payload.id)) {
      applicationsData.applications.push(payload);
    }
    saveApplicationsLocal(applicationsData);
    return apiOk || true;
  }
  if (channel === "inquiry") {
    if (!community.inquiries.some((i) => i.id === payload.id)) {
      community.inquiries.push(payload);
    }
    saveCommunity(community, { skipApi: true });
    return apiOk || true;
  }
  if (channel === "supporter") {
    if (!community.supporterInquiries.some((i) => i.id === payload.id)) {
      community.supporterInquiries.push(payload);
    }
    saveCommunity(community, { skipApi: true });
    return apiOk || true;
  }
  if (channel === "interest") {
    community.interestLogs.push(payload);
    saveCommunity(community, { skipApi: true });
    return apiOk || true;
  }
  if (channel === "mpesa") {
    applicationsData.mpesaConfirmations = applicationsData.mpesaConfirmations || [];
    applicationsData.mpesaConfirmations.push(payload);
    saveApplicationsLocal(applicationsData);
    return apiOk || true;
  }
  return false;
}

async function staffPut(key, data) {
  if (!apiOnline || !staffToken) return false;
  try {
    const res = await fetch(`/api/${key}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-Staff-Token": staffToken },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function persistHouse() {
  if (apiOnline && staffToken) staffPut("house", house);
}

function persistCommunity() {
  if (apiOnline && staffToken) staffPut("community", community);
}

function persistSiteConfig() {
  if (apiOnline && staffToken) staffPut("site-config", siteConfig);
}

function persistApplications() {
  if (apiOnline && staffToken) staffPut("applications", applicationsData);
}

const _saveHouse = saveHouse;
saveHouse = function (h) {
  _saveHouse(h);
  persistHouse();
};

const _saveCommunity = saveCommunity;
saveCommunity = function (c, opts = {}) {
  _saveCommunity(c);
  if (!opts.skipApi) persistCommunity();
};