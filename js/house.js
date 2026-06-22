let house = loadHouse();
let selectedResidentId = null;
let houseFormMode = null;

function isStaff() {
  return user.role === "director" || user.role === "mentor";
}

function getResidentRecord() {
  if (isStaff()) return null;
  return findResidentByName(house, user.name);
}

function renderHouseNav() {
  if (user.role !== "resident" && !isStaff()) return "";

  const staffNav = isStaff() ? `
    ${user.role === "director" ? `${navItem("director-dash", "🏛️", "Command Center")}` : ""}
    ${navItem("applications", "📋", "Applications")}
    ${navItem("placement", "🔗", "Placements")}
    ${navItem("house", "🏠", "House Overview")}
    ${navItem("intake", "📝", "Intake & Screening")}
    ${navItem("residents", "👥", "Residents")}
    ${navItem("curriculum", "📋", "12-Week Curriculum")}
    ${navItem("schedule", "🕐", "Daily Schedule")}
    ${navItem("training", "📖", "Training Log")}
    ${navItem("skills", "📈", "Skills & Assessment")}
    ${navItem("graduation", "🎓", "Graduation & Placement")}
    ${navItem("alumni", "🏆", "Alumni Cohorts")}
    ${navItem("documents", "📁", "Program Documents")}
  ` : `
    ${navItem("myprogram", "🏠", "My Program")}
    ${navItem("curriculum", "📋", "My Curriculum")}
    ${navItem("schedule", "🕐", "Daily Schedule")}
    ${navItem("skills", "📈", "My Skills")}
  `;

  return `<div class="nav-section-label">Halfway House</div>${staffNav}`;
}

function renderHouseOverview() {
  const cohort = getActiveCohort(house);
  const occupancy = getOccupancy(house);
  const graduated = getGraduatedCohorts(house).length;

  if (!cohort) {
    return `
      <div class="page-header">
        <h1>${house.name}</h1>
        <p>Residential program — ${house.capacity} beds, ${PROGRAM_WEEKS} weeks, ${PROGRAM_DAYS} days of transformation.</p>
      </div>
      <div class="card card-gold" style="text-align:center;padding:48px;">
        <div style="font-size:3rem;margin-bottom:16px;">🏠</div>
        <h2 style="margin-bottom:12px;">No Active Cohort</h2>
        <p style="color:var(--text-muted);margin-bottom:24px;">Start your first 3-month intake to begin transforming lives.</p>
        <button class="btn btn-primary" onclick="houseFormMode='newCohort';selectedResidentId=null;navigate('residents')">Start First Cohort</button>
      </div>
      <div class="dashboard-grid" style="margin-top:24px;">
        <div class="stat-card"><div class="stat-value">${house.capacity}</div><div class="stat-title">Total Capacity</div></div>
        <div class="stat-card"><div class="stat-value">${PROGRAM_WEEKS}</div><div class="stat-title">Program Weeks</div></div>
        <div class="stat-card"><div class="stat-value">${PROGRAM_DAYS}</div><div class="stat-title">Program Days</div></div>
        <div class="stat-card"><div class="stat-value">${graduated}</div><div class="stat-title">Cohorts Graduated</div></div>
      </div>
    `;
  }

  const week = getCohortWeek(cohort);
  const daysLeft = getDaysRemaining(cohort);
  const progress = getProgramProgress(cohort);
  const curriculum = CURRICULUM[week - 1];
  const placed = cohort.residents.filter((r) => r.placement).length;

  return `
    <div class="page-header">
      <h1>${house.name}</h1>
      <p>${cohort.name} &mdash; Week ${week} of ${PROGRAM_WEEKS}</p>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar-header">
        <span>Program Progress</span>
        <span>${progress}% &bull; ${daysLeft} days to graduation</span>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      <div class="progress-dates">
        <span>${formatDate(cohort.startDate)}</span>
        <span>Graduation: ${formatDate(cohort.endDate)}</span>
      </div>
    </div>

    <div class="dashboard-grid">
      <div class="stat-card"><div class="stat-value">${occupancy.occupied}/${occupancy.capacity}</div><div class="stat-title">Beds Occupied</div></div>
      <div class="stat-card"><div class="stat-value">${week}</div><div class="stat-title">Current Week</div></div>
      <div class="stat-card"><div class="stat-value">${daysLeft}</div><div class="stat-title">Days to Graduate</div></div>
      <div class="stat-card"><div class="stat-value">${placed}/${cohort.residents.length}</div><div class="stat-title">Placements Secured</div></div>
    </div>

    <div class="dashboard-row">
      <div class="card">
        <span class="phase-badge">${curriculum.phase}</span>
        <h3 style="margin:12px 0 8px;">Week ${week}: ${curriculum.title}</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">${curriculum.focus}</p>
        <ul class="tips-list">
          ${curriculum.modules.slice(0, 3).map((m) => `<li>${m}</li>`).join("")}
        </ul>
        <button class="btn btn-secondary btn-sm" style="margin-top:16px;" onclick="navigate('curriculum')">View Full Curriculum</button>
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px;">Quick Actions</h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${canAddResident(house) ? `<button class="btn btn-primary btn-block" onclick="navigate('intake')">Screen New Applicant</button>` : `<p style="color:var(--text-muted);font-size:0.9rem;">House at full capacity (${house.capacity}/${house.capacity})</p>`}
          <button class="btn btn-secondary btn-block" onclick="navigate('training')">Log Training Session</button>
          <button class="btn btn-secondary btn-block" onclick="navigate('skills')">Record Assessment</button>
          <button class="btn btn-secondary btn-block" onclick="navigate('graduation')">Graduation & Placement</button>
          <button class="btn btn-secondary btn-block" onclick="navigate('friday')">${THE_FORGE.name}</button>
        </div>
      </div>
    </div>

    <h3 style="margin-bottom:16px;">Current Residents</h3>
    <div class="resident-grid">
      ${cohort.residents.filter((r) => r.status === "active").map((r) => renderResidentCard(r, cohort)).join("") || `<div class="empty-state"><p>No residents admitted yet.</p></div>`}
    </div>
  `;
}

