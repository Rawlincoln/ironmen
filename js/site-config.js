let siteConfig = loadSiteConfig();

function getDefaultSiteConfig() {
  return {
    contact: {
      phone: "0712 000 000",
      whatsapp: "254712000000",
      email: "director@ironmen.org",
      location: "Nairobi, Kenya",
      hours: "Mon–Sat, 8:00 AM – 6:00 PM",
    },
    directorPin: "ironmen",
    mentorPin: "mentor",
    outcomes: { menServed: 10, graduatesPlaced: 0, cohortsCompleted: 0 },
    testimonials: [
      { name: "James M.", role: "Graduate", quote: "Ninety days in the house gave me structure I never had at home. I left with a job and a prayer life." },
      { name: "Pastor David K.", role: "Church Partner", quote: "IronMen is doing what many churches struggle to do — forge young men into dependable, God-fearing adults." },
      { name: "Grace N.", role: "Mom & Supporter", quote: "I prayed for my son for years. This brotherhood did what I could not do alone." },
    ],
    labels: {
      tagline_sw: "Ndugu wa kiume wenye kumcha Mungu",
      apply_sw: "Omba Kujiunga",
      friday_sw: "Ibada ya Ijumaa",
    },
    demoMode: false,
    showSampleData: false,
  };
}

function loadSiteConfig() {
  try {
    const raw = localStorage.getItem("ironmen_site_config");
    if (!raw) return getDefaultSiteConfig();
    return { ...getDefaultSiteConfig(), ...JSON.parse(raw) };
  } catch {
    return getDefaultSiteConfig();
  }
}

function saveSiteConfig(cfg) {
  siteConfig = cfg;
  localStorage.setItem("ironmen_site_config", JSON.stringify(cfg));
  persistSiteConfig();
}

function renderContactBar(className = "") {
  const c = siteConfig.contact;
  const wa = c.whatsapp ? `https://wa.me/${c.whatsapp.replace(/\D/g, "")}` : "#";
  return `
    <div class="contact-bar ${className}">
      <a href="tel:${c.phone?.replace(/\s/g, "")}" class="contact-bar-item">📞 ${c.phone}</a>
      <a href="${wa}" target="_blank" rel="noopener" class="contact-bar-item">💬 WhatsApp</a>
      <span class="contact-bar-item">📍 ${c.location}</span>
      <span class="contact-bar-item">🕐 ${c.hours}</span>
    </div>
  `;
}

function renderTestimonials() {
  const items = siteConfig.testimonials || [];
  if (!items.length) return "";
  return `
    <section class="home-section home-section-alt" id="testimonials">
      <div class="home-container">
        <div class="home-section-header">
          <p class="home-eyebrow">Proof of change</p>
          <h2>Stories from the brotherhood</h2>
        </div>
        <div class="testimonials-grid">
          ${items.map((t) => `
            <blockquote class="card testimonial-card">
              <p class="testimonial-quote">"${t.quote}"</p>
              <footer><strong>${t.name}</strong> — ${t.role}</footer>
            </blockquote>
          `).join("")}
        </div>
        <div class="outcomes-bar">
          <div class="outcome-stat"><strong>${siteConfig.outcomes.menServed || 0}</strong><span>Men served</span></div>
          <div class="outcome-stat"><strong>${siteConfig.outcomes.graduatesPlaced || 0}</strong><span>Graduates placed</span></div>
          <div class="outcome-stat"><strong>${siteConfig.outcomes.cohortsCompleted || 0}</strong><span>Cohorts completed</span></div>
        </div>
      </div>
    </section>
  `;
}

