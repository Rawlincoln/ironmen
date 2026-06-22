let womenSupportType = "prayer";

function renderWomenSupportersSection(pay) {
  const supportType = WOMEN_SUPPORT_TYPES.find((t) => t.id === womenSupportType) || WOMEN_SUPPORT_TYPES[0];

  return `
    <p style="color:var(--text-muted);font-size:0.95rem;margin-top:24px;max-width:720px;">Behind every strong man is often a praying mother, a faithful sister, or a woman who refused to give up on him. Your belief, prayer, and practical support help raise men who lead with integrity.</p>

    <div class="women-why-grid">
      <article class="card women-why-card">
        <div class="women-why-icon">🛡</div>
        <h3>You see what is at stake</h3>
        <p>Addiction, aimlessness, and absent fathers have left too many young men lost. You know society needs men who protect, provide, and honor God.</p>
      </article>
      <article class="card women-why-card">
        <div class="women-why-icon">✝</div>
        <h3>You believe in redemption</h3>
        <p>You do not write young men off. You believe with structure, brotherhood, and faith, a man can be forged into something solid and dependable.</p>
      </article>
      <article class="card women-why-card">
        <div class="women-why-icon">🤝</div>
        <h3>You strengthen the mission</h3>
        <p>IronMen is a brotherhood for men — but women who share this vision are essential partners in prayer, provision, referrals, and encouragement.</p>
      </article>
    </div>

    <div style="margin-top:40px;">
      <h2 style="margin-bottom:8px;font-size:1.6rem;">How you can stand with us</h2>
      <p style="color:var(--text-muted);margin-bottom:20px;font-size:0.95rem;">Choose a way to support, then tell us how you would like to help.</p>
      <div class="partner-path-grid women-support-grid">
        ${WOMEN_SUPPORT_TYPES.map((t) => `
          <div class="partner-path-card women-support-card ${womenSupportType === t.id ? "selected" : ""}" onclick="selectWomenSupportType('${t.id}')">
            <div class="partner-path-icon">${t.icon}</div>
            <h3>${t.label}</h3>
            <p>${t.desc}</p>
          </div>
        `).join("")}
      </div>
    </div>

    ${renderWomenSupportDetail(supportType, pay)}

    <div class="dashboard-row" style="margin-top:32px;">
      <div class="card">
        <h3 style="margin-bottom:16px;">Join Our Circle of Support</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">Moms, grandmothers, sisters, aunts, and any woman who believes in this work — leave your details and we will reach out within 48 hours.</p>
        ${renderWomenSupportForm()}
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px;">Women Who Stand With Us</h3>
        <div class="partners-list women-supporters-list">
          ${community.womenSupporters.length ? community.womenSupporters.map((w) => `
            <div class="partner-badge women-supporter-badge">
              <span class="partner-type-icon">${WOMEN_SUPPORT_TYPES.find((t) => t.id === w.supportType)?.icon || "💐"}</span>
              <div>
                <strong>${w.name}</strong>
                <div style="font-size:0.8rem;color:var(--text-muted);">${WOMEN_RELATIONSHIPS.find((r) => r.id === w.relationship)?.label || w.relationship}${w.note ? ` &bull; ${w.note}` : ""} &bull; Since ${w.since}</div>
              </div>
            </div>
          `).join("") : `<p style="color:var(--text-muted);">Be the first woman on our wall of support.</p>`}
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:12px;">A note on boundaries</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;">The halfway house and mentorship program are led by men, for men. Women supporters bless the mission through prayer, giving, practical care, referrals, and encouragement — not through residential or one-on-one mentorship roles. This protects both residents and supporters.</p>
    </div>

    ${isStaff() ? renderWomenSupporterAdmin() : ""}
  `;
}