function renderResidentCard(resident, cohort) {
  const week = getCohortWeek(cohort);
  const avg = getAverageSkillScore(resident);
  const initials = resident.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return `
    <div class="resident-card" onclick="selectedResidentId='${resident.id}';navigate('residents')">
      <div class="resident-card-header">
        <div class="user-avatar">${initials}</div>
        <div>
          <div class="resident-name">${resident.name}</div>
          <div class="resident-meta">Room ${resident.room || "—"} &bull; Week ${week}</div>
        </div>
      </div>
      <div class="resident-stats">
        <span>Skills: ${avg}/10</span>
        <span>${resident.placement ? "✓ Placed" : "Seeking placement"}</span>
      </div>
      ${resident.mentor ? `<div class="resident-mentor">Mentor: ${resident.mentor}</div>` : ""}
    </div>
  `;
}

function renderResidents() {
  const cohort = getActiveCohort(house);
  const occupancy = getOccupancy(house);

  let formHtml = "";
  if (houseFormMode === "newCohort") {
    formHtml = `
      <div class="card" style="margin-bottom:24px;">
        <h3 style="margin-bottom:16px;">Start New Cohort</h3>
        <div class="form-group"><label>Cohort Name</label><input class="form-control" id="cohort-name" placeholder="e.g. Cohort I — June 2026"></div>
        <div class="form-group"><label>Start Date</label><input class="form-control" id="cohort-start" type="date" value="${new Date().toISOString().split("T")[0]}"></div>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Program runs ${PROGRAM_DAYS} days (${PROGRAM_WEEKS} weeks). Graduation date is set automatically.</p>
        <button class="btn btn-primary" onclick="startNewCohort()">Launch Cohort</button>
        <button class="btn btn-ghost" onclick="houseFormMode=null;render()">Cancel</button>
      </div>
    `;
  }

  const detailHtml = selectedResidentId ? renderResidentDetail(selectedResidentId) : "";

  return `
    <div class="page-header">
      <h1>Residents</h1>
      <p>${occupancy.occupied} of ${occupancy.capacity} beds occupied &mdash; ${PROGRAM_WEEKS}-week residential program</p>
    </div>
    ${formHtml}
    ${detailHtml}
    ${cohort ? `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
        <h3>${cohort.name} Residents</h3>
        ${canAddResident(house) ? `<button class="btn btn-primary btn-sm" onclick="navigate('intake')">+ New Intake Screening</button>` : ""}
      </div>
      <div class="resident-grid">
        ${cohort.residents.filter((r) => r.status === "active").map((r) => renderResidentCard(r, cohort)).join("") || `<div class="empty-state"><div class="icon">👥</div><p>No residents in this cohort yet.</p></div>`}
      </div>
    ` : `<div class="empty-state"><div class="icon">🏠</div><p>Start a cohort before admitting residents.</p></div>`}
  `;
}