function renderWhoIsThisFor() {
  return `
    <section class="home-section" id="who">
      <div class="home-container">
        <div class="home-section-header">
          <p class="home-eyebrow">Is IronMen for you?</p>
          <h2>Who we serve</h2>
          <p class="home-section-desc">Men 18+ who want structure, faith, brotherhood, and a path to responsible adulthood.</p>
        </div>
        <div class="who-grid">
          <div class="card who-card who-yes">
            <h3>You may be a fit if...</h3>
            <ul class="tips-list">
              <li>You are 18 or older and male</li>
              <li>You want freedom from porn, gambling, drugs, or aimlessness</li>
              <li>You will commit to 90 days on-site (residential program)</li>
              <li>You are open to faith, mentorship, and accountability</li>
              <li>You want work, discipline, and brotherhood</li>
            </ul>
            <button class="btn btn-primary btn-sm" onclick="navigate('apply')">Apply to the House</button>
          </div>
          <div class="card who-card who-no">
            <h3>Not a fit if...</h3>
            <ul class="tips-list">
              ${INTAKE_CRITERIA.disqualifiers.slice(0, 5).map((d) => `<li>${d}</li>`).join("")}
            </ul>
            <button class="btn btn-secondary btn-sm" onclick="navigate('apply')">Read full criteria</button>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderFridayPublicCard() {
  const svc = house?.fridayService || getDefaultFridayService();
  const nextFriday = getNextFriday(new Date(), svc.serviceTime);
  const topic = getCurrentServiceTopic(house);
  const countdown = getTimeUntilService(nextFriday);
  const isZoom = svc.mode !== "in-person";
  return `
    <section class="home-section home-section-alt" id="friday-public">
      <div class="home-container">
        <div class="friday-public-card card card-gold">
          <div class="friday-public-inner">
            <div>
              <p class="home-eyebrow">${siteConfig.labels.friday_sw ? "Friday Service / " + siteConfig.labels.friday_sw : "This Friday"}</p>
              <h2>${formatServiceDateTime(nextFriday)}</h2>
              <p style="color:var(--text-muted);margin:8px 0;">${countdown} &bull; Topic: <strong>${topic.title}</strong></p>
              <p style="font-size:0.9rem;color:var(--text-muted);">${isZoom ? "Join on Zoom — open to all brothers." : svc.physicalVenue || "In-person venue"}</p>
            </div>
            <div class="friday-public-actions">
              ${isZoom && svc.zoomLink ? `<a class="btn btn-primary" href="${svc.zoomLink}" target="_blank" rel="noopener">Join Zoom</a>` : ""}
              <button class="btn btn-secondary" onclick="showAgeGate()">RSVP as Brother</button>
              <button class="btn btn-outline" onclick="${user.loggedIn && user.onboardingComplete ? "navigate('friday')" : "showAgeGate()"}">Full service page</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderMpesaConfirmForm() {
  return `
    <div class="card" style="margin-top:20px;">
      <h3 style="margin-bottom:12px;">Confirm Your M-Pesa Gift</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">After sending, tell us so the House Director can confirm receipt.</p>
      <form class="checkin-form" onsubmit="submitMpesaConfirmation(event)">
        <div class="form-row">
          <div class="form-group"><label>Your Name *</label><input class="form-control" id="mpesa-name" required></div>
          <div class="form-group"><label>Amount (KES) *</label><input class="form-control" id="mpesa-amount" required placeholder="2000"></div>
        </div>
        <div class="form-group"><label>M-Pesa Reference *</label><input class="form-control" id="mpesa-ref" required placeholder="Transaction code"></div>
        <button type="submit" class="btn btn-primary btn-sm">Submit Confirmation</button>
      </form>
    </div>
  `;
}

async function submitMpesaConfirmation(e) {
  e.preventDefault();
  const payload = {
    id: `mpesa-${Date.now()}`,
    name: document.getElementById("mpesa-name")?.value.trim(),
    amount: document.getElementById("mpesa-amount")?.value.trim(),
    reference: document.getElementById("mpesa-ref")?.value.trim(),
    date: new Date().toISOString().split("T")[0],
    status: "pending",
  };
  const ok = await publicSubmit("mpesa", payload);
  if (ok) alert("Thank you! Your giving confirmation has been sent to the House Director.");
  else alert("Could not reach server. Saved locally — director will sync when online.");
  render();
}