function renderWomenSupportDetail(supportType, pay) {
  if (supportType.id === "financial") {
    return `
      <div style="margin-top:32px;">
        <h2 style="margin-bottom:20px;font-size:1.5rem;">Give toward the brotherhood</h2>
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
          ${!isStaff() ? renderMpesaConfirmForm() : ""}
        </div>
      </div>
    `;
  }

  if (supportType.id === "prayer") {
    return `
      <div class="card" style="margin-top:32px;">
        <h3 style="margin-bottom:12px;">Prayer commitments we ask of you</h3>
        <ul class="tips-list">
          <li>Pray for the 10 men in each cohort — by name when possible</li>
          <li>Pray for mentors and the House Director to lead with wisdom</li>
          <li>Pray for graduates finding work and staying free from vice</li>
          <li>Pray for The Forge to reach more men every Friday</li>
          <li>Pray for mothers and families waiting for their sons to come home changed</li>
        </ul>
      </div>
    `;
  }

  if (supportType.id === "care") {
    return `
      <div class="card" style="margin-top:32px;">
        <h3 style="margin-bottom:12px;">Practical items that bless the house</h3>
        <ul class="tips-list">
          <li>Toiletries, towels, bedding, and cleaning supplies</li>
          <li>Modest work clothes and shoes for job interviews</li>
          <li>Bibles, notebooks, and study materials</li>
          <li>Occasional meals or groceries for the cohort</li>
          <li>Graduation care packages for men launching into work</li>
        </ul>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-top:12px;">Contact the House Director before drop-off so we can coordinate with house needs and schedules.</p>
      </div>
    `;
  }

  if (supportType.id === "referral") {
    return `
      <div class="card" style="margin-top:32px;">
        <h3 style="margin-bottom:12px;">Who to refer</h3>
        <ul class="tips-list">
          <li>Young men 18+ struggling with porn, gambling, drugs, or aimlessness</li>
          <li>Men who want structure, faith, and brotherhood but lack support at home</li>
          <li>Sons, nephews, or neighbors ready to commit to 90 days of transformation</li>
        </ul>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-top:12px;">Use the form below to share his situation. Our director will follow up with you and, if appropriate, begin intake screening.</p>
      </div>
    `;
  }

  if (supportType.id === "encouragement") {
    return `
      <div class="card" style="margin-top:32px;">
        <h3 style="margin-bottom:12px;">Words that forge courage</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:12px;">Short letters, Scripture cards, and messages of belief remind brothers that someone is cheering for their freedom and growth. We read these aloud in house devotions when appropriate.</p>
        <ul class="tips-list">
          <li>Keep messages hopeful, dignifying, and faith-centered</li>
          <li>Avoid romantic language — encouragement, not flirtation</li>
          <li>Sign with your first name or "An IronMen Supporter"</li>
        </ul>
      </div>
    `;
  }

  return `
    <div class="card" style="margin-top:32px;">
      <h3 style="margin-bottom:12px;">Raise your voice</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:12px;">Talk to your pastor, women's fellowship, or friends about why strong men matter. Share IronMen with parents who are worried about their sons. Invite your church to partner with us.</p>
      <button class="btn btn-secondary btn-sm" onclick="goToPartnerTab('church')">See Church Partnership Options</button>
    </div>
  `;
}

function renderWomenSupportForm() {
  return `
    <form class="checkin-form" onsubmit="submitWomenSupporterInquiry(event)">
      <div class="form-row">
        <div class="form-group"><label>Your Name *</label><input class="form-control" id="ws-name" required placeholder="Full name"></div>
        <div class="form-group"><label>I am a...</label>
          <select class="form-control" id="ws-relationship">
            ${WOMEN_RELATIONSHIPS.map((r) => `<option value="${r.id}">${r.label}</option>`).join("")}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group"><label>Phone *</label><input class="form-control" id="ws-phone" required placeholder="07XX XXX XXX"></div>
        <div class="form-group"><label>Email</label><input class="form-control" id="ws-email" type="email" placeholder="email@example.com"></div>
      </div>
      <div class="form-group">
        <label>How would you like to support?</label>
        <select class="form-control" id="ws-type">
          ${WOMEN_SUPPORT_TYPES.map((t) => `<option value="${t.id}" ${womenSupportType === t.id ? "selected" : ""}>${t.label}</option>`).join("")}
        </select>
      </div>
      <div class="form-group">
        <label>Message</label>
        <textarea class="form-control" id="ws-message" placeholder="Tell us how you would like to help — prayer commitment, referral details, items you can provide, etc."></textarea>
      </div>
      <button type="submit" class="btn btn-primary btn-block">Stand With IronMen</button>
    </form>
  `;
}

