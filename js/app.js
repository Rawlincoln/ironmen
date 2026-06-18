let user = loadUser();
house = loadHouse();
community = loadCommunity();
let currentView = "landing";
let onboardingStep = 0;
let selectedVices = [];
let selectedRole = "";
let selectedMood = "";
let selectedVictory = null;
let otherBattleLabel = "";

const app = document.getElementById("app");

function render() {
  if (!user.loggedIn) {
    if (PUBLIC_VIEWS.includes(currentView) && currentView !== "landing") {
      renderPublicCommunityPage();
      return;
    }
    renderLanding();
    return;
  }
  if (!user.ageVerified) {
    if (PUBLIC_VIEWS.includes(currentView) && currentView !== "landing") {
      renderPublicCommunityPage();
      return;
    }
    renderLanding();
    return;
  }
  if (!user.onboardingComplete) {
    renderOnboarding();
    return;
  }
  if (currentView === "landing") {
    renderLanding();
    return;
  }
  renderApp();
}

function renderLanding() {
  app.innerHTML = `
    <div class="landing">
      <header class="home-header">
        <nav class="home-nav">
          <div class="logo">
            <div class="logo-icon">⚔</div>
            <div class="logo-text">Iron<span>Men</span></div>
          </div>
          <div class="home-nav-links">
            <a href="#about" onclick="scrollToSection('about')">About</a>
            <a href="#programs" onclick="scrollToSection('programs')">Programs</a>
            <a href="#" onclick="navigate('apply');return false;">Apply</a>
            <a href="#" onclick="navigate('partner');return false;">Partner</a>
            <a href="#" onclick="navigate('opportunities');return false;">Jobs</a>
          </div>
          <button class="btn btn-primary btn-sm home-nav-cta" onclick="${user.loggedIn ? `navigate('${getDefaultViewForRole()}')` : "showAgeGate()"}">${user.loggedIn ? "My Dashboard" : "Join the Brotherhood"}</button>
        </nav>
      </header>

      ${renderInstallBanner()}

      <section class="home-hero">
        <div class="home-hero-glow"></div>
        <div class="home-hero-inner">
          <p class="home-eyebrow">Brotherhood for men 18+</p>
          <h1>Become the man<br>God created you to be</h1>
          <p class="home-lead">IronMen helps young men break free from vice, grow in faith, and build a life of discipline, responsibility, and purpose — together.</p>
          <div class="home-hero-actions">
            ${user.loggedIn
              ? `<button class="btn btn-primary btn-lg" onclick="navigate('${getDefaultViewForRole()}')">Go to Dashboard</button>`
              : `<button class="btn btn-primary btn-lg" onclick="showAgeGate()">Start Your Journey</button>`}
            <button class="btn btn-outline btn-lg" onclick="scrollToSection('programs')">Explore Programs</button>
          </div>
          <p class="home-verse">"As iron sharpens iron, so one man sharpens another." — Proverbs 27:17</p>
        </div>
      </section>

      <section class="home-stats">
        <div class="home-stats-inner">
          <div class="home-stat"><span class="home-stat-num">10</span><span class="home-stat-label">Men per cohort</span></div>
          <div class="home-stat-divider"></div>
          <div class="home-stat"><span class="home-stat-num">90</span><span class="home-stat-label">Days of transformation</span></div>
          <div class="home-stat-divider"></div>
          <div class="home-stat"><span class="home-stat-num">12</span><span class="home-stat-label">Weeks of training</span></div>
          <div class="home-stat-divider"></div>
          <div class="home-stat"><span class="home-stat-num">Fri</span><span class="home-stat-label">Weekly brotherhood service</span></div>
        </div>
      </section>

      <section class="home-section" id="about">
        <div class="home-container">
          <div class="home-section-header">
            <p class="home-eyebrow">Our foundation</p>
            <h2>Three pillars of godly manhood</h2>
            <p class="home-section-desc">Everything we do rests on faith, freedom, and responsibility.</p>
          </div>
          <div class="home-pillars">
            <article class="home-pillar">
              <div class="home-pillar-icon">✝</div>
              <h3>Fear of the Lord</h3>
              <p>Daily devotion, Scripture, and prayer — the foundation of a strong man.</p>
            </article>
            <article class="home-pillar">
              <div class="home-pillar-icon">🛡</div>
              <h3>Freedom from Vice</h3>
              <p>Break free from porn, gambling, and drugs with accountability and brotherhood.</p>
            </article>
            <article class="home-pillar">
              <div class="home-pillar-icon">⚔</div>
              <h3>Responsible Success</h3>
              <p>Build discipline in money, work, health, and character. Become dependable.</p>
            </article>
          </div>
        </div>
      </section>

      ${renderFridayPublicCard()}
      ${renderWhoIsThisFor()}

      <section class="home-section home-section-alt" id="programs">
        <div class="home-container">
          <div class="home-section-header">
            <p class="home-eyebrow">What we offer</p>
            <h2>Programs for every brother</h2>
            <p class="home-section-desc">Whether you need residential support, weekly fellowship, or a path to work — there is a place for you.</p>
          </div>
          <div class="home-programs">
            <article class="home-program-card home-program-featured" onclick="scrollToSection('house-detail')">
              <span class="home-program-tag">Residential</span>
              <h3>Halfway House</h3>
              <p>Live on-site for 90 days. Rigorous mentorship in discipline, faith, grooming, fitness, and work readiness. Graduate into a job or apprenticeship.</p>
              <ul class="home-program-meta">
                <li>10 beds</li>
                <li>12-week curriculum</li>
                <li>Full documentation</li>
              </ul>
              <span class="home-program-link">Learn more →</span>
            </article>
            <article class="home-program-card" onclick="scrollToSection('friday-detail')">
              <span class="home-program-tag">Weekly</span>
              <h3>Friday Service</h3>
              <p>One hour of worship, teaching, and fellowship every Friday at 7 PM. On Zoom now, in-person soon.</p>
              <span class="home-program-link">Learn more →</span>
            </article>
            <article class="home-program-card" onclick="navigate('partner')">
              <span class="home-program-tag">Partners</span>
              <h3>Partner With Us</h3>
              <p>Support financially, mentor a brother, or stand with us as a mom or woman who believes in godly manhood.</p>
              <span class="home-program-link">Get involved →</span>
            </article>
            <article class="home-program-card" onclick="navigate('opportunities')">
              <span class="home-program-tag">Careers</span>
              <h3>Jobs & Opportunities</h3>
              <p>Employment, internships, and apprenticeships for brothers ready to work.</p>
              <span class="home-program-link">Browse listings →</span>
            </article>
          </div>
        </div>
      </section>

      <section class="home-detail" id="house-detail">
        <div class="home-container home-detail-grid">
          <div class="home-detail-content">
            <p class="home-eyebrow">The halfway house</p>
            <h2>90 days that change a life</h2>
            <p>Up to 10 men live together in structured community — morning devotion, fitness, skills training, work readiness, and evening accountability. Every week documented. Every man placed.</p>
            <button class="btn btn-primary" onclick="showAgeGate()">Apply to the Program</button>
          </div>
          <div class="home-detail-visual">
            <div class="home-detail-card"><strong>8</strong><span>Skill pillars tracked</span></div>
            <div class="home-detail-card"><strong>1</strong><span>Mentor per resident</span></div>
            <div class="home-detail-card"><strong>3</strong><span>Months to graduate</span></div>
            <div class="home-detail-card"><strong>∞</strong><span>Brotherhood for life</span></div>
          </div>
        </div>
      </section>

      <section class="home-detail home-detail-alt" id="friday-detail">
        <div class="home-container home-detail-grid home-detail-reverse">
          <div class="home-detail-visual home-detail-single">
            <div class="home-friday-card">
              <p class="home-friday-day">Every Friday</p>
              <p class="home-friday-time">7:00 – 8:00 PM</p>
              <p class="home-friday-mode">Zoom → In-person</p>
            </div>
          </div>
          <div class="home-detail-content">
            <p class="home-eyebrow">Brotherhood service</p>
            <h2>Worship together, grow together</h2>
            <p>A weekly church-style gathering open to all brothers — residents, alumni, mentors, and members. Worship, Scripture, testimony, and fellowship in one focused hour.</p>
            <button class="btn btn-secondary" onclick="showAgeGate()">Join the Brotherhood</button>
          </div>
        </div>
      </section>

      ${renderTestimonials()}

      ${renderGetAppSection()}

      <section class="home-cta">
        <div class="home-container">
          <div class="home-cta-card">
            <h2>Ready to stand firm?</h2>
            <p>Take the first step. Join men who are choosing faith, discipline, and purpose over empty pleasures.</p>
            <div class="home-cta-actions">
              <button class="btn btn-primary btn-lg" onclick="showAgeGate()">Join IronMen — Free</button>
              <button class="btn btn-outline btn-lg" onclick="goToPartnerTab('women')">Moms & Women — Stand With Us</button>
              <button class="btn btn-outline btn-lg" onclick="navigate('partner')">Partner With Us</button>
            </div>
          </div>
        </div>
      </section>

      <footer class="home-footer">
        <div class="home-container home-footer-inner">
          <div class="logo">
            <div class="logo-icon">⚔</div>
            <div class="logo-text">Iron<span>Men</span></div>
          </div>
          <div class="home-footer-links">
            <a href="#about" onclick="scrollToSection('about')">About</a>
            <a href="#" onclick="navigate('apply');return false;">Apply</a>
            <a href="#" onclick="navigate('partner');return false;">Partner</a>
            <a href="#" onclick="navigate('alumni');return false;">Alumni</a>
            <a href="#" onclick="navigate('opportunities');return false;">Jobs</a>
          </div>
          ${renderContactBar("contact-bar-footer")}
          <p class="home-footer-copy">© ${new Date().getFullYear()} IronMen Brotherhood · Proverbs 27:17</p>
        </div>
      </footer>
    </div>
    <div id="modal-root"></div>
  `;
}

