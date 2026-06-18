let community = loadCommunity();
let opportunityFilter = "all";
let partnerFormType = "financial";
let showPartnerForm = false;
let showOpportunityForm = false;

function renderCommunityNav() {
  return `
    <div class="nav-section-label">Community</div>
    ${navItem("partner", "🤝", "Partner With Us")}
    ${navItem("opportunities", "💼", "Jobs & Opportunities")}
  `;
}

function renderPublicCommunityNavLinks() {
  return `
    <a href="#" onclick="navigate('landing');return false;">Home</a>
    <a href="#" onclick="navigate('apply');return false;" class="${currentView === "apply" ? "active" : ""}">Apply</a>
    <a href="#" onclick="navigate('partner');return false;" class="${currentView === "partner" ? "active" : ""}">Partner</a>
    <a href="#" onclick="navigate('alumni');return false;" class="${currentView === "alumni" ? "active" : ""}">Alumni</a>
    <a href="#" onclick="navigate('opportunities');return false;" class="${currentView === "opportunities" ? "active" : ""}">Jobs</a>
  `;
}

function renderPublicCommunityContent() {
  if (currentView === "partner") return renderPartnerPage();
  if (currentView === "apply") return renderApplyPage();
  if (currentView === "alumni") return renderPublicAlumniPage();
  return renderOpportunitiesPage();
}

function goToPartnerTab(type = "financial") {
  partnerFormType = PARTNERSHIP_TYPES.some((t) => t.id === type) ? type : "financial";
  navigate("partner");
}

function renderPartnerPage() {
  const pay = community.paymentInfo;
  const isWomenTab = partnerFormType === "women";

  return `
    <div class="page-header">
      <h1>${isWomenTab ? "Moms & Women Supporters" : "Partner With Us"}</h1>
      <p>${isWomenTab
        ? "For mothers and women who believe our sons and brothers need to become god-fearing, responsible, and truly masculine — stand with IronMen through prayer, giving, and encouragement."
        : "IronMen cannot transform lives alone. Stand with us through financial support, mentorship, and more."}</p>
    </div>

    <div class="encouragement-banner ${isWomenTab ? "women-encouragement-banner" : ""}">
      <span class="icon">${isWomenTab ? "💐" : "⚔️"}</span>
      <p>${isWomenTab
        ? "\"Start children off on the way they should go, and even when they are old they will not turn from it.\" — Proverbs 22:6"
        : "\"Carry each other's burdens, and in this way you will fulfill the law of Christ.\" — Galatians 6:2"}</p>
    </div>

    <div class="partner-path-grid">
      ${PARTNERSHIP_TYPES.map((t) => `
        <div class="partner-path-card ${partnerFormType === t.id ? "selected" : ""}" onclick="selectPartnerType('${t.id}')">
          <div class="partner-path-icon">${t.icon}</div>
          <h3>${t.label}</h3>
          <p>${t.desc}</p>
        </div>
      `).join("")}
    </div>

    ${isWomenTab ? renderWomenSupportersSection(pay) : `
      ${partnerFormType === "financial" ? renderFinancialSection(pay) : ""}
      ${partnerFormType === "mentorship" || partnerFormType === "employer" ? renderMentorshipSection() : ""}
      ${partnerFormType === "church" ? renderChurchSection() : ""}

      <div class="dashboard-row" style="margin-top:32px;">
        <div class="card">
          <h3 style="margin-bottom:16px;">Become a Partner</h3>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">Fill in your details and we will contact you within 48 hours.</p>
          ${renderPartnerForm()}
        </div>
        <div class="card">
          <h3 style="margin-bottom:16px;">Our Partners</h3>
          <div class="partners-list">
            ${community.partners.length ? community.partners.map((p) => `
              <div class="partner-badge">
                <span class="partner-type-icon">${PARTNERSHIP_TYPES.find((t) => t.id === p.type)?.icon || "🤝"}</span>
                <div>
                  <strong>${p.name}</strong>
                  <div style="font-size:0.8rem;color:var(--text-muted);">${p.note || p.type} &bull; Since ${p.since}</div>
                </div>
              </div>
            `).join("") : `<p style="color:var(--text-muted);">Be the first partner on this wall.</p>`}
          </div>
        </div>
      </div>

      ${isStaff() ? renderPartnerAdmin() : ""}
    `}
  `;
}

