function renderPlacementPage() {
  if (!isStaff()) {
    return `<div class="page-header"><h1>Job Placements</h1><p>Placement matching is managed by the House Director.</p></div>`;
  }
  const openJobs = community.opportunities.filter((o) => o.status === "open");
  const matches = applicationsData.placementMatches || [];
  const cohort = getActiveCohort(house);
  const graduates = house.cohorts.flatMap((c) =>
    c.residents.filter((r) => r.status === "graduated" || r.status === "active").map((r) => ({ ...r, cohortName: c.name }))
  );

  return `
    <div class="page-header">
      <h1>Job Placement Matching</h1>
      <p>Connect residents and graduates with open opportunities.</p>
    </div>
    <div class="dashboard-row">
      <div class="card">
        <h3 style="margin-bottom:16px;">Create Match</h3>
        <div class="form-group">
          <label>Opportunity</label>
          <select class="form-control" id="match-opp">
            ${openJobs.map((o) => `<option value="${o.id}">${o.title} — ${o.organization}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Resident / Graduate</label>
          <select class="form-control" id="match-resident">
            ${graduates.map((r) => `<option value="${r.id}">${r.name} (${r.cohortName})</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Status</label>
          <select class="form-control" id="match-status">
            <option value="interested">Interested</option>
            <option value="interview">Interview scheduled</option>
            <option value="placed">Placed / Hired</option>
            <option value="declined">Declined</option>
          </select>
        </div>
        <button class="btn btn-primary btn-sm" onclick="createPlacementMatch()">Save Match</button>
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px;">Recent Interest Logs</h3>
        ${community.interestLogs.slice().reverse().slice(0, 8).map((l) => {
          const opp = community.opportunities.find((o) => o.id === l.opportunityId);
          return `<div class="journal-entry"><div class="journal-date">${l.userName}</div><div class="journal-text">${opp?.title || "Job"}</div></div>`;
        }).join("") || "<p style='color:var(--text-muted);'>No interest logged yet.</p>"}
      </div>
    </div>
    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:16px;">Placement Pipeline</h3>
      ${matches.length ? matches.slice().reverse().map((m) => {
        const opp = community.opportunities.find((o) => o.id === m.opportunityId);
        return `
          <div class="journal-entry">
            <div class="journal-date">${m.residentName} &bull; ${m.status} &bull; ${formatDate(m.date)}</div>
            <div class="journal-text">${opp?.title || "Unknown"} at ${opp?.organization || ""}</div>
          </div>
        `;
      }).join("") : `<p style="color:var(--text-muted);">No placement matches yet.</p>`}
    </div>
  `;
}

function createPlacementMatch() {
  if (!isStaff()) return;
  const oppId = document.getElementById("match-opp")?.value;
  const resId = document.getElementById("match-resident")?.value;
  const status = document.getElementById("match-status")?.value;
  const opp = community.opportunities.find((o) => o.id === oppId);
  let residentName = "Unknown";
  for (const c of house.cohorts) {
    const r = c.residents.find((x) => x.id === resId);
    if (r) {
      residentName = r.name;
      if (status === "placed") {
        r.placement = { organization: opp?.organization || "", role: opp?.title || "", date: new Date().toISOString().split("T")[0] };
        saveHouse(house);
      }
      break;
    }
  }
  applicationsData.placementMatches = applicationsData.placementMatches || [];
  applicationsData.placementMatches.push({
    id: `match-${Date.now()}`,
    opportunityId: oppId,
    residentId: resId,
    residentName,
    status,
    date: new Date().toISOString().split("T")[0],
  });
  saveApplicationsLocal(applicationsData);
  persistApplications();
  if (status === "placed") {
    siteConfig.outcomes.graduatesPlaced = (siteConfig.outcomes.graduatesPlaced || 0) + 1;
    saveSiteConfig(siteConfig);
  }
  render();
}