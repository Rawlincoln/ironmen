function renderDirectorDashboard() {
  if (!isStaff()) {
    return `<div class="empty-state"><p>Director dashboard is for staff only.</p></div>`;
  }
  const cohort = getActiveCohort(house);
  const occupancy = getOccupancy(house);
  const apps = applicationsData.applications || [];
  const pendingApps = apps.filter((a) => a.status === "applied").length;
  const pendingInq = (community.inquiries || []).filter((i) => i.status === "pending").length;
  const pendingWomen = (community.supporterInquiries || []).filter((i) => i.status === "pending").length;
  const svc = house.fridayService || getDefaultFridayService();
  const nextFriday = getNextFriday(new Date(), svc.serviceTime);
  const nextDateStr = nextFriday.toISOString().split("T")[0];
  const session = svc.sessions?.find((s) => s.date === nextDateStr);
  const rsvpCount = session?.attendance?.filter((a) => a.rsvp).length || 0;
  const residents = cohort?.residents?.filter((r) => r.status === "active") || [];
  const missedCheckIn = residents.filter((r) => {
    const u = r.name.toLowerCase();
    return !user.checkIns?.length && user.name?.toLowerCase() === u;
  });

  return `
    <div class="page-header">
      <h1>Director Command Center</h1>
      <p>One view of beds, applicants, inquiries, and tonight's service. ${apiOnline ? "🟢 Server connected" : "🟡 Offline — local data only"}</p>
    </div>
    <div class="dashboard-grid">
      <div class="stat-card stat-alert"><div class="stat-value">${occupancy.occupied}/${occupancy.capacity}</div><div class="stat-title">Beds Filled</div></div>
      <div class="stat-card"><div class="stat-value">${pendingApps}</div><div class="stat-title">New Applications</div></div>
      <div class="stat-card"><div class="stat-value">${pendingInq + pendingWomen}</div><div class="stat-title">Partner Inquiries</div></div>
      <div class="stat-card"><div class="stat-value">${rsvpCount}</div><div class="stat-title">Friday RSVPs</div></div>
    </div>
    <div class="dashboard-row" style="margin-top:24px;">
      <div class="card">
        <h3 style="margin-bottom:16px;">Quick Actions</h3>
        <button class="btn btn-primary btn-block" style="margin-bottom:8px;" onclick="navigate('applications')">Review Applications (${apps.length})</button>
        <button class="btn btn-secondary btn-block" style="margin-bottom:8px;" onclick="navigate('intake')">Intake Screening</button>
        <button class="btn btn-secondary btn-block" style="margin-bottom:8px;" onclick="navigate('friday')">Friday Service</button>
        <button class="btn btn-secondary btn-block" onclick="navigate('placement')">Job Placements</button>
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px;">Director Settings</h3>
        <div class="form-group"><label>Contact Phone</label><input class="form-control" id="cfg-phone" value="${siteConfig.contact.phone}"></div>
        <div class="form-group"><label>WhatsApp (254...)</label><input class="form-control" id="cfg-whatsapp" value="${siteConfig.contact.whatsapp}"></div>
        <div class="form-group"><label>Location</label><input class="form-control" id="cfg-location" value="${siteConfig.contact.location}"></div>
        <div class="form-group"><label>Director PIN</label><input class="form-control" id="cfg-director-pin" type="password" placeholder="New PIN"></div>
        <button class="btn btn-primary btn-sm" onclick="saveDirectorSettings()">Save Settings</button>
        <button class="btn btn-secondary btn-sm" style="margin-left:8px;" onclick="loadDemoData()">Load Demo Data</button>
        <button class="btn btn-ghost btn-sm" style="margin-left:8px;" onclick="clearDemoData()">Clear Demo Data</button>
      </div>
    </div>
    ${cohort ? `
      <div class="card" style="margin-top:24px;">
        <h3 style="margin-bottom:12px;">Active Cohort: ${cohort.name}</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;">Week ${getCohortWeek(cohort)} of ${PROGRAM_WEEKS} &bull; ${getDaysRemaining(cohort)} days remaining</p>
      </div>
    ` : `<div class="card" style="margin-top:24px;"><p>No active cohort. <button class="btn btn-primary btn-sm" onclick="houseFormMode='newCohort';navigate('residents')">Start Cohort</button></p></div>`}
  `;
}

function saveDirectorSettings() {
  if (!isStaff()) return;
  siteConfig.contact.phone = document.getElementById("cfg-phone")?.value.trim() || siteConfig.contact.phone;
  siteConfig.contact.whatsapp = document.getElementById("cfg-whatsapp")?.value.trim() || siteConfig.contact.whatsapp;
  siteConfig.contact.location = document.getElementById("cfg-location")?.value.trim() || siteConfig.contact.location;
  const newPin = document.getElementById("cfg-director-pin")?.value.trim();
  if (newPin) siteConfig.directorPin = newPin;
  saveSiteConfig(siteConfig);
  alert("Settings saved.");
  render();
}

function loadDemoData() {
  if (!isStaff() || !confirm("Load sample cohort, applications, and inquiries for demonstration?")) return;
  const today = new Date().toISOString().split("T")[0];
  if (!getActiveCohort(house)) {
    const cohort = createCohort("Demo Cohort 1", today);
    cohort.residents.push(createResident({ name: "Demo Resident", age: 22, room: 1, mentor: "Demo Mentor", phone: "0700000000", intakeDate: today }));
    house.cohorts.push(cohort);
    saveHouse(house);
  }
  applicationsData.applications.push({
    id: "app-demo-1",
    name: "Samuel K.",
    age: 21,
    phone: "0711 111 111",
    status: "applied",
    date: today,
    motivation: "I need structure and brotherhood to stop gambling.",
    vices: ["gambling"],
  });
  saveApplicationsLocal(applicationsData);
  persistApplications();
  siteConfig.showSampleData = true;
  saveSiteConfig(siteConfig);
  alert("Demo data loaded.");
  render();
}

function clearDemoData() {
  if (!isStaff() || !confirm("Clear demo applications only? (House data unchanged)")) return;
  applicationsData.applications = applicationsData.applications.filter((a) => !a.id.includes("demo"));
  saveApplicationsLocal(applicationsData);
  persistApplications();
  render();
}