function showAgeGate() {
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal" onclick="event.stopPropagation()">
        <h2>Age Verification</h2>
        <p>IronMen is designed for men aged 18 and above. By continuing, you confirm you meet this requirement.</p>
        <div class="modal-actions">
          <button class="btn btn-primary btn-block" onclick="confirmAge()">I am 18 or older</button>
          <button class="btn btn-ghost btn-block" onclick="closeModal()">Go back</button>
        </div>
      </div>
    </div>
  `;
}

function closeModal(e) {
  if (e && e.target !== e.currentTarget) return;
  const root = document.getElementById("modal-root");
  if (root) root.innerHTML = "";
}

function confirmAge() {
  user.ageVerified = true;
  user.loggedIn = true;
  saveUser(user);
  closeModal();
  if (user.onboardingComplete) {
    navigate(getDefaultViewForRole(), { replace: true });
  } else {
    onboardingNavigate(0, { replace: true });
  }
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function scrollToPillars() {
  scrollToSection("about");
}

function scrollToHouse() {
  scrollToSection("house-detail");
}

function scrollToFriday() {
  scrollToSection("friday-detail");
}

function renderOnboarding() {
  const steps = ["Your Name", "Your Role", "Your Path", "Final Step"];
  app.innerHTML = `
    <div class="onboarding">
      <div class="card onboarding-card">
        <div class="onboarding-steps">
          ${steps.map((_, i) => `<div class="step-dot ${i <= onboardingStep ? "active" : ""}"></div>`).join("")}
        </div>
        ${onboardingStep === 0 ? renderOnboardingStep1() : ""}
        ${onboardingStep === 1 ? renderOnboardingStepRole() : ""}
        ${onboardingStep === 2 ? renderOnboardingStep2() : ""}
        ${onboardingStep === 3 ? renderOnboardingStep3() : ""}
      </div>
    </div>
  `;
}

function renderOnboardingStep1() {
  return `
    <h2>Welcome, brother</h2>
    <p class="subtitle">What should we call you?</p>
    <div class="form-group">
      <label>Your first name</label>
      <input class="form-control" id="onboard-name" type="text" placeholder="Enter your name" value="${user.name}" autofocus>
    </div>
    <button class="btn btn-primary btn-block" onclick="nextOnboarding(1)">Continue</button>
  `;
}

function renderOnboardingStepRole() {
  const roles = [
    { id: "resident", icon: "🏠", label: "House Resident", desc: "I live in or am applying to the 90-day halfway house program." },
    { id: "director", icon: "🏛️", label: "House Director", desc: "I manage the house, cohorts, residents, and graduation." },
    { id: "mentor", icon: "🤝", label: "Mentor / Staff", desc: "I mentor residents and log training & assessments." },
    { id: "member", icon: "⚔️", label: "Brotherhood Member", desc: "Online accountability only — not in the residential program." },
  ];
  return `
    <h2>Your role</h2>
    <p class="subtitle">How will you use IronMen?</p>
    <div class="checkbox-group">
      ${roles.map((r) => `
        <label class="checkbox-item ${selectedRole === r.id ? "selected" : ""}" onclick="selectRole('${r.id}')">
          <input type="radio" name="role" ${selectedRole === r.id ? "checked" : ""} onclick="event.preventDefault()">
          <span>${r.icon}</span>
          <div><strong>${r.label}</strong><div style="font-size:0.85rem;color:var(--text-muted);margin-top:2px;">${r.desc}</div></div>
        </label>
      `).join("")}
    </div>
    ${requiresStaffPin(selectedRole) ? renderStaffPinGate(selectedRole) : ""}
    <button class="btn btn-primary btn-block" onclick="nextOnboarding(2)">Continue</button>
    <button class="btn btn-ghost btn-block" onclick="history.back()">Back</button>
  `;
}

function selectRole(id) {
  selectedRole = id;
  render();
}

function renderOnboardingStep2() {
  if (selectedRole === "director" || selectedRole === "mentor") {
    return `
      <h2>House setup</h2>
      <p class="subtitle">Configure the halfway house program.</p>
      <div class="form-group">
        <label>House Name</label>
        <input class="form-control" id="house-name" value="${house.name}" placeholder="IronMen Halfway House">
      </div>
      <div class="form-group">
        <label>Location / Address (optional)</label>
        <input class="form-control" id="house-address" value="${house.address}" placeholder="City, area, or address">
      </div>
      <p style="color:var(--text-muted);font-size:0.85rem;margin-bottom:16px;">Capacity is set at ${HOUSE_CAPACITY} men per cohort for a ${PROGRAM_DAYS}-day program.</p>
      <button class="btn btn-primary btn-block" onclick="nextOnboarding(3)">Continue</button>
      <button class="btn btn-ghost btn-block" onclick="history.back()">Back</button>
    `;
  }

  const otherLabel = otherBattleLabel || user.vices.other?.label || "";

  return `
    <h2>Choose your battles</h2>
    <p class="subtitle">Which struggles do you want to overcome? Select all that apply.</p>
    <div class="privacy-notice">
      <span class="privacy-notice-icon">🔒</span>
      <p><strong>Confidential & protected.</strong> Your battles are personal. They stay on your device and are never shared with the brotherhood, house staff, or anyone else unless you choose to disclose them. House program data may sync to the director's server when online — your private battle records do not.</p>
    </div>
    <div class="checkbox-group">
      ${VICES.map((v) => `
        <label class="checkbox-item ${selectedVices.includes(v.id) ? "selected" : ""}" onclick="toggleVice('${v.id}')">
          <input type="checkbox" ${selectedVices.includes(v.id) ? "checked" : ""} onclick="event.preventDefault()">
          <span>${v.icon}</span>
          <span>${v.id === "other" ? "Other..." : v.name}</span>
        </label>
      `).join("")}
    </div>
    ${selectedVices.includes("other") ? `
      <div class="form-group" style="margin-top:16px;">
        <label>Specify your other battle *</label>
        <input class="form-control" id="onboard-other-battle" type="text" value="${otherLabel}" placeholder="e.g. anger, social media, laziness, lustful thoughts..." oninput="otherBattleLabel=this.value">
      </div>
    ` : ""}
    <button class="btn btn-primary btn-block" onclick="nextOnboarding(3)">Continue</button>
    <button class="btn btn-ghost btn-block" onclick="history.back()">Back</button>
  `;
}

function renderOnboardingStep3() {
  if (selectedRole === "director" || selectedRole === "mentor") {
    return `
      <h2>Ready to lead</h2>
      <p class="subtitle">You will manage the halfway house — admit residents, log training, assess skills, and graduate cohorts.</p>
      <button class="btn btn-primary btn-block" onclick="finishOnboarding()">Enter House Dashboard</button>
      <button class="btn btn-ghost btn-block" onclick="history.back()">Back</button>
    `;
  }

  const isResident = selectedRole === "resident";
  return `
    <h2>${isResident ? "Program details" : "Accountability partner"}</h2>
    <p class="subtitle">${isResident ? "You are joining the 90-day residential program at the halfway house." : "Who will walk this journey with you? (Optional)"}</p>
    ${isResident ? `
      <div class="card" style="margin-bottom:20px;padding:16px;">
        <p style="font-size:0.9rem;color:var(--text-muted);">During your 3-month stay you will receive mentorship in discipline, faith, money, hygiene, grooming, fitness, and work readiness. All progress is documented. Upon graduation you will be placed with an employer or apprenticeship.</p>
      </div>
    ` : ""}
    <div class="form-group">
      <label>${isResident ? "Emergency contact / Accountability partner" : "Partner's name"}</label>
      <input class="form-control" id="onboard-partner" type="text" placeholder="e.g. James, Pastor Mike" value="${user.accountabilityPartner}">
    </div>
    <button class="btn btn-primary btn-block" onclick="finishOnboarding()">Enter IronMen</button>
    <button class="btn btn-ghost btn-block" onclick="history.back()">Back</button>
  `;
}

function saveOtherBattleLabelFromInput() {
  const el = document.getElementById("onboard-other-battle");
  if (el) otherBattleLabel = el.value.trim();
}

function toggleVice(id) {
  saveOtherBattleLabelFromInput();
  if (selectedVices.includes(id)) {
    selectedVices = selectedVices.filter((v) => v !== id);
    if (id === "other") otherBattleLabel = "";
  } else {
    selectedVices.push(id);
  }
  render();
}

async function nextOnboarding(step) {
  if (step === 1) {
    const name = document.getElementById("onboard-name")?.value.trim();
    if (!name) {
      alert("Please enter your name.");
      return;
    }
    user.name = name;
    saveUser(user);
  }
  if (step === 2) {
    if (!selectedRole) {
      alert("Please select your role.");
      return;
    }
    if (requiresStaffPin(selectedRole)) {
      const ok = await validateStaffPinForOnboarding(selectedRole);
      if (!ok) return;
    }
    user.role = selectedRole;
    user.inProgram = selectedRole === "resident";
    saveUser(user);
  }
  if (step === 3 && (selectedRole === "director" || selectedRole === "mentor")) {
    house.name = document.getElementById("house-name")?.value.trim() || house.name;
    house.address = document.getElementById("house-address")?.value.trim() || "";
    saveHouse(house);
  }
  if (step === 3 && selectedRole !== "director" && selectedRole !== "mentor") {
    saveOtherBattleLabelFromInput();
    if (selectedVices.includes("other") && !otherBattleLabel) {
      alert("Please specify your other battle before continuing.");
      return;
    }
  }
  onboardingNavigate(step);
}

function finishOnboarding() {
  const partner = document.getElementById("onboard-partner")?.value.trim() || "";
  const today = new Date().toISOString().split("T")[0];

  selectedVices.forEach((id) => {
    const vice = { tracking: true, startDate: today, relapses: [] };
    if (id === "other") {
      vice.label = otherBattleLabel || user.vices.other?.label || "";
    }
    user.vices[id] = vice;
  });

  user.accountabilityPartner = partner;
  if (isGraduate(house, user.name, user)) user.isGraduate = true;
  if (isActiveResident(house, user.name)) user.inProgram = true;
  user.onboardingComplete = true;
  user.loggedIn = true;
  saveUser(user);
  if (requiresStaffPin(user.role)) {
    persistHouse();
    persistCommunity();
    persistSiteConfig();
    persistApplications();
  }
  navigate(getDefaultViewForRole(), { replace: true });
}

function renderApp() {
  app.innerHTML = `
    <div class="mobile-header">
      <div class="logo">
        <div class="logo-icon">⚔</div>
        <div class="logo-text">Iron<span>Men</span></div>
      </div>
      <button class="menu-toggle" onclick="toggleSidebar()">☰</button>
    </div>
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="logo">
          <div class="logo-icon">⚔</div>
          <div class="logo-text">Iron<span>Men</span></div>
        </div>
        <nav class="nav-links">
          ${user.role === "director" ? `
            <div class="nav-section-label">Command Center</div>
            ${navItem("director-dash", "🏛️", "Director Dashboard")}
            ${navItem("applications", "📋", "Applications")}
            ${navItem("placement", "🔗", "Job Placements")}
          ` : isStaff() ? `
            <div class="nav-section-label">Staff</div>
            ${navItem("applications", "📋", "Applications")}
            ${navItem("placement", "🔗", "Job Placements")}
          ` : ""}
          ${renderCommunityNav()}
          ${renderFridayServiceNav()}
          ${renderHouseNav()}
          ${user.role !== "director" && user.role !== "mentor" ? `
            <div class="nav-section-label">Personal Growth</div>
            ${navItem("dashboard", "📊", "Dashboard")}
            ${navItem("streaks", "🔥", "Freedom Streaks")}
            ${navItem("checkin", "✅", "Daily Check-in")}
            ${navItem("devotional", "✝️", "Devotional")}
            ${navItem("goals", "🎯", "Goals")}
            ${navItem("resources", "📚", "Resources")}
            ${navItem("journal", "📝", "Journal")}
            ${navItem("accountability", "🤝", "Accountability")}
          ` : ""}
        </nav>
        <div class="sidebar-footer">
          <div class="user-badge">
            <div class="user-avatar">${user.name.charAt(0).toUpperCase()}</div>
            <div>
              <div class="user-name">${user.name}</div>
              <div class="user-since">${user.role === "director" ? "House Director" : user.role === "mentor" ? "Mentor" : user.role === "resident" ? "Resident" : "Member"} &bull; ${formatDate(user.joinedDate)}</div>
            </div>
          </div>
          <button class="btn btn-secondary btn-sm btn-block" onclick="logout()">Log Out</button>
          <button class="btn btn-ghost btn-sm btn-block" onclick="resetApp()">Reset Data</button>
        </div>
      </aside>
      <main class="main-content" id="main-content">
        ${renderCurrentView()}
      </main>
    </div>
    ${renderInstallBanner("pwa-install-banner pwa-install-banner-app")}
    ${renderSosButton()}
    <div id="modal-root"></div>
  `;
}

function navItem(view, icon, label) {
  return `<button class="nav-link ${currentView === view ? "active" : ""}" onclick="navigate('${view}')">
    <span class="icon">${icon}</span> ${label}
  </button>`;
}

function toggleSidebar() {
  document.getElementById("sidebar")?.classList.toggle("open");
}

function renderCurrentView() {
  if (currentView === "friday") return renderFridayService();
  if (currentView === "partner") return renderPartnerPage();
  if (currentView === "opportunities") return renderOpportunitiesPage();
  if (currentView === "director-dash") return renderDirectorDashboard();
  if (currentView === "applications") return renderApplicationPipeline();
  if (currentView === "placement") return renderPlacementPage();
  if (currentView === "apply") return renderApplyPage();
  if (currentView === "alumni" && user.role !== "director" && user.role !== "mentor" && user.role !== "resident") {
    return renderPublicAlumniPage();
  }

  const houseViews = ["house", "intake", "residents", "curriculum", "schedule", "training", "skills", "graduation", "alumni", "documents", "myprogram"];
  if (houseViews.includes(currentView)) {
    return renderHouseView();
  }

  const views = {
    dashboard: renderDashboard,
    streaks: renderStreaks,
    checkin: renderCheckin,
    devotional: renderDevotional,
    goals: renderGoals,
    resources: renderResources,
    journal: renderJournal,
    accountability: renderAccountability,
  };
  return (views[currentView] || (user.role === "director" || user.role === "mentor" ? renderHouseOverview : renderDashboard))();
}

function renderDashboard() {
  const activeVices = getActiveVices(user);
  const longest = getLongestStreak(user);
  const encouragement = ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)];
  const devotionalIdx = user.lastDevotionalDay % DEVOTIONALS.length;
  const devotional = DEVOTIONALS[devotionalIdx];
  const checkedIn = hasCheckedInToday(user);

  return `
    <div class="page-header">
      <h1>Welcome back, ${user.name}</h1>
      <p>${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</p>
    </div>

    <div class="encouragement-banner">
      <span class="icon">💪</span>
      <p>"${encouragement}"</p>
    </div>

    <div class="dashboard-grid">
      <div class="stat-card">
        <div class="stat-value">${longest}</div>
        <div class="stat-title">Longest Streak (days)</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${activeVices.length}</div>
        <div class="stat-title">Battles Tracked</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${getTotalCheckIns(user)}</div>
        <div class="stat-title">Total Check-ins</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${checkedIn ? "✓" : "—"}</div>
        <div class="stat-title">Today's Check-in</div>
      </div>
    </div>

    <div class="dashboard-row">
      <div class="card">
        <h3 style="margin-bottom:16px;font-size:1.2rem;">Today's Verse</h3>
        <div class="verse-text" style="font-size:1.1rem;">"${devotional.verse}"</div>
        <div class="verse-ref">${devotional.reference}</div>
        <button class="btn btn-secondary btn-sm" style="margin-top:16px;" onclick="navigate('devotional')">Read Full Devotional</button>
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px;font-size:1.2rem;">Quick Actions</h3>
        <div style="display:flex;flex-direction:column;gap:10px;">
          ${!checkedIn ? `<button class="btn btn-primary btn-block" onclick="navigate('checkin')">Complete Daily Check-in</button>` : `<p style="color:var(--success);font-weight:600;">✓ Check-in complete for today</p>`}
          <button class="btn btn-secondary btn-block" onclick="navigate('streaks')">View Freedom Streaks</button>
          <button class="btn btn-secondary btn-block" onclick="navigate('goals')">Review Your Goals</button>
          <button class="btn btn-secondary btn-block" onclick="navigate('opportunities')">Browse Jobs & Opportunities</button>
        </div>
      </div>
    </div>

    ${activeVices.length ? `
      <h3 style="margin-bottom:16px;font-size:1.2rem;">Your Streaks</h3>
      <div class="streak-grid">
        ${activeVices.map((v) => renderStreakCard(v)).join("")}
      </div>
    ` : `
      <div class="empty-state">
        <div class="icon">🛡️</div>
        <p>No vices being tracked yet. <button class="btn btn-secondary btn-sm" onclick="navigate('streaks')">Set up tracking</button></p>
      </div>
    `}
  `;
}

function renderStreakCard(viceDef) {
  const vice = user.vices[viceDef.id];
  const days = getStreak(vice);
  const milestone = days >= 90 ? "90-Day Warrior" : days >= 30 ? "30-Day Champion" : days >= 7 ? "One Week Strong" : null;

  return `
    <div class="streak-card" style="--accent: ${viceDef.color}">
      <div class="streak-header">
        <span class="icon">${viceDef.icon}</span>
        <h3>${getViceDisplayName(viceDef)}</h3>
      </div>
      <div class="streak-days">${days} <span>days clean</span></div>
      <div class="streak-since">Since ${formatDate(vice.startDate)}</div>
      ${milestone ? `<div class="milestone-badge">🏆 ${milestone}</div>` : ""}
      <div class="streak-actions">
        <button class="btn btn-danger btn-sm" onclick="logRelapse('${viceDef.id}')">Log Relapse</button>
      </div>
    </div>
  `;
}

function renderStreaks() {
  const activeVices = getActiveVices(user);
  const untracked = VICES.filter((v) => !user.vices[v.id]?.tracking);

  return `
    <div class="page-header">
      <h1>Freedom Streaks</h1>
      <p>Every clean day is a victory. Stay honest, stay strong.</p>
    </div>

    <div class="privacy-notice" style="margin-bottom:24px;">
      <span class="privacy-notice-icon">🔒</span>
      <p><strong>Confidential & protected.</strong> Your battle records are private and stored on your device only — they are never uploaded to the server.</p>
    </div>

    ${activeVices.length ? `
      <div class="streak-grid" style="margin-bottom:32px;">
        ${activeVices.map((v) => renderStreakCard(v)).join("")}
      </div>
    ` : `
      <div class="empty-state" style="margin-bottom:32px;">
        <div class="icon">🔥</div>
        <p>Start tracking your freedom journey today.</p>
      </div>
    `}

    ${untracked.length ? `
      <div class="card">
        <h3 style="margin-bottom:16px;">Add a Battle to Track</h3>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          ${untracked.map((v) => `
            <button class="btn btn-secondary" onclick="${v.id === "other" ? "startTrackingOther()" : `startTracking('${v.id}')`}">${v.icon} ${v.id === "other" ? "Other..." : v.name}</button>
          `).join("")}
        </div>
      </div>
    ` : ""}

    ${activeVices.some((v) => user.vices[v.id].relapses.length) ? `
      <div class="card" style="margin-top:24px;">
        <h3 style="margin-bottom:16px;">Relapse History</h3>
        ${activeVices.map((v) => {
          const relapses = user.vices[v.id].relapses;
          if (!relapses.length) return "";
          return relapses.slice(-3).map((r) => `
            <div class="journal-entry">
              <div class="journal-date">${getViceDisplayName(v)} — ${formatDate(r.date)}</div>
              <div class="journal-text">${r.note || "No note recorded."}</div>
            </div>
          `).join("");
        }).join("")}
      </div>
    ` : ""}
  `;
}

function startTracking(viceId) {
  const today = new Date().toISOString().split("T")[0];
  user.vices[viceId] = { tracking: true, startDate: today, relapses: [] };
  saveUser(user);
  render();
}

function startTrackingOther() {
  const label = prompt("Specify the battle you want to track:");
  if (!label?.trim()) return;

  const today = new Date().toISOString().split("T")[0];
  user.vices.other = { tracking: true, startDate: today, relapses: [], label: label.trim() };
  saveUser(user);
  render();
}

function logRelapse(viceId) {
  const note = prompt("Be honest with yourself and God. What happened? (Optional note)");
  if (note === null) return;

  const today = new Date().toISOString().split("T")[0];
  user.vices[viceId].relapses.push({ date: today, note: note || "" });
  user.vices[viceId].startDate = today;
  saveUser(user);
  render();
}

function renderCheckin() {
  const today = new Date().toISOString().split("T")[0];
  const existing = getTodayCheckIn(user);

  if (existing) {
    return `
      <div class="page-header">
        <h1>Daily Check-in</h1>
        <p>You've already checked in today. Well done, brother.</p>
      </div>
      <div class="card">
        <h3 style="margin-bottom:16px;">Today's Entry</h3>
        <div class="report-item"><span>Mood</span><span>${existing.mood}</span></div>
        <div class="report-item"><span>Stayed Clean</span><span>${existing.victory ? "Yes ✓" : "No — but tomorrow is new"}</span></div>
        ${existing.gratitude ? `<p style="margin-top:16px;color:var(--text-muted);"><strong>Grateful for:</strong> ${existing.gratitude}</p>` : ""}
        ${existing.reflection ? `<p style="margin-top:12px;color:var(--text-muted);"><strong>Reflection:</strong> ${existing.reflection}</p>` : ""}
      </div>
    `;
  }

  return `
    <div class="page-header">
      <h1>Daily Check-in</h1>
      <p>Honest reflection builds strong men. Take 2 minutes now.</p>
    </div>
    <div class="card">
      <form class="checkin-form" onsubmit="submitCheckin(event)">
        <div class="form-group">
          <label>How are you feeling today?</label>
          <div class="mood-selector">
            ${["Strong", "Steady", "Struggling", "Broken"].map((m) => `
              <button type="button" class="mood-btn ${selectedMood === m ? "selected" : ""}" onclick="selectMood('${m}')">${m}</button>
            `).join("")}
          </div>
        </div>

        <div class="form-group">
          <label>Did you stay clean from your tracked vices today?</label>
          <div class="victory-toggle">
            <button type="button" class="victory-btn yes ${selectedVictory === true ? "selected" : ""}" onclick="selectVictory(true)">Yes — Victory</button>
            <button type="button" class="victory-btn no ${selectedVictory === false ? "selected" : ""}" onclick="selectVictory(false)">No — I stumbled</button>
          </div>
        </div>

        <div class="form-group">
          <label>What are you grateful for today?</label>
          <input class="form-control" id="checkin-gratitude" type="text" placeholder="Family, health, a new day...">
        </div>

        <div class="form-group">
          <label>Brief reflection (optional)</label>
          <textarea class="form-control" id="checkin-reflection" placeholder="What did you learn today?"></textarea>
        </div>

        <button type="submit" class="btn btn-primary btn-block">Submit Check-in</button>
      </form>
    </div>
  `;
}

function selectMood(mood) {
  selectedMood = mood;
  render();
}

function selectVictory(victory) {
  selectedVictory = victory;
  render();
}

function submitCheckin(e) {
  e.preventDefault();
  if (!selectedMood) {
    alert("Please select how you're feeling.");
    return;
  }
  if (selectedVictory === null) {
    alert("Please indicate whether you stayed clean today.");
    return;
  }

  const today = new Date().toISOString().split("T")[0];
  user.checkIns.push({
    date: today,
    mood: selectedMood,
    victory: selectedVictory,
    gratitude: document.getElementById("checkin-gratitude")?.value.trim() || "",
    reflection: document.getElementById("checkin-reflection")?.value.trim() || "",
  });

  if (!selectedVictory) {
    getActiveVices(user).forEach((v) => {
      user.vices[v.id].relapses.push({ date: today, note: "Logged during daily check-in" });
      user.vices[v.id].startDate = today;
    });
  }

  saveUser(user);
  selectedMood = "";
  selectedVictory = null;
  navigate("dashboard");
}

function renderDevotional() {
  const idx = user.lastDevotionalDay % DEVOTIONALS.length;
  const d = DEVOTIONALS[idx];
  const completed = user.completedDevotionals.includes(idx);

  return `
    <div class="page-header">
      <h1>Daily Devotional</h1>
      <p>Day ${idx + 1} of ${DEVOTIONALS.length}</p>
    </div>
    <div class="card devotional-card">
      <div class="verse-block">
        <div class="verse-text">"${d.verse}"</div>
        <div class="verse-ref">— ${d.reference}</div>
      </div>
      <div class="reflection-block">
        <h3>Reflection</h3>
        <p>${d.reflection}</p>
      </div>
      <div class="challenge-block">
        <h3>Today's Challenge</h3>
        <p>${d.challenge}</p>
      </div>
      ${!completed ? `
        <button class="btn btn-primary" onclick="completeDevotional(${idx})">Mark as Complete</button>
      ` : `
        <p style="color:var(--success);font-weight:600;">✓ Completed today</p>
      `}
      <button class="btn btn-secondary btn-sm" style="margin-left:12px;" onclick="nextDevotional()">Next Devotional</button>
    </div>
  `;
}

function completeDevotional(idx) {
  if (!user.completedDevotionals.includes(idx)) {
    user.completedDevotionals.push(idx);
  }
  saveUser(user);
  render();
}

function nextDevotional() {
  user.lastDevotionalDay = (user.lastDevotionalDay + 1) % DEVOTIONALS.length;
  saveUser(user);
  render();
}

function renderGoals() {
  return `
    <div class="page-header">
      <h1>Your Goals</h1>
      <p>Responsible men set targets and keep them.</p>
    </div>
    <div class="goals-list">
      ${user.goals.map((g, i) => `
        <div class="goal-item ${g.completed ? "completed" : ""}">
          <div class="goal-check ${g.completed ? "checked" : ""}" onclick="toggleGoal(${i})">${g.completed ? "✓" : ""}</div>
          <div class="goal-info">
            <div class="goal-label">${g.label}</div>
            <div class="goal-category">${g.category}</div>
          </div>
          <div class="goal-streak">${g.streak > 0 ? `${g.streak} day streak` : ""}</div>
        </div>
      `).join("")}
    </div>
    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:16px;">Add a Custom Goal</h3>
      <div class="form-group">
        <input class="form-control" id="new-goal" type="text" placeholder="e.g. Read one book per month">
      </div>
      <button class="btn btn-secondary" onclick="addGoal()">Add Goal</button>
    </div>
  `;
}

function toggleGoal(index) {
  const goal = user.goals[index];
  const today = new Date().toISOString().split("T")[0];
  const wasCompleted = goal.completed;

  goal.completed = !goal.completed;

  if (goal.completed && !wasCompleted) {
    goal.streak = (goal.streak || 0) + 1;
    goal.lastCompleted = today;
  } else if (!goal.completed) {
    goal.streak = 0;
  }

  saveUser(user);
  render();
}

function addGoal() {
  const label = document.getElementById("new-goal")?.value.trim();
  if (!label) return;

  user.goals.push({ id: `custom-${Date.now()}`, label, category: "Personal", completed: false, streak: 0 });
  saveUser(user);
  render();
}

function renderResources() {
  return `
    <div class="page-header">
      <h1>Resources</h1>
      <p>Practical wisdom for the battles you face.</p>
    </div>
    <div class="resources-grid">
      ${RESOURCES.map((r) => `
        <div class="resource-card">
          <span class="resource-category">${r.category}</span>
          <h3>${r.title}</h3>
          <p>${r.summary}</p>
          <ul class="tips-list">
            ${r.tips.map((t) => `<li>${t}</li>`).join("")}
          </ul>
        </div>
      `).join("")}
    </div>
  `;
}

function renderJournal() {
  return `
    <div class="page-header">
      <h1>Journal</h1>
      <p>Write your thoughts. Process your growth.</p>
    </div>
    <div class="card">
      <div class="form-group">
        <label>New Entry</label>
        <textarea class="form-control" id="journal-text" placeholder="What's on your heart today?"></textarea>
      </div>
      <button class="btn btn-primary" onclick="addJournalEntry()">Save Entry</button>
    </div>
    ${user.journal.length ? `
      <div class="journal-entries">
        ${user.journal.slice().reverse().map((entry) => `
          <div class="journal-entry">
            <div class="journal-date">${formatDate(entry.date)}</div>
            <div class="journal-text">${entry.text}</div>
          </div>
        `).join("")}
      </div>
    ` : `
      <div class="empty-state">
        <div class="icon">📝</div>
        <p>Your journal is empty. Start writing your story.</p>
      </div>
    `}
  `;
}

function addJournalEntry() {
  const text = document.getElementById("journal-text")?.value.trim();
  if (!text) return;

  const today = new Date().toISOString().split("T")[0];
  user.journal.push({ date: today, text });
  saveUser(user);
  render();
}

function renderAccountability() {
  const recentCheckIns = user.checkIns.slice(-7);
  const victories = recentCheckIns.filter((c) => c.victory).length;
  const total = recentCheckIns.length;

  return `
    <div class="page-header">
      <h1>Accountability</h1>
      <p>Iron sharpens iron. You are not alone in this fight.</p>
    </div>

    <div class="card partner-card">
      <div class="icon">🤝</div>
      ${user.accountabilityPartner ? `
        <h3>Your Partner: ${user.accountabilityPartner}</h3>
        <p style="color:var(--text-muted);margin-top:8px;">Share your weekly report with them. Honesty builds trust.</p>
      ` : `
        <h3>No partner set yet</h3>
        <p style="color:var(--text-muted);margin-top:8px;">Every man needs someone who asks the hard questions.</p>
      `}
      <div class="form-group" style="margin-top:20px;text-align:left;">
        <input class="form-control" id="partner-name" type="text" placeholder="Partner's name" value="${user.accountabilityPartner}">
      </div>
      <button class="btn btn-secondary" onclick="savePartner()">Save Partner</button>
    </div>

    <div class="card" style="margin-top:24px;">
      <h3 style="margin-bottom:16px;">Your Weekly Report</h3>
      <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:16px;">Share this summary with your accountability partner.</p>
      <div class="weekly-report">
        <div class="report-item"><span>Check-ins this week</span><span>${total}</span></div>
        <div class="report-item"><span>Victory days</span><span>${victories} / ${total || "—"}</span></div>
        <div class="report-item"><span>Longest streak</span><span>${getLongestStreak(user)} days</span></div>
        <div class="report-item"><span>Battles tracked</span><span>${getActiveVices(user).map((v) => getViceDisplayName(v)).join(", ") || "None"}</span></div>
        <div class="report-item"><span>Goals completed today</span><span>${user.goals.filter((g) => g.completed).length} / ${user.goals.length}</span></div>
      </div>
      <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="copyReport()">Copy Report</button>
        <button class="btn btn-secondary btn-sm" onclick="shareReportWhatsApp()">Share via WhatsApp</button>
        <button class="btn btn-secondary btn-sm" onclick="shareReportEmail()">Share via Email</button>
      </div>
    </div>
  `;
}

function buildWeeklyReport() {
  const recentCheckIns = user.checkIns.slice(-7);
  const victories = recentCheckIns.filter((c) => c.victory).length;
  return `IronMen Weekly Report — ${user.name}
Check-ins: ${recentCheckIns.length}
Victory days: ${victories}/${recentCheckIns.length || 0}
Longest streak: ${getLongestStreak(user)} days
Battles: ${getActiveVices(user).map((v) => getViceDisplayName(v)).join(", ") || "None"}
Partner: ${user.accountabilityPartner || "Not set"}`;
}

function savePartner() {
  const name = document.getElementById("partner-name")?.value.trim() || "";
  user.accountabilityPartner = name;
  saveUser(user);
  render();
}

function copyReport() {
  const report = buildWeeklyReport();
  navigator.clipboard.writeText(report).then(() => alert("Report copied! Share it with your accountability partner.")).catch(() => alert(report));
}

function shareReportWhatsApp() {
  const report = buildWeeklyReport();
  const wa = siteConfig.contact.whatsapp?.replace(/\D/g, "");
  if (!wa) {
    alert("WhatsApp contact not configured. Copy the report instead.");
    return;
  }
  window.open(`https://wa.me/${wa}?text=${encodeURIComponent(report)}`, "_blank");
}

function shareReportEmail() {
  const report = buildWeeklyReport();
  window.location.href = `mailto:?subject=${encodeURIComponent(`IronMen Weekly Report — ${user.name}`)}&body=${encodeURIComponent(report)}`;
}

function resetApp() {
  if (confirm("This will erase all your data including house records. Are you sure?")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(HOUSE_STORAGE_KEY);
    localStorage.removeItem(COMMUNITY_STORAGE_KEY);
    localStorage.removeItem("ironmen_applications");
    localStorage.removeItem("ironmen_site_config");
    clearStaffToken();
    user = getDefaultUser();
    house = getDefaultHouse();
    community = getDefaultCommunity();
    siteConfig = getDefaultSiteConfig();
    applicationsData = loadApplicationsLocal();
    onboardingStep = 0;
    selectedVices = [];
    selectedRole = "";
    selectedResidentId = null;
    houseFormMode = null;
    history.replaceState({ view: "landing" }, "", getHistoryUrl("landing"));
    render();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  initPwa();
  await initApiSync();
  initNavigation();
  render();
  initNotifications();
});