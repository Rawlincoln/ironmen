const APPLICATION_STATUSES = [
  { id: "applied", label: "Applied" },
  { id: "screened", label: "Screened" },
  { id: "waitlist", label: "Waitlist" },
  { id: "admitted", label: "Admitted" },
  { id: "declined", label: "Declined" },
];

function renderApplyPage() {
  const occupancy = getOccupancy(house);
  return `
    <div class="page-header">
      <h1>Apply to the Halfway House</h1>
      <p>90-day residential program — ${HOUSE_CAPACITY} beds, faith, mentorship, and placement into work.</p>
    </div>
    ${renderContactBar("contact-bar-inline")}
    <div class="card" style="margin-bottom:24px;">
      <p><strong>${occupancy.available}</strong> of <strong>${occupancy.capacity}</strong> beds currently available.
      ${occupancy.available === 0 ? " You may still apply — qualified applicants will be waitlisted." : ""}</p>
    </div>
    <div class="dashboard-row">
      <div class="card">
        <h3 style="margin-bottom:16px;">Application Form</h3>
        ${renderApplicationForm()}
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px;">What happens next</h3>
        <ol class="tips-list" style="list-style:decimal;padding-left:20px;">
          <li>Director reviews your application within 48 hours</li>
          <li>Phone interview and eligibility screening</li>
          <li>In-person intake if a bed is available</li>
          <li>90 days on-site — graduate into work or apprenticeship</li>
        </ol>
        <h4 style="margin:20px 0 12px;">Required documents</h4>
        <ul class="tips-list">
          ${INTAKE_CRITERIA.requiredDocuments.slice(0, 5).map((d) => `<li>${d}</li>`).join("")}
        </ul>
      </div>
    </div>
  `;
}

function renderApplicationForm() {
  return `
    <form class="checkin-form" onsubmit="submitApplication(event)">
      <div class="form-row">
        <div class="form-group"><label>Full Name *</label><input class="form-control" id="app-name" required></div>
        <div class="form-group"><label>Age *</label><input class="form-control" id="app-age" type="number" min="18" required></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Phone *</label><input class="form-control" id="app-phone" required placeholder="07XX XXX XXX"></div>
        <div class="form-group"><label>Email</label><input class="form-control" id="app-email" type="email"></div>
      </div>
      <div class="form-group"><label>County / Location</label><input class="form-control" id="app-location" placeholder="e.g. Nairobi"></div>
      <div class="form-group"><label>Emergency contact (name + phone)</label><input class="form-control" id="app-emergency" placeholder="e.g. Mom — 07XX"></div>
      <div class="form-group">
        <label>Struggles you want to overcome (select all)</label>
        <div class="checkbox-group" id="app-vices">
          ${VICES.filter((v) => v.id !== "other").map((v) => `
            <label class="checkbox-item" onclick="this.classList.toggle('selected')">
              <input type="checkbox" value="${v.id}" onclick="event.stopPropagation()"> ${v.name}
            </label>
          `).join("")}
        </div>
      </div>
      <div class="form-group">
        <label>Why do you want to join IronMen? *</label>
        <textarea class="form-control" id="app-motivation" required placeholder="Be honest. What are you hoping will change?"></textarea>
      </div>
      <div class="form-group">
        <label>I confirm *</label>
        <label class="checkbox-item"><input type="checkbox" id="app-confirm-age" required onclick="event.stopPropagation()"> I am male and 18 or older</label>
        <label class="checkbox-item"><input type="checkbox" id="app-confirm-faith" required onclick="event.stopPropagation()"> I am willing to participate in faith-based activities</label>
        <label class="checkbox-item"><input type="checkbox" id="app-confirm-90" required onclick="event.stopPropagation()"> I can commit to the full 90-day residential program</label>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Submit Application</button>
    </form>
  `;
}

