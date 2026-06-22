function renderFridayServiceNav() {
  return `
    <div class="nav-section-label">Brotherhood</div>
    ${navItem("friday", "🔥", THE_FORGE.name)}
  `;
}

function renderFridayService() {
  const svc = house.fridayService || getDefaultFridayService();
  const nextFriday = getNextFriday(new Date(), svc.serviceTime);
  const topic = getCurrentServiceTopic(house);
  const countdown = getTimeUntilService(nextFriday);
  const isZoom = svc.mode === "zoom";
  const myAttendance = getUserServiceAttendance(house, user.name);
  const nextDateStr = nextFriday.toISOString().split("T")[0];
  const todaySession = svc.sessions.find((s) => s.date === nextDateStr);
  const rsvpd = hasRSVPd(todaySession, user.name);

  const joinSection = isZoom ? `
    <div class="card card-gold service-join-card">
      <div class="service-mode-badge zoom">📹 Zoom Meeting</div>
      <h3 style="margin:12px 0;">Join Online</h3>
      ${svc.zoomLink ? `
        <p style="color:var(--text-muted);margin-bottom:16px;">Click below to enter The Forge. Arrive five minutes early — on time is late.</p>
        <a class="btn btn-primary btn-block" href="${svc.zoomLink}" target="_blank" rel="noopener">Join The Forge on Zoom</a>
        ${svc.zoomMeetingId ? `<p style="font-size:0.85rem;color:var(--text-muted);margin-top:12px;">Meeting ID: ${svc.zoomMeetingId}${svc.zoomPasscode ? ` &bull; Passcode: ${svc.zoomPasscode}` : ""}</p>` : ""}
      ` : `
        <p style="color:var(--text-muted);">Zoom link not yet set. Check back before Friday or contact the House Director.</p>
      `}
    </div>
  ` : `
    <div class="card card-gold service-join-card">
      <div class="service-mode-badge physical">🏛️ In-Person Service</div>
      <h3 style="margin:12px 0;">${svc.physicalVenue || "Physical Venue"}</h3>
      <p style="color:var(--text-muted);margin-bottom:8px;">${svc.physicalAddress || "Address to be announced"}</p>
      <p style="font-size:0.9rem;">Arrive 10 minutes early. Dress presentably — this is worship.</p>
    </div>
  `;

  const staffPanel = isStaff() ? `
    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:16px;">Service Administration</h3>
      <div class="form-group">
        <label>Meeting Mode</label>
        <select class="form-control" id="svc-mode">
          <option value="zoom" ${svc.mode === "zoom" ? "selected" : ""}>Zoom (Online)</option>
          <option value="in-person" ${svc.mode === "in-person" ? "selected" : ""}>In-Person (Physical Location)</option>
        </select>
      </div>
      <div id="zoom-fields" class="${svc.mode === "zoom" ? "" : "hidden"}">
        <div class="form-group"><label>Zoom Link</label><input class="form-control" id="svc-zoom-link" value="${svc.zoomLink}" placeholder="https://zoom.us/j/..."></div>
        <div class="form-row">
          <div class="form-group"><label>Meeting ID</label><input class="form-control" id="svc-zoom-id" value="${svc.zoomMeetingId}"></div>
          <div class="form-group"><label>Passcode</label><input class="form-control" id="svc-zoom-pass" value="${svc.zoomPasscode}"></div>
        </div>
      </div>
      <div id="physical-fields" class="${svc.mode === "in-person" ? "" : "hidden"}">
        <div class="form-group"><label>Venue Name</label><input class="form-control" id="svc-venue" value="${svc.physicalVenue}" placeholder="e.g. Community Hall, Local Church"></div>
        <div class="form-group"><label>Address / Directions</label><textarea class="form-control" id="svc-address" placeholder="Full address and landmarks">${svc.physicalAddress}</textarea></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Service Time</label><input class="form-control" id="svc-time" type="time" value="${svc.serviceTime}"></div>
        <div class="form-group"><label>This Week's Speaker</label><input class="form-control" id="svc-speaker" value="${svc.plannedSpeaker || topic.speaker}" placeholder="Speaker name"></div>
      </div>
      <button class="btn btn-primary" onclick="saveServiceSettings()">Save Settings</button>
      <button class="btn btn-secondary" style="margin-left:8px;" onclick="startServiceSession()">Start Tonight's Service & Take Attendance</button>
    </div>
  ` : "";

  const attendancePanel = todaySession && isStaff() ? renderServiceAttendance(todaySession) : "";

  return `
    <div class="page-header">
      <h1>${THE_FORGE.name}</h1>
      <p>${THE_FORGE.tagline} Every Friday, one focused hour — open to all IronMen brothers.</p>
    </div>

    <div class="encouragement-banner forge-banner" style="margin-bottom:24px;">
      <span class="icon">🔥</span>
      <p>${THE_FORGE.description}</p>
    </div>

    <div class="service-hero card">
      <div class="service-hero-top">
        <div>
          <span class="phase-badge">${isZoom ? "Online Phase" : "In-Person Phase"}</span>
          <h2 style="margin:12px 0 4px;">${formatServiceDateTime(nextFriday)}</h2>
          <p class="service-countdown">${countdown}</p>
        </div>
        <div class="service-hero-stat">
          <div class="stat-value" style="font-size:2rem;">${FRIDAY_SERVICE.durationMinutes}</div>
          <div class="stat-title">Minutes</div>
        </div>
      </div>
      <div class="service-topic-preview">
        <strong>This Week:</strong> ${topic.title} &mdash; <em>${topic.scripture}</em>
        <span style="color:var(--text-muted);"> &bull; Speaker: ${svc.plannedSpeaker || topic.speaker}</span>
      </div>
      ${!isStaff() ? `
        <div style="margin-top:16px;display:flex;gap:12px;flex-wrap:wrap;">
          ${rsvpd
            ? `<span style="color:var(--success);font-weight:600;">✓ You RSVP'd for this service</span>`
            : `<button class="btn btn-primary btn-sm" onclick="rsvpService()">RSVP — I Will Attend</button>`}
          <span style="color:var(--text-muted);font-size:0.9rem;">Your attendance record: ${myAttendance} services</span>
        </div>
      ` : ""}
    </div>

    <div class="dashboard-row">
      ${joinSection}
      <div class="card">
        <h3 style="margin-bottom:16px;">Order of Service (60 min)</h3>
        <div class="service-order-list">
          ${SERVICE_ORDER.map((item) => `
            <div class="service-order-item">
              <div class="service-order-time">${item.duration} min</div>
              <div>
                <strong>${item.item}</strong>
                <div style="font-size:0.8rem;color:var(--text-muted);">${item.lead}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:16px;">12-Week Teaching Rotation</h3>
      <div class="service-topics-grid">
        ${SERVICE_TOPICS.map((t, i) => `
          <div class="service-topic-card ${i === (svc.currentTopicIndex % SERVICE_TOPICS.length) ? "current" : ""}">
            <span class="week-num" style="width:28px;height:28px;font-size:0.75rem;">${t.week}</span>
            <div>
              <strong>${t.title}</strong>
              <div style="font-size:0.8rem;color:var(--text-muted);">${t.scripture} &bull; ${t.speaker}</div>
            </div>
          </div>
        `).join("")}
      </div>
      ${isStaff() ? `<button class="btn btn-secondary btn-sm" style="margin-top:16px;" onclick="advanceServiceTopic()">Advance to Next Topic</button>` : ""}
    </div>

    ${staffPanel}
    ${attendancePanel}

    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:16px;">Recent Services</h3>
      ${renderServiceHistory()}
    </div>
  `;
}

function renderServiceAttendance(session) {
  const cohort = getActiveCohort(house);
  const residents = cohort ? cohort.residents.filter((r) => r.status === "active") : [];
  const attendees = session.attendance || [];

  return `
    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:16px;">Tonight's Attendance — ${formatDate(session.date)}</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">Mark brothers present. Topic: ${session.topic}</p>
      <div class="goals-list">
        ${attendees.map((a, i) => `
          <div class="goal-item">
            <div class="goal-check ${a.present ? "checked" : ""}" onclick="toggleServiceAttendance('${session.date}', ${i})">${a.present ? "✓" : ""}</div>
            <div class="goal-info">
              <div class="goal-label">${a.name}</div>
              <div class="goal-category">${a.role || "brother"}</div>
            </div>
          </div>
        `).join("")}
      </div>
      ${residents.filter((r) => !attendees.some((a) => a.name === r.name)).map((r) => `
        <button class="btn btn-ghost btn-sm" onclick="addServiceAttendee('${session.date}', '${r.name}', 'resident')">+ Add ${r.name}</button>
      `).join("")}
      <button class="btn btn-primary btn-sm" style="margin-top:16px;" onclick="closeServiceSession('${session.date}')">Close Service & Save</button>
    </div>
  `;
}

function renderServiceHistory() {
  const sessions = (house.fridayService?.sessions || []).slice().reverse().slice(0, 8);
  if (!sessions.length) return `<div class="empty-state"><p>No Forge sessions recorded yet. The first gathering will appear here.</p></div>`;

  return sessions.map((s) => {
    const present = (s.attendance || []).filter((a) => a.present).length;
    const total = (s.attendance || []).length;
    return `
      <div class="journal-entry">
        <div class="journal-date">${formatFullDate(s.date)} &bull; ${s.mode === "zoom" ? "Zoom" : "In-Person"} &bull; ${present}/${total} present</div>
        <div class="journal-text"><strong>${s.topic}</strong> — ${s.speaker || ""}${s.notes ? `<br>${s.notes}` : ""}</div>
      </div>
    `;
  }).join("");
}

function saveServiceSettings() {
  if (!isStaff()) return;

  const mode = document.getElementById("svc-mode")?.value || "zoom";
  house.fridayService.mode = mode;
  house.fridayService.zoomLink = document.getElementById("svc-zoom-link")?.value.trim() || "";
  house.fridayService.zoomMeetingId = document.getElementById("svc-zoom-id")?.value.trim() || "";
  house.fridayService.zoomPasscode = document.getElementById("svc-zoom-pass")?.value.trim() || "";
  house.fridayService.physicalVenue = document.getElementById("svc-venue")?.value.trim() || "";
  house.fridayService.physicalAddress = document.getElementById("svc-address")?.value.trim() || "";
  house.fridayService.serviceTime = document.getElementById("svc-time")?.value || FRIDAY_SERVICE.time;
  house.fridayService.plannedSpeaker = document.getElementById("svc-speaker")?.value.trim() || "";

  saveHouse(house);
  alert("Service settings saved.");
  render();
}

function rsvpService() {
  const svc = house.fridayService;
  const nextFriday = getNextFriday(new Date(), svc.serviceTime);
  const dateStr = nextFriday.toISOString().split("T")[0];
  let session = svc.sessions.find((s) => s.date === dateStr);

  if (!session) {
    const topic = getCurrentServiceTopic(house);
    session = {
      date: dateStr,
      topic: topic.title,
      scripture: topic.scripture,
      speaker: svc.plannedSpeaker || topic.speaker,
      mode: svc.mode,
      attendance: [],
      notes: "",
    };
    svc.sessions.push(session);
  }

  if (hasRSVPd(session, user.name)) {
    alert("You have already RSVP'd.");
    return;
  }

  session.attendance.push({
    name: user.name,
    role: user.role || "member",
    present: false,
    rsvp: true,
  });

  saveHouse(house);
  alert("RSVP confirmed! See you at The Forge, brother.");
  render();
}

function startServiceSession() {
  if (!isStaff()) return;

  const svc = house.fridayService;
  const nextFriday = getNextFriday(new Date(), svc.serviceTime);
  const dateStr = nextFriday.toISOString().split("T")[0];

  if (svc.sessions.find((s) => s.date === dateStr)) {
    render();
    return;
  }

  const topic = getCurrentServiceTopic(house);
  const cohort = getActiveCohort(house);
  const attendance = [];

  if (cohort) {
    cohort.residents.filter((r) => r.status === "active").forEach((r) => {
      attendance.push({ name: r.name, role: "resident", present: false, rsvp: false });
    });
  }

  svc.sessions.push({
    date: dateStr,
    topic: topic.title,
    scripture: topic.scripture,
    speaker: svc.plannedSpeaker || topic.speaker,
    mode: svc.mode,
    attendance,
    notes: "",
  });

  saveHouse(house);
  render();
}

function toggleServiceAttendance(dateStr, index) {
  const session = house.fridayService.sessions.find((s) => s.date === dateStr);
  if (!session || !session.attendance[index]) return;
  session.attendance[index].present = !session.attendance[index].present;
  saveHouse(house);
  render();
}

function addServiceAttendee(dateStr, name, role) {
  const session = house.fridayService.sessions.find((s) => s.date === dateStr);
  if (!session) return;
  if (session.attendance.some((a) => a.name === name)) return;
  session.attendance.push({ name, role, present: true, rsvp: false });
  saveHouse(house);
  render();
}

function closeServiceSession(dateStr) {
  const session = house.fridayService.sessions.find((s) => s.date === dateStr);
  if (!session) return;

  const present = session.attendance.filter((a) => a.present).length;
  session.notes = `Service completed. ${present} brothers present.`;
  saveHouse(house);
  alert(`Service closed. ${present} brothers marked present.`);
  render();
}

function advanceServiceTopic() {
  if (!isStaff()) return;
  house.fridayService.currentTopicIndex = (house.fridayService.currentTopicIndex + 1) % SERVICE_TOPICS.length;
  saveHouse(house);
  render();
}