function renderFinancialSection(pay) {
  return `
    <div style="margin-top:32px;">
      <h2 style="margin-bottom:20px;font-size:1.6rem;">Financial Partnership</h2>
      <div class="financial-tiers-grid">
        ${FINANCIAL_TIERS.map((t) => `
          <div class="card financial-tier-card">
            <h3>${t.name}</h3>
            <div class="tier-amount">${t.amount}</div>
            <p style="color:var(--text-muted);font-size:0.9rem;">${t.impact}</p>
          </div>
        `).join("")}
      </div>
      <div class="card card-gold" style="margin-top:24px;">
        <h3 style="margin-bottom:12px;">How to Give</h3>
        <p style="margin-bottom:8px;"><strong>M-Pesa:</strong> ${pay.mpesa}</p>
        <p style="margin-bottom:8px;"><strong>Bank Transfer:</strong> ${pay.bank}</p>
        <p style="color:var(--text-muted);font-size:0.9rem;">${pay.note}</p>
        ${isStaff() ? `
          <div style="margin-top:16px;padding-top:16px;border-top:1px solid var(--border);">
            <h4 style="margin-bottom:12px;font-size:0.95rem;">Edit Payment Details</h4>
            <div class="form-group"><label>M-Pesa</label><input class="form-control" id="pay-mpesa" value="${pay.mpesa}"></div>
            <div class="form-group"><label>Bank</label><input class="form-control" id="pay-bank" value="${pay.bank}"></div>
            <div class="form-group"><label>Note</label><input class="form-control" id="pay-note" value="${pay.note}"></div>
            <button class="btn btn-secondary btn-sm" onclick="savePaymentInfo()">Save Payment Info</button>
          </div>
        ` : renderMpesaConfirmForm()}
      </div>
    </div>
  `;
}

function renderMentorshipSection() {
  return `
    <div style="margin-top:32px;">
      <h2 style="margin-bottom:20px;font-size:1.6rem;">Mentorship Partnership</h2>
      <div class="resources-grid">
        ${MENTORSHIP_ROLES.map((r) => `
          <div class="resource-card">
            <h3>${r.title}</h3>
            <span class="resource-category">${r.commitment}</span>
            <p style="margin-top:12px;">${r.desc}</p>
          </div>
        `).join("")}
      </div>
      <div class="card" style="margin-top:24px;">
        <h3 style="margin-bottom:12px;">Mentor Requirements</h3>
        <ul class="tips-list">
          <li>Male, mature Christian faith (25+ years old)</li>
          <li>Demonstrated integrity in work, family, and finances</li>
          <li>Free from active addiction (2+ years clean if history exists)</li>
          <li>Commits to full 90-day cohort for resident mentors</li>
          <li>Background check and pastoral reference required</li>
        </ul>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-top:12px;">See the <strong>Mentor Guide</strong> in Program Documents for full details.</p>
      </div>
    </div>
  `;
}

function renderChurchSection() {
  return `
    <div style="margin-top:32px;">
      <h2 style="margin-bottom:20px;font-size:1.6rem;">Church & Ministry Partnership</h2>
      <div class="house-program-grid">
        <div class="house-feature">
          <div class="house-feature-icon">✝️</div>
          <h3>Pastoral Oversight</h3>
          <p>Provide spiritual covering, counsel, and accountability for the House Director and program.</p>
        </div>
        <div class="house-feature">
          <div class="house-feature-icon">🏛️</div>
          <h3>Friday Service Venue</h3>
          <p>Host the weekly 1-hour brotherhood service as we transition from Zoom to in-person.</p>
        </div>
        <div class="house-feature">
          <div class="house-feature-icon">📖</div>
          <h3>Teaching & Preaching</h3>
          <p>Supply guest speakers for Friday services and faith modules in the 12-week curriculum.</p>
        </div>
        <div class="house-feature">
          <div class="house-feature-icon">🙏</div>
          <h3>Prayer & Intercession</h3>
          <p>Commit your congregation to pray for residents, mentors, and graduating brothers.</p>
        </div>
      </div>
    </div>
  `;
}

