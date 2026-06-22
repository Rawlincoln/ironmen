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

function applySyncData(data, includeApplications = false) {
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
  if (includeApplications && data.applications) {
    saveApplicationsLocal({
      applications: data.applications.applications || [],
      mpesaConfirmations: data.applications.mpesaConfirmations || [],
      placementMatches: data.applications.placementMatches || applicationsData.placementMatches || [],
    });
  }
}

async function fetchWithRetry(url, options = {}, retries = 2) {
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 429) {
        const data = await res.json().catch(() => ({}));
        console.warn("Rate limited:", data.error || "slow down");
        return res;
      }
      return res;
    } catch (err) {
      if (i === retries) throw err;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
}

async function initApiSync() {
  try {
    const res = await fetchWithRetry("/api/health", { method: "GET" });
    if (!res.ok) return;
    apiOnline = true;
    const sync = await fetchWithRetry("/api/sync");
    if (!sync.ok) return;
    const data = await sync.json();
    applySyncData(data, false);
    if (staffToken && !staffToken.startsWith("local-")) {
      await syncStaffData();
    }
  } catch {
    apiOnline = false;
  }
}

async function syncStaffData() {
  if (!apiOnline || !staffToken || staffToken.startsWith("local-")) return false;
  try {
    const res = await fetchWithRetry("/api/sync/staff", {
      headers: { "X-Staff-Token": staffToken },
    });
    if (!res.ok) return false;
    const data = await res.json();
    applySyncData(data, true);
    return true;
  } catch {
    return false;
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
      const res = await fetchWithRetry("/api/public/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel, payload, date: payload.date }),
      });
      apiOk = res.ok;
      if (res.status === 429) return false;
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