async function submitApplication(e) {
  e.preventDefault();
  const age = parseInt(document.getElementById("app-age")?.value, 10);
  if (age < 18) {
    alert("You must be 18 or older to apply.");
    return;
  }
  const vices = [...document.querySelectorAll("#app-vices input:checked")].map((el) => el.value);
  const payload = {
    id: `app-${Date.now()}`,
    name: document.getElementById("app-name")?.value.trim(),
    age,
    phone: document.getElementById("app-phone")?.value.trim(),
    email: document.getElementById("app-email")?.value.trim() || "",
    location: document.getElementById("app-location")?.value.trim() || "",
    emergency: document.getElementById("app-emergency")?.value.trim() || "",
    vices,
    motivation: document.getElementById("app-motivation")?.value.trim(),
    status: getOccupancy(house).available > 0 ? "applied" : "waitlist",
    date: new Date().toISOString().split("T")[0],
    notes: "",
  };
  const ok = await publicSubmit("application", payload);
  alert(ok
    ? `Application received! Status: ${payload.status === "waitlist" ? "Waitlist" : "Under review"}. The House Director will call you within 48 hours.`
    : "Application saved. We will contact you soon.");
  render();
}

function renderApplicationPipeline() {
  if (!isStaff()) {
    return `
      <div class="page-header">
        <h1>Application Pipeline</h1>
        <p>Application review is managed by the House Director and mentors.</p>
      </div>
      <div class="card"><p style="color:var(--text-muted);">Want to apply? <button class="btn btn-secondary btn-sm" onclick="navigate('apply')">Go to Apply page</button></p></div>
    `;
  }
  const apps = applicationsData.applications || [];
  const pending = apps.filter((a) => a.status === "applied" || a.status === "screened").length;
  const waitlist = apps.filter((a) => a.status === "waitlist").length;

  return `
    <div class="page-header">
      <h1>Application Pipeline</h1>
      <p>${apps.length} total &bull; ${pending} pending review &bull; ${waitlist} on waitlist</p>
    </div>
    <div class="pipeline-tabs">
      ${APPLICATION_STATUSES.map((s) => {
        const count = apps.filter((a) => a.status === s.id).length;
        return `<span class="pipeline-tab">${s.label} (${count})</span>`;
      }).join("")}
    </div>
    ${apps.length ? apps.slice().reverse().map((a) => `
      <div class="card journal-entry" style="margin-bottom:16px;">
        <div class="journal-date">${a.name}, ${a.age} &bull; ${a.status} &bull; ${formatDate(a.date)} &bull; ${a.phone}</div>
        <div class="journal-text">${a.location ? a.location + " — " : ""}${a.motivation || ""}<br>Vices: ${(a.vices || []).join(", ") || "None listed"}</div>
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
          ${APPLICATION_STATUSES.map((s) => `
            <button class="btn btn-secondary btn-sm" onclick="updateApplicationStatus('${a.id}','${s.id}')">${s.label}</button>
          `).join("")}
          <button class="btn btn-primary btn-sm" onclick="startIntakeFromApplication('${a.id}')">Screen in Intake</button>
        </div>
      </div>
    `).join("") : `<div class="empty-state"><p>No applications yet. Share the Apply page with young men who need the program.</p><button class="btn btn-secondary btn-sm" onclick="navigate('apply')">View public apply page</button></div>`}
    ${(applicationsData.mpesaConfirmations || []).length ? `
      <div class="card" style="margin-top:24px;">
        <h3>M-Pesa Confirmations (${applicationsData.mpesaConfirmations.length})</h3>
        ${applicationsData.mpesaConfirmations.slice().reverse().map((m) => `
          <div class="journal-entry"><div class="journal-date">${m.name} &bull; KES ${m.amount} &bull; ${m.reference}</div></div>
        `).join("")}
      </div>
    ` : ""}
  `;
}

function updateApplicationStatus(id, status) {
  if (!isStaff()) return;
  const app = applicationsData.applications.find((a) => a.id === id);
  if (!app) return;
  app.status = status;
  saveApplicationsLocal(applicationsData);
  persistApplications();
  render();
}

function startIntakeFromApplication(id) {
  const app = applicationsData.applications.find((a) => a.id === id);
  if (!app) return;
  window._prefillApplicant = app;
  navigate("intake");
}

function addToWaitlistFromIntake(name, phone, age, notes, score) {
  const payload = {
    id: `app-${Date.now()}`,
    name,
    age,
    phone: phone || "",
    status: "waitlist",
    date: new Date().toISOString().split("T")[0],
    notes: notes || `Interview score: ${score}/5`,
    motivation: "Added from intake screening",
    vices: [],
  };
  applicationsData.applications.push(payload);
  saveApplicationsLocal(applicationsData);
  persistApplications();
}