function renderPartnerForm() {
  return `
    <form class="checkin-form" onsubmit="submitPartnerInquiry(event)">
      <div class="form-row">
        <div class="form-group"><label>Your Name *</label><input class="form-control" id="inq-name" required placeholder="Full name"></div>
        <div class="form-group"><label>Organisation</label><input class="form-control" id="inq-org" placeholder="Church, company, or personal"></div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Phone *</label><input class="form-control" id="inq-phone" required placeholder="07XX XXX XXX"></div>
        <div class="form-group"><label>Email</label><input class="form-control" id="inq-email" type="email" placeholder="email@example.com"></div>
      </div>
      <div class="form-group">
        <label>Partnership Interest</label>
        <select class="form-control" id="inq-type">
          ${PARTNERSHIP_TYPES.map((t) => `<option value="${t.id}" ${partnerFormType === t.id ? "selected" : ""}>${t.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Message</label>
        <textarea class="form-control" id="inq-message" placeholder="Tell us how you'd like to partner with IronMen..."></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Submit Partnership Inquiry</button>
    </form>
  `;
}

function renderPartnerAdmin() {
  const pending = community.inquiries.filter((i) => i.status === "pending");
  return `
    <div class="card" style="margin-top:32px;">
      <h3 style="margin-bottom:16px;">Director: Partnership Inquiries (${pending.length} pending)</h3>
      ${community.inquiries.length ? community.inquiries.slice().reverse().map((i) => `
        <div class="journal-entry">
          <div class="journal-date">${i.name} &bull; ${i.type} &bull; ${formatDate(i.date)} &bull; ${i.status}</div>
          <div class="journal-text">${i.org ? i.org + " — " : ""}${i.phone}${i.email ? " — " + i.email : ""}<br>${i.message || ""}</div>
          ${i.status === "pending" ? `<button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="approveInquiry('${i.id}')">Mark Contacted & Add to Partners</button>` : ""}
        </div>
      `).join("") : `<p style="color:var(--text-muted);">No inquiries yet.</p>`}
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border);">
        <h4 style="margin-bottom:12px;">Add Partner Manually</h4>
        <div class="form-row">
          <div class="form-group"><input class="form-control" id="new-partner-name" placeholder="Partner name"></div>
          <div class="form-group">
            <select class="form-control" id="new-partner-type">
              ${PARTNERSHIP_TYPES.map((t) => `<option value="${t.id}">${t.label}</option>`).join("")}
            </select>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="addPartner()">Add Partner</button>
      </div>
    </div>
  `;
}

function renderOpportunitiesPage() {
  const opportunities = getOpenOpportunities(community, opportunityFilter);
  const jobTier = getUserJobTier(user, house);
  const priorityCount = opportunities.filter((o) => isInPriorityWindow(o)).length;
  const counts = {
    all: community.opportunities.filter((o) => o.status === "open").length,
    employment: community.opportunities.filter((o) => o.status === "open" && o.type === "employment").length,
    internship: community.opportunities.filter((o) => o.status === "open" && o.type === "internship").length,
    apprenticeship: community.opportunities.filter((o) => o.status === "open" && o.type === "apprenticeship").length,
  };

  const priorityBanner = jobTier === "priority" ? `
    <div class="encouragement-banner opportunity-priority-banner">
      <span class="icon">🏠</span>
      <p><strong>Priority access active.</strong> As a halfway house member or graduate, you can view full details and express interest before these openings go to the wider brotherhood.</p>
    </div>
  ` : jobTier === "brotherhood" && priorityCount ? `
    <div class="card opportunity-wait-banner">
      <span class="opportunity-priority-badge">⏳ Early access</span>
      <p style="margin-top:8px;color:var(--text-muted);font-size:0.9rem;">${priorityCount} listing${priorityCount === 1 ? "" : "s"} ${priorityCount === 1 ? "is" : "are"} reserved for active residents and graduates first. Full details and applications open to all brothers after the priority period.</p>
    </div>
  ` : jobTier === "public" && priorityCount ? `
    <div class="card opportunity-wait-banner">
      <span class="opportunity-priority-badge">🏠 House priority</span>
      <p style="margin-top:8px;color:var(--text-muted);font-size:0.9rem;">New jobs are offered to halfway house members and graduates first, then opened to the brotherhood. Join IronMen to apply when listings become available to you.</p>
    </div>
  ` : "";

  return `
    <div class="page-header">
      <h1>Jobs & Opportunities</h1>
      <p>Employment, internships, and apprenticeships — halfway house members and graduates get first access, then the wider brotherhood.</p>
    </div>

    ${priorityBanner}

    <div class="dashboard-grid">
      <div class="stat-card"><div class="stat-value">${counts.all}</div><div class="stat-title">Open Opportunities</div></div>
      <div class="stat-card"><div class="stat-value">${counts.employment}</div><div class="stat-title">Jobs</div></div>
      <div class="stat-card"><div class="stat-value">${counts.internship}</div><div class="stat-title">Internships</div></div>
      <div class="stat-card"><div class="stat-value">${counts.apprenticeship}</div><div class="stat-title">Apprenticeships</div></div>
    </div>

    <div class="filter-tabs">
      ${OPPORTUNITY_TYPES.map((t) => `
        <button class="filter-tab ${opportunityFilter === t.id ? "active" : ""}" onclick="setOpportunityFilter('${t.id}')">${t.label} ${t.id !== "all" ? `(${counts[t.id]})` : ""}</button>
      `).join("")}
    </div>

    ${isStaff() ? `
      <div style="margin-bottom:24px;">
        <button class="btn btn-primary btn-sm" onclick="showOpportunityForm=!showOpportunityForm;render()">${showOpportunityForm ? "Cancel" : "+ Post Opportunity"}</button>
      </div>
      ${showOpportunityForm ? renderOpportunityForm() : ""}
    ` : ""}

    <div class="opportunities-grid">
      ${opportunities.length ? opportunities.map((o) => renderOpportunityCard(o)).join("") : `
        <div class="empty-state" style="grid-column:1/-1;">
          <div class="icon">💼</div>
          <p>No opportunities in this category yet. Check back soon or ask the House Director.</p>
        </div>
      `}
    </div>

    <div class="card" style="margin-top:32px;">
      <h3 style="margin-bottom:12px;">For Employer Partners</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">Want to list a job or apprenticeship for IronMen graduates? Partner with us and post opportunities here.</p>
      <button class="btn btn-secondary" onclick="goToPartnerTab('employer')">Become an Employer Partner</button>
    </div>

    ${renderOpportunityInterestLog()}
  `;
}

function renderOpportunityCard(opp) {
  const typeLabel = OPPORTUNITY_TYPES.find((t) => t.id === opp.type)?.label || opp.type;
  const typeClass = `opp-type-${opp.type}`;
  const expressed = community.interestLogs.some((l) => l.opportunityId === opp.id && l.userName === user.name);
  const hasAccess = canAccessOpportunity(opp, user, house);
  const inPriority = isInPriorityWindow(opp);
  const publicDate = getOpportunityPublicDate(opp);
  const jobTier = getUserJobTier(user, house);

  return `
    <div class="card opportunity-card ${!hasAccess ? "opportunity-card-locked" : ""}">
      <div class="opportunity-card-header">
        <div style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;">
          <span class="opportunity-type-badge ${typeClass}">${typeLabel}</span>
          ${inPriority ? `<span class="opportunity-priority-badge">${hasAccess ? "🏠 Priority access" : "🔒 House members first"}</span>` : ""}
          ${jobTier === "staff" && inPriority ? `<span class="opportunity-staff-badge">Opens ${formatDate(publicDate)}</span>` : ""}
        </div>
        <span style="font-size:0.8rem;color:var(--text-muted);">${formatDate(opp.postedDate)}</span>
      </div>
      <h3 style="margin:12px 0 4px;">${opp.title}</h3>
      <p style="color:var(--gold);font-weight:600;font-size:0.95rem;margin-bottom:12px;">${opp.organization}</p>
      ${hasAccess ? `
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">${opp.description}</p>
        <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">
          <span>📍 ${opp.location}</span>
          ${opp.deadline ? `<span style="margin-left:12px;">⏰ Deadline: ${formatDate(opp.deadline)}</span>` : ""}
        </div>
        ${opp.requirements?.length ? `
          <ul class="tips-list" style="margin-bottom:16px;">
            ${opp.requirements.map((r) => `<li>${r}</li>`).join("")}
          </ul>
        ` : ""}
      ` : `
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">This opportunity is reserved for active halfway house residents and graduates until <strong>${formatDate(publicDate)}</strong>. After that date, all IronMen brothers may view details and apply.</p>
        <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">
          <span>📍 ${opp.location}</span>
        </div>
      `}
      <div class="opportunity-card-footer">
        ${hasAccess ? `<span style="font-size:0.85rem;color:var(--text-muted);">Contact: ${opp.contact}</span>` : `<span style="font-size:0.85rem;color:var(--text-muted);">Contact details available after ${formatDate(publicDate)}</span>`}
        <div style="display:flex;gap:8px;margin-top:12px;flex-wrap:wrap;">
          ${user.name ? (
            expressed
              ? `<span style="color:var(--success);font-size:0.85rem;font-weight:600;">✓ Interest expressed</span>`
              : hasAccess
                ? `<button class="btn btn-primary btn-sm" onclick="expressInterest('${opp.id}')">Express Interest</button>`
                : `<button class="btn btn-secondary btn-sm" disabled title="Available to brotherhood after ${formatDate(publicDate)}">Opens ${formatDate(publicDate)}</button>`
          ) : hasAccess
            ? `<button class="btn btn-secondary btn-sm" onclick="showAgeGate()">Join to Apply</button>`
            : `<button class="btn btn-secondary btn-sm" disabled>Opens ${formatDate(publicDate)}</button>`}
          ${isStaff() ? `<button class="btn btn-danger btn-sm" onclick="removeOpportunity('${opp.id}')">Remove</button>` : ""}
        </div>
      </div>
    </div>
  `;
}

function renderOpportunityForm() {
  return `
    <div class="card" style="margin-bottom:24px;">
      <h3 style="margin-bottom:16px;">Post New Opportunity</h3>
      <div class="form-group"><label>Job Title *</label><input class="form-control" id="opp-title" placeholder="e.g. Electrician Apprentice"></div>
      <div class="form-row">
        <div class="form-group"><label>Organisation *</label><input class="form-control" id="opp-org" placeholder="Company name"></div>
        <div class="form-group"><label>Type</label>
          <select class="form-control" id="opp-type">
            <option value="employment">Employment</option>
            <option value="internship">Internship</option>
            <option value="apprenticeship">Apprenticeship</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Location</label><input class="form-control" id="opp-location" placeholder="City / area"></div>
        <div class="form-group"><label>Contact</label><input class="form-control" id="opp-contact" placeholder="Email or phone"></div>
      </div>
      <div class="form-group"><label>Description</label><textarea class="form-control" id="opp-desc" placeholder="Role details, training offered, pay if known..."></textarea></div>
      <div class="form-group"><label>Requirements (comma-separated)</label><input class="form-control" id="opp-reqs" placeholder="18+, physically fit, graduate preferred"></div>
      <div class="form-group">
        <label>Priority period (days)</label>
        <input class="form-control" id="opp-priority-days" type="number" min="0" value="${DEFAULT_PRIORITY_DAYS}" placeholder="${DEFAULT_PRIORITY_DAYS}">
        <p style="color:var(--text-muted);font-size:0.8rem;margin-top:6px;">Residents and graduates can apply during this window before the listing opens to all brothers.</p>
      </div>
      <button class="btn btn-primary" onclick="postOpportunity()">Publish Opportunity</button>
    </div>
  `;
}

function renderOpportunityInterestLog() {
  if (!isStaff()) return "";
  const logs = community.interestLogs.slice().reverse().slice(0, 10);
  if (!logs.length) return "";

  return `
    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:16px;">Recent Interest (Director View)</h3>
      ${logs.map((l) => {
        const opp = community.opportunities.find((o) => o.id === l.opportunityId);
        return `<div class="journal-entry"><div class="journal-date">${l.userName} &bull; ${formatDate(l.date)}</div><div class="journal-text">${opp?.title || "Unknown"} at ${opp?.organization || ""}</div></div>`;
      }).join("")}
    </div>
  `;
}

function renderPublicCommunityPage() {
  app.innerHTML = `
    <div class="landing">
      <header class="home-header">
        <nav class="home-nav">
          <div class="logo" onclick="navigate('landing', { replace: true })" style="cursor:pointer;">
            <div class="logo-icon">⚔</div>
            <div class="logo-text">Iron<span>Men</span></div>
          </div>
          <div class="home-nav-links">
            ${renderPublicCommunityNavLinks()}
          </div>
          <button class="btn btn-primary btn-sm home-nav-cta" onclick="navigate('landing');showAgeGate()">Join</button>
        </nav>
      </header>
      <main class="main-content public-community-page">
        ${renderPublicCommunityContent()}
      </main>
      <footer class="home-footer">
        <div class="home-container home-footer-inner">
          ${renderContactBar("contact-bar-footer")}
          <p class="home-footer-copy">© ${new Date().getFullYear()} IronMen Brotherhood</p>
        </div>
      </footer>
    </div>
    <div id="modal-root"></div>
  `;
}

function selectPartnerType(type) {
  partnerFormType = type;
  render();
}

function setOpportunityFilter(filter) {
  opportunityFilter = filter;
  render();
}

async function submitPartnerInquiry(e) {
  e.preventDefault();
  const inquiry = {
    id: `inq-${Date.now()}`,
    name: document.getElementById("inq-name")?.value.trim(),
    org: document.getElementById("inq-org")?.value.trim() || "",
    phone: document.getElementById("inq-phone")?.value.trim(),
    email: document.getElementById("inq-email")?.value.trim() || "",
    type: document.getElementById("inq-type")?.value || partnerFormType,
    message: document.getElementById("inq-message")?.value.trim() || "",
    date: new Date().toISOString().split("T")[0],
    status: "pending",
  };

  if (!inquiry.name || !inquiry.phone) {
    alert("Name and phone are required.");
    return;
  }

  const ok = await publicSubmit("inquiry", inquiry);
  alert(ok
    ? "Thank you! Your partnership inquiry has been submitted. We will contact you within 48 hours."
    : "Inquiry saved locally. The director will receive it when the server is online.");
  render();
}

function approveInquiry(id) {
  const inquiry = community.inquiries.find((i) => i.id === id);
  if (!inquiry) return;

  inquiry.status = "contacted";
  community.partners.push({
    id: `p-${Date.now()}`,
    name: inquiry.org || inquiry.name,
    type: inquiry.type,
    since: new Date().getFullYear().toString(),
    note: `Partner since ${formatDate(inquiry.date)}`,
  });
  saveCommunity(community);
  render();
}

function addPartner() {
  const name = document.getElementById("new-partner-name")?.value.trim();
  const type = document.getElementById("new-partner-type")?.value;
  if (!name) return;

  community.partners.push({
    id: `p-${Date.now()}`,
    name,
    type,
    since: new Date().getFullYear().toString(),
    note: "",
  });
  saveCommunity(community);
  render();
}

function savePaymentInfo() {
  if (!isStaff()) return;
  community.paymentInfo.mpesa = document.getElementById("pay-mpesa")?.value.trim() || "";
  community.paymentInfo.bank = document.getElementById("pay-bank")?.value.trim() || "";
  community.paymentInfo.note = document.getElementById("pay-note")?.value.trim() || "";
  saveCommunity(community);
  alert("Payment details updated.");
  render();
}

function postOpportunity() {
  if (!isStaff()) return;

  const title = document.getElementById("opp-title")?.value.trim();
  const org = document.getElementById("opp-org")?.value.trim();
  if (!title || !org) {
    alert("Title and organisation are required.");
    return;
  }

  const reqs = document.getElementById("opp-reqs")?.value.trim();
  const priorityDays = parseInt(document.getElementById("opp-priority-days")?.value, 10);
  community.opportunities.unshift({
    id: `opp-${Date.now()}`,
    title,
    organization: org,
    type: document.getElementById("opp-type")?.value || "employment",
    location: document.getElementById("opp-location")?.value.trim() || "TBD",
    description: document.getElementById("opp-desc")?.value.trim() || "",
    requirements: reqs ? reqs.split(",").map((r) => r.trim()) : [],
    contact: document.getElementById("opp-contact")?.value.trim() || "Contact House Director",
    deadline: "",
    status: "open",
    postedDate: new Date().toISOString().split("T")[0],
    priorityDays: Number.isFinite(priorityDays) && priorityDays >= 0 ? priorityDays : DEFAULT_PRIORITY_DAYS,
  });

  saveCommunity(community);
  showOpportunityForm = false;
  alert("Opportunity published!");
  render();
}

async function expressInterest(oppId) {
  if (!user.name) {
    alert("Please complete onboarding first.");
    return;
  }

  const opp = community.opportunities.find((o) => o.id === oppId);
  if (!opp) return;

  if (!canExpressInterest(opp, user, house)) {
    const publicDate = getOpportunityPublicDate(opp);
    alert(`This opportunity is reserved for halfway house members and graduates until ${formatDate(publicDate)}. You can express interest after that date.`);
    return;
  }

  if (community.interestLogs.some((l) => l.opportunityId === oppId && l.userName === user.name)) {
    alert("You have already expressed interest.");
    return;
  }

  const payload = {
    opportunityId: oppId,
    userName: user.name,
    role: user.role,
    date: new Date().toISOString().split("T")[0],
  };

  const ok = await publicSubmit("interest", payload);
  alert(ok
    ? "Interest recorded! The House Director will connect you with the employer."
    : "Interest saved locally. The director will follow up when online.");
  render();
}

function removeOpportunity(id) {
  if (!isStaff() || !confirm("Remove this opportunity?")) return;
  const opp = community.opportunities.find((o) => o.id === id);
  if (opp) opp.status = "closed";
  saveCommunity(community);
  render();
}