function renderWomenSupporterAdmin() {
  const pending = community.supporterInquiries.filter((i) => i.status === "pending");
  return `
    <div class="card" style="margin-top:32px;">
      <h3 style="margin-bottom:16px;">Director: Women Supporter Inquiries (${pending.length} pending)</h3>
      ${community.supporterInquiries.length ? community.supporterInquiries.slice().reverse().map((i) => `
        <div class="journal-entry">
          <div class="journal-date">${i.name} &bull; ${WOMEN_RELATIONSHIPS.find((r) => r.id === i.relationship)?.label || i.relationship} &bull; ${WOMEN_SUPPORT_TYPES.find((t) => t.id === i.supportType)?.label || i.supportType} &bull; ${formatDate(i.date)} &bull; ${i.status}</div>
          <div class="journal-text">${i.phone}${i.email ? " — " + i.email : ""}<br>${i.message || ""}</div>
          ${i.status === "pending" ? `<button class="btn btn-secondary btn-sm" style="margin-top:8px;" onclick="approveWomenSupporter('${i.id}')">Mark Contacted & Add to Wall</button>` : ""}
        </div>
      `).join("") : `<p style="color:var(--text-muted);">No supporter inquiries yet.</p>`}
      <div style="margin-top:20px;padding-top:20px;border-top:1px solid var(--border);">
        <h4 style="margin-bottom:12px;">Add Supporter Manually</h4>
        <div class="form-row">
          <div class="form-group"><input class="form-control" id="new-ws-name" placeholder="Name"></div>
          <div class="form-group">
            <select class="form-control" id="new-ws-relationship">
              ${WOMEN_RELATIONSHIPS.map((r) => `<option value="${r.id}">${r.label}</option>`).join("")}
            </select>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" onclick="addWomenSupporter()">Add to Wall</button>
      </div>
    </div>
  `;
}

function selectWomenSupportType(type) {
  womenSupportType = type;
  render();
}

async function submitWomenSupporterInquiry(e) {
  e.preventDefault();
  const inquiry = {
    id: `ws-${Date.now()}`,
    name: document.getElementById("ws-name")?.value.trim(),
    relationship: document.getElementById("ws-relationship")?.value || "other",
    phone: document.getElementById("ws-phone")?.value.trim(),
    email: document.getElementById("ws-email")?.value.trim() || "",
    supportType: document.getElementById("ws-type")?.value || womenSupportType,
    message: document.getElementById("ws-message")?.value.trim() || "",
    date: new Date().toISOString().split("T")[0],
    status: "pending",
  };

  if (!inquiry.name || !inquiry.phone) {
    alert("Name and phone are required.");
    return;
  }

  const ok = await publicSubmit("supporter", inquiry);
  alert(ok
    ? "Thank you! Your heart for these men means more than you know. We will contact you within 48 hours."
    : "Inquiry saved locally. The director will reach out when the server is online.");
  render();
}

function approveWomenSupporter(id) {
  const inquiry = community.supporterInquiries.find((i) => i.id === id);
  if (!inquiry) return;

  inquiry.status = "contacted";
  community.womenSupporters.push({
    id: `w-${Date.now()}`,
    name: inquiry.name,
    relationship: inquiry.relationship,
    supportType: inquiry.supportType,
    since: new Date().getFullYear().toString(),
    note: WOMEN_SUPPORT_TYPES.find((t) => t.id === inquiry.supportType)?.label || "",
  });
  saveCommunity(community);
  render();
}

function addWomenSupporter() {
  if (!isStaff()) return;
  const name = document.getElementById("new-ws-name")?.value.trim();
  const relationship = document.getElementById("new-ws-relationship")?.value || "other";
  if (!name) return;

  community.womenSupporters.push({
    id: `w-${Date.now()}`,
    name,
    relationship,
    supportType: womenSupportType,
    since: new Date().getFullYear().toString(),
    note: "",
  });
  saveCommunity(community);
  render();
}