function renderResidentDetail(residentId) {
  const { cohort, resident } = findResident(house, residentId);
  if (!resident) return "";

  const week = cohort ? getCohortWeek(cohort) : 1;
  const logs = resident.trainingLogs.slice(-5).reverse();
  const docs = resident.documents.slice(-5).reverse();

  return `
    <div class="card resident-detail" style="margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:start;">
        <div>
          <h2>${resident.name}</h2>
          <p style="color:var(--text-muted);">Room ${resident.room} &bull; Age ${resident.age} &bull; Week ${week} &bull; Mentor: ${resident.mentor || "Unassigned"}</p>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="selectedResidentId=null;render()">Close</button>
      </div>

      <div class="skill-bars" style="margin:24px 0;">
        ${SKILL_PILLARS.map((p) => {
          const s = resident.skills[p.id]?.current || 1;
          return `<div class="skill-bar-item"><div class="skill-bar-label"><span>${p.icon} ${p.name}</span><span>${s}/10</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:${s * 10}%;background:${p.color}"></div></div></div>`;
        }).join("")}
      </div>

      ${resident.placement ? `
        <div class="placement-badge">✓ Placed: ${resident.placement.organization} (${resident.placement.type})</div>
      ` : ""}

      <div class="tabs-row">
        <button class="btn btn-secondary btn-sm" onclick="addResidentDocument('${resident.id}')">+ Add Document</button>
        <button class="btn btn-secondary btn-sm" onclick="navigate('training')">Log Training</button>
        <button class="btn btn-secondary btn-sm" onclick="navigate('skills')">Assess Skills</button>
      </div>

      ${docs.length ? `<h4 style="margin:20px 0 12px;">Recent Documentation</h4>${docs.map((d) => `<div class="journal-entry"><div class="journal-date">${d.type} — ${formatDate(d.date)}</div><div class="journal-text">${d.content}</div></div>`).join("")}` : ""}
      ${logs.length ? `<h4 style="margin:20px 0 12px;">Recent Training</h4>${logs.map((l) => `<div class="journal-entry"><div class="journal-date">Week ${l.week} — ${formatDate(l.date)}</div><div class="journal-text"><strong>${l.module}</strong>: ${l.notes}</div></div>`).join("")}` : ""}
    </div>
  `;
}

function renderIntake() {
  const cohort = getActiveCohort(house);
  const occupancy = getOccupancy(house);
  const prefill = window._prefillApplicant;
  const atCapacity = !canAddResident(house);

  if (!cohort) {
    return `<div class="empty-state"><div class="icon">📝</div><p>Start a cohort before screening applicants.</p><button class="btn btn-primary" onclick="houseFormMode='newCohort';navigate('residents')">Start Cohort</button></div>`;
  }

  const rooms = atCapacity ? [] : getAvailableRooms(house);
  const defaultDecision = atCapacity ? "waitlist" : "admit";

  return `
    <div class="page-header">
      <h1>Intake & Screening</h1>
      <p>Complete all requirements before admitting an applicant. Minimum interview score: ${INTAKE_CRITERIA.minInterviewScore}/5.</p>
    </div>

    ${prefill ? `
      <div class="encouragement-banner" style="margin-bottom:24px;">
        <span class="icon">📋</span>
        <p>Screening application from <strong>${prefill.name}</strong> (submitted ${formatDate(prefill.date)}). Update status after your decision.</p>
      </div>
    ` : ""}

    ${atCapacity ? `
      <div class="card opportunity-wait-banner" style="margin-bottom:24px;">
        <span class="opportunity-priority-badge">🏠 At capacity</span>
        <p style="margin-top:8px;color:var(--text-muted);font-size:0.9rem;">House is full (${occupancy.occupied}/${occupancy.capacity}). Qualified applicants should be waitlisted until a bed opens.</p>
      </div>
    ` : ""}

    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:8px;">Step 1 — Applicant Details</h3>
      <div class="form-row">
        <div class="form-group"><label>Full Name *</label><input class="form-control" id="res-name" placeholder="Full name" value="${prefill?.name || ""}"></div>
        <div class="form-group"><label>Age * (minimum 18)</label><input class="form-control" id="res-age" type="number" min="18" value="${prefill?.age || 18}"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Phone</label><input class="form-control" id="res-phone" placeholder="Contact number" value="${prefill?.phone || ""}"></div>
        <div class="form-group"><label>National ID (last 4 digits)</label><input class="form-control" id="res-id" placeholder="For file reference"></div>
      </div>
      <div class="form-group"><label>Background / Motivation</label><textarea class="form-control" id="res-bg" placeholder="Why does he want to join? What struggles is he facing?">${prefill?.motivation || ""}</textarea></div>
      <div class="form-group"><label>Vices to Overcome</label>
        <div class="checkbox-group" id="res-vices">
          ${VICES.map((v) => `<label class="checkbox-item" onclick="this.classList.toggle('selected')"><input type="checkbox" value="${v.id}" onclick="event.stopPropagation()"><span>${v.icon} ${v.name}</span></label>`).join("")}
        </div>
      </div>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:8px;">Step 2 — Mandatory Criteria (All Required)</h3>
      <div class="checkbox-group" id="intake-criteria">
        ${INTAKE_CRITERIA.mandatory.map((c) => `
          <label class="checkbox-item" onclick="this.classList.toggle('selected')">
            <input type="checkbox" value="${c.id}" onclick="event.stopPropagation()">
            <div><strong>${c.label}</strong><div style="font-size:0.8rem;color:var(--text-muted);">Verify: ${c.verify}</div></div>
          </label>
        `).join("")}
      </div>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:8px;">Step 3 — Disqualifier Check</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:12px;">Confirm NONE of the following apply. If any apply, do not admit.</p>
      <div class="checkbox-group" id="intake-disqualifiers">
        ${INTAKE_CRITERIA.disqualifiers.map((d, i) => `
          <label class="checkbox-item disqualifier-item" onclick="this.classList.toggle('selected')">
            <input type="checkbox" value="dq-${i}" onclick="event.stopPropagation()">
            <span style="color:var(--danger);">⚠ ${d}</span>
          </label>
        `).join("")}
      </div>
      <p style="font-size:0.85rem;color:var(--text-muted);margin-top:12px;">Check each box to confirm the disqualifier is NOT present.</p>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:8px;">Step 4 — Interview Panel Scores (1–5)</h3>
      <div class="skill-assessment-grid">
        ${INTAKE_CRITERIA.interviewAreas.map((a) => `
          <div class="form-group">
            <label>${a.label}</label>
            <input class="form-control intake-score" type="number" id="score-${a.id}" min="1" max="5" value="3">
          </div>
        `).join("")}
      </div>
      <div class="form-group"><label>Panel Notes</label><textarea class="form-control" id="intake-notes" placeholder="Interview observations, concerns, strengths..."></textarea></div>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:8px;">Step 5 — Required Documents on File</h3>
      <div class="checkbox-group" id="intake-docs">
        ${INTAKE_CRITERIA.requiredDocuments.map((d, i) => `
          <label class="checkbox-item" onclick="this.classList.toggle('selected')">
            <input type="checkbox" value="doc-${i}" onclick="event.stopPropagation()">
            <span>${d}</span>
          </label>
        `).join("")}
      </div>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:8px;">Step 6 — Admission Decision</h3>
      <div class="form-row">
        <div class="form-group"><label>Room Assignment</label>
          <select class="form-control" id="res-room" ${atCapacity ? "disabled" : ""}>
            ${rooms.length ? rooms.map((r) => `<option value="${r}">Room ${r}</option>`).join("") : `<option value="">No beds available</option>`}
          </select>
        </div>
        <div class="form-group"><label>Assigned Mentor</label><input class="form-control" id="res-mentor" placeholder="Mentor name"></div>
      </div>
      <div class="form-group">
        <label>Decision</label>
        <select class="form-control" id="intake-decision">
          <option value="admit" ${defaultDecision === "admit" ? "selected" : ""} ${atCapacity ? "disabled" : ""}>ADMIT — meets all requirements</option>
          <option value="waitlist" ${defaultDecision === "waitlist" ? "selected" : ""}>WAITLIST — qualified but no bed</option>
          <option value="decline">DECLINE — does not meet requirements</option>
        </select>
      </div>
      <button class="btn btn-primary" onclick="processIntake()">Process Intake Decision</button>
      <button class="btn btn-ghost" onclick="navigate('residents')">Cancel</button>
    </div>

    <div class="card">
      <h3 style="margin-bottom:12px;">Automatic Disqualifiers Reference</h3>
      <ul class="tips-list">${INTAKE_CRITERIA.disqualifiers.map((d) => `<li>${d}</li>`).join("")}</ul>
    </div>
  `;
}

function renderDocuments() {
  const docs = [
    { file: "documents/01_Intake_Criteria_and_Requirements.docx", title: "Intake Criteria & Minimum Requirements", desc: "Eligibility standards, scoring rubric, and admission process" },
    { file: "documents/02_House_Rules_Handbook.docx", title: "House Rules Handbook", desc: "Daily schedule, conduct, purity policy, curfew, graduation requirements" },
    { file: "documents/03_Resident_Intake_Form.docx", title: "Resident Intake Form", desc: "Full application form with medical, legal, and reference sections" },
    { file: "documents/04_Mentor_Guide.docx", title: "Mentor Guide", desc: "Mentor responsibilities, weekly rhythm, documentation, and boundaries" },
    { file: "documents/05_Operating_Budget.xlsx", title: "Operating Budget (Excel)", desc: "Monthly costs, startup costs, and annual projections in KES" },
    { file: "documents/06_Friday_Brotherhood_Service_Guide.docx", title: "The Forge Guide", desc: "Weekly gathering order, Zoom setup, in-person transition, and teaching rotation" },
  ];

  return `
    <div class="page-header">
      <h1>Program Documents</h1>
      <p>Official IronMen Halfway House documents — download, print, and use for operations.</p>
    </div>
    <div class="resources-grid">
      ${docs.map((d) => `
        <div class="resource-card">
          <span class="resource-category">${d.file.endsWith(".xlsx") ? "Budget" : "Operations"}</span>
          <h3>${d.title}</h3>
          <p>${d.desc}</p>
          <a class="btn btn-primary btn-sm" href="${d.file}" download style="margin-top:12px;display:inline-flex;">Download</a>
        </div>
      `).join("")}
    </div>
    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:12px;">Document Location</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;">All files are stored in: <code style="color:var(--gold);">ironmen/documents/</code></p>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-top:8px;">Regenerate documents anytime by running: <code style="color:var(--gold);">py documents/generate_documents.py</code></p>
    </div>
  `;
}

function renderCurriculum() {
  const cohort = getActiveCohort(house);
  const currentWeek = cohort ? getCohortWeek(cohort) : 1;
  const isResident = !isStaff();

  return `
    <div class="page-header">
      <h1>${isResident ? "My Curriculum" : "12-Week Curriculum"}</h1>
      <p>Rigorous ${PROGRAM_WEEKS}-week training covering every skill a God-fearing gentleman needs.</p>
    </div>
    <div class="curriculum-timeline">
      ${CURRICULUM.map((w) => `
        <div class="curriculum-week ${w.week === currentWeek ? "current" : ""} ${w.week < currentWeek ? "completed" : ""}">
          <div class="curriculum-week-marker">
            <div class="week-num">${w.week}</div>
            ${w.week < currentWeek ? '<span class="week-check">✓</span>' : w.week === currentWeek ? '<span class="week-current">●</span>' : ""}
          </div>
          <div class="curriculum-week-content card">
            <span class="phase-badge">${w.phase}</span>
            <h3>Week ${w.week}: ${w.title}</h3>
            <p style="color:var(--text-muted);margin:8px 0 16px;">${w.focus}</p>
            <div class="curriculum-modules">
              <strong>Modules:</strong>
              <ul class="tips-list">${w.modules.map((m) => `<li>${m}</li>`).join("")}</ul>
            </div>
            <div class="curriculum-daily">
              <strong>Daily Rhythm:</strong>
              <div class="daily-tags">${w.daily.map((d) => `<span class="tag">${d}</span>`).join("")}</div>
            </div>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function renderSchedule() {
  return `
    <div class="page-header">
      <h1>Daily Schedule</h1>
      <p>Structured routine — discipline is built one hour at a time.</p>
    </div>
    <div class="schedule-table card">
      ${DAILY_SCHEDULE.map((item, i) => `
        <div class="schedule-row ${i % 2 === 0 ? "alt" : ""}">
          <div class="schedule-time">${item.time}</div>
          <div class="schedule-activity">${item.activity}</div>
          <div class="schedule-category"><span class="tag">${item.category}</span></div>
        </div>
      `).join("")}
    </div>
    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:12px;">${THE_FORGE.name}</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:12px;">Every Friday 19:00–20:00. Residents attend The Forge — IronMen's weekly brotherhood gathering. On Zoom first, then in-person. Replaces the regular 19:30 accountability circle on Fridays.</p>
      <button class="btn btn-primary btn-sm" onclick="navigate('friday')">Enter The Forge</button>
    </div>
    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:12px;">Weekly Training Blocks</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;">Morning sessions (08:30) and afternoon sessions (13:30) rotate through the week's curriculum modules. Work readiness activities occur daily at 16:00 during weeks 8–12.</p>
    </div>
  `;
}

function renderTraining() {
  const cohort = getActiveCohort(house);
  if (!cohort) return `<div class="empty-state"><div class="icon">📖</div><p>Start a cohort to log training sessions.</p></div>`;

  const week = getCohortWeek(cohort);
  const curriculum = CURRICULUM[week - 1];
  const activeResidents = cohort.residents.filter((r) => r.status === "active");

  return `
    <div class="page-header">
      <h1>Training Log</h1>
      <p>Document every mentorship session and training activity.</p>
    </div>
    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:16px;">Log Training Session — Week ${week}</h3>
      <div class="form-group">
        <label>Resident</label>
        <select class="form-control" id="train-resident">
          <option value="">All residents (group session)</option>
          ${activeResidents.map((r) => `<option value="${r.id}">${r.name}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Module / Topic</label>
        <select class="form-control" id="train-module">
          ${curriculum.modules.map((m) => `<option value="${m}">${m}</option>`).join("")}
          <option value="Other">Other</option>
        </select>
      </div>
      <div class="form-group">
        <label>Notes & Observations</label>
        <textarea class="form-control" id="train-notes" placeholder="What was covered? How did the resident respond? Areas of growth or concern..."></textarea>
      </div>
      <div class="form-group">
        <label>Mentor</label>
        <input class="form-control" id="train-mentor" value="${user.name}" placeholder="Mentor name">
      </div>
      <button class="btn btn-primary" onclick="logTraining()">Save Training Log</button>
    </div>

    <h3 style="margin-bottom:16px;">Recent Training Logs</h3>
    ${renderAllTrainingLogs(cohort)}
  `;
}

function renderAllTrainingLogs(cohort) {
  const allLogs = [];
  cohort.residents.forEach((r) => {
    r.trainingLogs.forEach((l) => allLogs.push({ ...l, residentName: r.name, residentId: r.id }));
  });
  allLogs.sort((a, b) => b.date.localeCompare(a.date));

  if (!allLogs.length) return `<div class="empty-state"><p>No training logged yet.</p></div>`;

  return allLogs.slice(0, 15).map((l) => `
    <div class="journal-entry">
      <div class="journal-date">${l.residentName || "Group"} — Week ${l.week} — ${formatDate(l.date)} — ${l.mentor}</div>
      <div class="journal-text"><strong>${l.module}</strong>: ${l.notes}</div>
    </div>
  `).join("");
}

function renderSkills() {
  const cohort = getActiveCohort(house);

  if (!isStaff()) {
    return renderMySkills();
  }

  if (!cohort) return `<div class="empty-state"><div class="icon">📈</div><p>Start a cohort to assess residents.</p></div>`;

  const week = getCohortWeek(cohort);
  const activeResidents = cohort.residents.filter((r) => r.status === "active");

  return `
    <div class="page-header">
      <h1>Skills & Assessment</h1>
      <p>Track growth across 8 pillars of gentlemanly character. Week ${week}.</p>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:16px;">Record Assessment</h3>
      <div class="form-group">
        <label>Resident</label>
        <select class="form-control" id="assess-resident">${activeResidents.map((r) => `<option value="${r.id}">${r.name}</option>`).join("")}</select>
      </div>
      <div class="form-group"><label>Assessment Notes</label><textarea class="form-control" id="assess-notes" placeholder="Overall observations..."></textarea></div>
      <div class="skill-assessment-grid">
        ${SKILL_PILLARS.map((p) => `
          <div class="form-group">
            <label>${p.icon} ${p.name} (1-10)</label>
            <input class="form-control" type="number" id="assess-${p.id}" min="1" max="10" value="5">
          </div>
        `).join("")}
      </div>
      <button class="btn btn-primary" onclick="saveAssessment()">Save Assessment</button>
    </div>

    <h3 style="margin-bottom:16px;">Resident Skill Overview</h3>
    <div class="skills-overview-grid">
      ${activeResidents.map((r) => `
        <div class="card">
          <h4 style="margin-bottom:16px;">${r.name} <span style="color:var(--gold);font-size:0.9rem;">${getAverageSkillScore(r)}/10 avg</span></h4>
          ${SKILL_PILLARS.map((p) => {
            const s = r.skills[p.id]?.current || 1;
            const level = getSkillLevel(s);
            return `<div class="skill-bar-item"><div class="skill-bar-label"><span>${p.icon} ${p.name}</span><span class="${level.class}">${s} — ${level.label}</span></div><div class="skill-bar"><div class="skill-bar-fill" style="width:${s * 10}%"></div></div></div>`;
          }).join("")}
        </div>
      `).join("")}
    </div>
  `;
}

function renderMySkills() {
  const resident = getResidentRecord();
  if (!resident) {
    return `<div class="empty-state"><div class="icon">📈</div><p>Your resident record was not found. Contact your house director.</p></div>`;
  }

  return `
    <div class="page-header">
      <h1>My Skills Progress</h1>
      <p>Your growth across 8 pillars — average: ${getAverageSkillScore(resident)}/10</p>
    </div>
    <div class="skills-overview-grid">
      <div class="card">
        ${SKILL_PILLARS.map((p) => {
          const s = resident.skills[p.id]?.current || 1;
          const baseline = resident.skills[p.id]?.baseline || 1;
          const level = getSkillLevel(s);
          return `
            <div class="skill-bar-item" style="margin-bottom:16px;">
              <div class="skill-bar-label"><span>${p.icon} ${p.name}</span><span class="${level.class}">${s}/10 — ${level.label}</span></div>
              <div class="skill-bar"><div class="skill-bar-fill" style="width:${s * 10}%;background:${p.color}"></div></div>
              <div style="font-size:0.8rem;color:var(--text-muted);margin-top:4px;">Started at ${baseline}/10</div>
            </div>
          `;
        }).join("")}
      </div>
    </div>
    ${resident.assessments.length ? `
      <h3 style="margin:24px 0 16px;">Assessment History</h3>
      ${resident.assessments.slice().reverse().map((a) => `
        <div class="journal-entry">
          <div class="journal-date">Week ${a.week} — ${formatDate(a.date)}</div>
          <div class="journal-text">${a.notes || "No notes."}</div>
        </div>
      `).join("")}
    ` : ""}
  `;
}

function renderMyProgram() {
  const cohort = getActiveCohort(house);
  const resident = getResidentRecord();

  if (!cohort || !resident) {
    return `<div class="empty-state"><div class="icon">🏠</div><p>You are not currently enrolled in an active cohort.</p></div>`;
  }

  const week = getCohortWeek(cohort);
  const daysLeft = getDaysRemaining(cohort);
  const progress = getProgramProgress(cohort);
  const curriculum = CURRICULUM[week - 1];

  return `
    <div class="page-header">
      <h1>My Program</h1>
      <p>${cohort.name} &mdash; Room ${resident.room} &mdash; ${daysLeft} days to graduation</p>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar-header"><span>Your 90-Day Journey</span><span>${progress}% complete</span></div>
      <div class="progress-bar"><div class="progress-fill" style="width:${progress}%"></div></div>
      <div class="progress-dates"><span>Intake: ${formatDate(resident.intakeDate)}</span><span>Graduation: ${formatDate(cohort.endDate)}</span></div>
    </div>

    <div class="dashboard-grid">
      <div class="stat-card"><div class="stat-value">${week}</div><div class="stat-title">Current Week</div></div>
      <div class="stat-card"><div class="stat-value">${daysLeft}</div><div class="stat-title">Days Remaining</div></div>
      <div class="stat-card"><div class="stat-value">${getAverageSkillScore(resident)}</div><div class="stat-title">Skill Average</div></div>
      <div class="stat-card"><div class="stat-value">${resident.placement ? "✓" : "—"}</div><div class="stat-title">Placement Status</div></div>
    </div>

    <div class="card card-gold">
      <span class="phase-badge">${curriculum.phase}</span>
      <h3 style="margin:12px 0 8px;">This Week: ${curriculum.title}</h3>
      <p style="color:var(--text-muted);margin-bottom:16px;">${curriculum.focus}</p>
      <ul class="tips-list">${curriculum.modules.map((m) => `<li>${m}</li>`).join("")}</ul>
    </div>

    <div class="dashboard-row" style="margin-top:24px;">
      <div class="card">
        <h3 style="margin-bottom:12px;">Your Mentor</h3>
        <p style="font-size:1.2rem;font-weight:600;">${resident.mentor || "Not yet assigned"}</p>
      </div>
      <div class="card">
        <h3 style="margin-bottom:12px;">Documents on File</h3>
        <p style="color:var(--text-muted);">${resident.documents.length} records documented</p>
        <p style="color:var(--text-muted);">${resident.trainingLogs.length} training sessions logged</p>
      </div>
    </div>
  `;
}

function renderGraduation() {
  const cohort = getActiveCohort(house);
  if (!cohort) return `<div class="empty-state"><div class="icon">🎓</div><p>No active cohort.</p></div>`;

  const daysLeft = getDaysRemaining(cohort);
  const activeResidents = cohort.residents.filter((r) => r.status === "active");
  const allPlaced = activeResidents.every((r) => r.placement);
  const readyToGraduate = daysLeft <= 7 || allPlaced;

  return `
    <div class="page-header">
      <h1>Graduation & Placement</h1>
      <p>Graduation: ${formatFullDate(cohort.endDate)} &mdash; ${daysLeft} days remaining</p>
    </div>

    ${readyToGraduate ? `
      <div class="encouragement-banner" style="margin-bottom:24px;">
        <span class="icon">🎓</span>
        <p>${daysLeft <= 0 ? "Graduation day has arrived!" : "Graduation approaching — finalize placements and documentation."}</p>
      </div>
    ` : ""}

    <h3 style="margin-bottom:16px;">Placement Status</h3>
    <div class="resident-grid" style="margin-bottom:32px;">
      ${activeResidents.map((r) => renderPlacementCard(r)).join("")}
    </div>

    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:12px;">Opportunities Board</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:12px;">Match residents with open jobs, internships, and apprenticeships from employer partners.</p>
      <button class="btn btn-secondary btn-sm" onclick="navigate('opportunities')">View Jobs & Opportunities</button>
    </div>

    <div class="card">
      <h3 style="margin-bottom:16px;">Graduate Cohort</h3>
      <p style="color:var(--text-muted);margin-bottom:16px;">Graduating moves all residents to alumni status and clears the house for the next intake of up to ${house.capacity} men.</p>
      <div class="form-group"><label>Graduation Notes</label><textarea class="form-control" id="grad-notes" placeholder="Cohort summary, highlights, lessons learned...">${cohort.graduationNotes || ""}</textarea></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="graduateCohortAction()">🎓 Graduate Cohort & Open for New Intake</button>
        <button class="btn btn-secondary" onclick="exportCohortReport()">Export Cohort Report</button>
      </div>
    </div>
  `;
}

function renderPlacementCard(resident) {
  return `
    <div class="card" style="padding:20px;">
      <h4 style="margin-bottom:12px;">${resident.name}</h4>
      ${resident.placement ? `
        <div class="placement-badge">✓ ${resident.placement.organization}</div>
        <p style="color:var(--text-muted);font-size:0.85rem;margin-top:8px;">${resident.placement.type} — ${resident.placement.role || ""}</p>
        <button class="btn btn-ghost btn-sm" style="margin-top:8px;" onclick="setPlacement('${resident.id}')">Edit Placement</button>
      ` : `
        <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:12px;">No placement yet</p>
        <button class="btn btn-secondary btn-sm" onclick="setPlacement('${resident.id}')">Set Placement</button>
      `}
    </div>
  `;
}

function setPlacement(residentId) {
  const { resident } = findResident(house, residentId);
  if (!resident) return;

  const org = prompt("Employer / Organization name:", resident.placement?.organization || "");
  if (org === null) return;
  const role = prompt("Role / Trade:", resident.placement?.role || "");
  if (role === null) return;
  const type = prompt("Type (employment, apprenticeship, internship, self-employed, further-training):", resident.placement?.type || "employment");
  if (type === null) return;

  resident.placement = {
    type: type || "employment",
    organization: org,
    role: role || "",
    startDate: new Date().toISOString().split("T")[0],
    notes: "",
  };

  resident.documents.push({
    date: new Date().toISOString().split("T")[0],
    type: "placement",
    content: `Placed at ${org} as ${role} (${type})`,
  });

  saveHouse(house);
  render();
}

function renderAlumni() {
  const alumni = getGraduatedCohorts(house);

  return `
    <div class="page-header">
      <h1>Alumni Cohorts</h1>
      <p>Men who completed the 90-day program and were sent forth.</p>
    </div>
    ${alumni.length ? alumni.slice().reverse().map((c) => `
      <div class="card" style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <h3>${c.name}</h3>
            <p style="color:var(--text-muted);font-size:0.9rem;">${formatDate(c.startDate)} — ${formatDate(c.endDate)} &bull; Graduated ${c.graduationDate ? formatDate(c.graduationDate) : ""}</p>
          </div>
          <span class="phase-badge">Graduated</span>
        </div>
        ${c.graduationNotes ? `<p style="margin:16px 0;color:var(--text-muted);font-style:italic;">"${c.graduationNotes}"</p>` : ""}
        <div class="resident-grid" style="margin-top:16px;">
          ${c.residents.map((r) => `
            <div class="resident-card">
              <div class="resident-name">${r.name}</div>
              <div class="resident-meta">Skills avg: ${getAverageSkillScore(r)}/10</div>
              ${r.placement ? `<div class="placement-badge" style="margin-top:8px;font-size:0.8rem;">${r.placement.organization}</div>` : `<span style="color:var(--text-muted);font-size:0.8rem;">No placement recorded</span>`}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("") : `<div class="empty-state"><div class="icon">🏆</div><p>No graduated cohorts yet. Your first graduation will be recorded here.</p></div>`}
  `;
}

function startNewCohort() {
  const name = document.getElementById("cohort-name")?.value.trim();
  const start = document.getElementById("cohort-start")?.value;
  if (!start) { alert("Please set a start date."); return; }

  if (getActiveCohort(house)) {
    alert("There is already an active cohort. Graduate it first.");
    return;
  }

  const cohort = createCohort(name, start);
  house.cohorts.push(cohort);
  saveHouse(house);
  houseFormMode = null;
  navigate("house");
}

function processIntake() {
  const cohort = getActiveCohort(house);
  if (!cohort) return;

  const decision = document.getElementById("intake-decision")?.value;
  const name = document.getElementById("res-name")?.value.trim();
  const age = parseInt(document.getElementById("res-age")?.value, 10) || 0;
  const notes = document.getElementById("intake-notes")?.value.trim() || "";

  if (!name) { alert("Enter applicant name."); return; }
  if (age < 18) { alert("Applicant must be 18 or older."); return; }

  const criteriaMet = document.querySelectorAll("#intake-criteria input:checked").length;
  if (criteriaMet < INTAKE_CRITERIA.mandatory.length) {
    alert(`All ${INTAKE_CRITERIA.mandatory.length} mandatory criteria must be confirmed before admission.`);
    return;
  }

  const disqualifiersCleared = document.querySelectorAll("#intake-disqualifiers input:checked").length;
  if (disqualifiersCleared < INTAKE_CRITERIA.disqualifiers.length) {
    alert("Confirm that ALL disqualifiers have been checked (none present).");
    return;
  }

  const scores = INTAKE_CRITERIA.interviewAreas.map((a) => parseInt(document.getElementById(`score-${a.id}`)?.value, 10) || 0);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;

  if (decision === "admit" && avgScore < INTAKE_CRITERIA.minInterviewScore) {
    alert(`Interview average is ${avgScore.toFixed(1)}/5. Minimum ${INTAKE_CRITERIA.minInterviewScore} required for admission.`);
    return;
  }

  if (decision === "decline") {
    syncApplicationFromIntake(name, "declined", notes);
    window._prefillApplicant = null;
    alert(`Application for ${name} declined. Record the reason in your files.`);
    navigate("applications");
    return;
  }

  if (decision === "waitlist") {
    const phone = document.getElementById("res-phone")?.value.trim();
    addToWaitlistFromIntake(name, phone, age, notes, avgScore);
    syncApplicationFromIntake(name, "waitlist", notes);
    window._prefillApplicant = null;
    alert(`${name} added to the application waitlist. Average score: ${avgScore.toFixed(1)}/5.`);
    navigate("applications");
    return;
  }

  if (atCapacityCheck()) {
    alert("House is at full capacity. Choose waitlist or graduate the current cohort first.");
    return;
  }

  const vices = [...document.querySelectorAll("#res-vices input:checked")].map((el) => el.value);
  const docsOnFile = document.querySelectorAll("#intake-docs input:checked").length;

  const resident = createResident({
    name,
    age,
    room: parseInt(document.getElementById("res-room")?.value, 10),
    mentor: document.getElementById("res-mentor")?.value.trim(),
    phone: document.getElementById("res-phone")?.value.trim(),
    background: document.getElementById("res-bg")?.value.trim(),
    vices,
    intakeDate: new Date().toISOString().split("T")[0],
  });

  resident.intake = {
    interviewScore: parseFloat(avgScore.toFixed(1)),
    interviewNotes: notes,
    documentsOnFile: docsOnFile,
    criteriaVerified: true,
    admittedBy: user.name,
  };

  resident.documents.push({
    date: new Date().toISOString().split("T")[0],
    type: "intake",
    content: `ADMITTED to ${house.name}. Room ${resident.room}. Interview score: ${avgScore.toFixed(1)}/5. Documents on file: ${docsOnFile}/${INTAKE_CRITERIA.requiredDocuments.length}. Vices: ${vices.join(", ") || "None specified"}. Notes: ${notes}`,
  });

  cohort.residents.push(resident);
  saveHouse(house);
  syncApplicationFromIntake(name, "admitted", notes);
  window._prefillApplicant = null;
  selectedResidentId = resident.id;
  alert(`${name} admitted successfully! Interview score: ${avgScore.toFixed(1)}/5.`);
  navigate("residents");
}

function atCapacityCheck() {
  return !canAddResident(house);
}

function syncApplicationFromIntake(name, status, notes) {
  const prefill = window._prefillApplicant;
  let app = prefill?.id
    ? applicationsData.applications.find((a) => a.id === prefill.id)
    : applicationsData.applications.find((a) => a.name?.toLowerCase() === name.toLowerCase() && (a.status === "applied" || a.status === "screened"));
  if (!app) return;
  app.status = status;
  if (notes) app.notes = notes;
  saveApplicationsLocal(applicationsData);
  persistApplications();
}

function logTraining() {
  const cohort = getActiveCohort(house);
  if (!cohort) return;

  const residentId = document.getElementById("train-resident")?.value;
  const module = document.getElementById("train-module")?.value;
  const notes = document.getElementById("train-notes")?.value.trim();
  const mentor = document.getElementById("train-mentor")?.value.trim();

  if (!notes) { alert("Please add training notes."); return; }

  const week = getCohortWeek(cohort);
  const log = { date: new Date().toISOString().split("T")[0], week, module, notes, mentor };

  if (residentId) {
    const { resident } = findResident(house, residentId);
    if (resident) {
      resident.trainingLogs.push(log);
      resident.documents.push({ date: log.date, type: "training", content: `${module}: ${notes}` });
    }
  } else {
    cohort.residents.filter((r) => r.status === "active").forEach((r) => {
      r.trainingLogs.push({ ...log });
      r.documents.push({ date: log.date, type: "training", content: `[Group] ${module}: ${notes}` });
    });
  }

  saveHouse(house);
  alert("Training session logged.");
  render();
}

function saveAssessment() {
  const residentId = document.getElementById("assess-resident")?.value;
  const { cohort, resident } = findResident(house, residentId);
  if (!resident || !cohort) return;

  const notes = document.getElementById("assess-notes")?.value.trim();
  const week = getCohortWeek(cohort);
  const scores = {};

  SKILL_PILLARS.forEach((p) => {
    const val = parseInt(document.getElementById(`assess-${p.id}`)?.value, 10) || 1;
    scores[p.id] = Math.min(10, Math.max(1, val));
    resident.skills[p.id].current = scores[p.id];
    resident.skills[p.id].logs.push({ date: new Date().toISOString().split("T")[0], score: scores[p.id], week });
  });

  resident.assessments.push({ date: new Date().toISOString().split("T")[0], week, scores, notes });
  resident.documents.push({ date: new Date().toISOString().split("T")[0], type: "assessment", content: `Week ${week} assessment. Avg: ${getAverageSkillScore(resident)}/10. ${notes || ""}` });

  saveHouse(house);
  alert(`Assessment saved for ${resident.name}.`);
  render();
}

function addResidentDocument(residentId) {
  const { resident } = findResident(house, residentId);
  if (!resident) return;

  const type = prompt("Document type (weekly_review, incident, milestone, note):", "note");
  if (type === null) return;
  const content = prompt("Document content:");
  if (!content) return;

  resident.documents.push({ date: new Date().toISOString().split("T")[0], type, content });
  saveHouse(house);
  render();
}

function graduateCohortAction() {
  const cohort = getActiveCohort(house);
  if (!cohort) return;

  const unplaced = cohort.residents.filter((r) => r.status === "active" && !r.placement);
  if (unplaced.length && !confirm(`${unplaced.length} resident(s) have no placement recorded. Graduate anyway?`)) return;
  if (!confirm(`Graduate "${cohort.name}" with ${cohort.residents.length} residents? The house will be ready for a new intake.`)) return;

  const notes = document.getElementById("grad-notes")?.value.trim() || "";
  cohort.status = "graduated";
  cohort.graduationDate = new Date().toISOString().split("T")[0];
  cohort.graduationNotes = notes;

  cohort.residents.forEach((r) => {
    r.status = "graduated";
    r.documents.push({
      date: cohort.graduationDate,
      type: "graduation",
      content: `Graduated from ${house.name}. ${r.placement ? `Placed at ${r.placement.organization}.` : "Placement pending."} Final skill average: ${getAverageSkillScore(r)}/10.`,
    });
    if (user.name && r.name.toLowerCase() === user.name.toLowerCase()) {
      user.isGraduate = true;
      user.inProgram = false;
      saveUser(user);
    }
  });

  saveHouse(house);
  houseFormMode = "newCohort";
  alert(`🎓 ${cohort.name} has graduated! The house is ready for the next intake.`);
  navigate("alumni");
}

function exportCohortReport() {
  const cohort = getActiveCohort(house);
  if (!cohort) return;

  const week = getCohortWeek(cohort);
  let report = `IRONMEN HALFWAY HOUSE — COHORT REPORT\n`;
  report += `${"=".repeat(50)}\n`;
  report += `House: ${house.name}\n`;
  report += `Cohort: ${cohort.name}\n`;
  report += `Period: ${formatFullDate(cohort.startDate)} — ${formatFullDate(cohort.endDate)}\n`;
  report += `Current Week: ${week} of ${PROGRAM_WEEKS}\n`;
  report += `Days Remaining: ${getDaysRemaining(cohort)}\n\n`;

  cohort.residents.forEach((r) => {
    report += `--- ${r.name} (Room ${r.room}) ---\n`;
    report += `Mentor: ${r.mentor || "N/A"}\n`;
    report += `Skill Average: ${getAverageSkillScore(r)}/10\n`;
    SKILL_PILLARS.forEach((p) => {
      report += `  ${p.name}: ${r.skills[p.id]?.current || 0}/10\n`;
    });
    report += `Training Sessions: ${r.trainingLogs.length}\n`;
    report += `Documents: ${r.documents.length}\n`;
    if (r.placement) report += `Placement: ${r.placement.organization} (${r.placement.type}) — ${r.placement.role}\n`;
    else report += `Placement: PENDING\n`;
    report += `\n`;
  });

  navigator.clipboard.writeText(report).then(() => alert("Cohort report copied to clipboard!")).catch(() => {
    const w = window.open("", "_blank");
    w.document.write(`<pre>${report}</pre>`);
  });
}

function renderHouseView() {
  const views = {
    house: renderHouseOverview,
    intake: renderIntake,
    residents: renderResidents,
    curriculum: renderCurriculum,
    schedule: renderSchedule,
    training: renderTraining,
    skills: renderSkills,
    graduation: renderGraduation,
    alumni: renderAlumni,
    documents: renderDocumentsLibrary,
    myprogram: renderMyProgram,
  };
  return (views[currentView] || renderHouseOverview)();
}