const IN_APP_DOCUMENTS = [
  { file: "documents/01_Intake_Criteria_and_Requirements.docx", title: "Intake Criteria & Requirements", desc: "Who qualifies for the 90-day program" },
  { file: "documents/02_House_Rules_Handbook.docx", title: "House Rules Handbook", desc: "Daily schedule, rules, Friday service policy" },
  { file: "documents/03_Resident_Intake_Form.docx", title: "Resident Intake Form", desc: "Full application and medical sections" },
  { file: "documents/04_Mentor_Guide.docx", title: "Mentor Guide", desc: "How mentors walk with residents" },
  { file: "documents/05_Operating_Budget.xlsx", title: "Operating Budget", desc: "Monthly house costs (KES)" },
  { file: "documents/06_Friday_Brotherhood_Service_Guide.docx", title: "Friday Service Guide", desc: "Order of service and Zoom setup" },
];

function renderDocumentsLibrary() {
  return `
    <div class="page-header">
      <h1>Program Documents</h1>
      <p>Download official IronMen operational documents.</p>
    </div>
    <div class="resources-grid">
      ${IN_APP_DOCUMENTS.map((d) => `
        <a class="resource-card document-link-card" href="${d.file}" download>
          <h3>${d.title}</h3>
          <span class="resource-category">Download</span>
          <p style="margin-top:12px;color:var(--text-muted);font-size:0.9rem;">${d.desc}</p>
        </a>
      `).join("")}
    </div>
    ${isStaff() ? `<p style="margin-top:24px;color:var(--text-muted);font-size:0.85rem;">Regenerate documents: <code>py documents/generate_documents.py</code></p>` : ""}
  `;
}

function renderPublicAlumniPage() {
  const alumni = getGraduatedCohorts(house);
  return `
    <div class="page-header">
      <h1>IronMen Alumni</h1>
      <p>Brothers who completed the 90-day program and launched into work and life.</p>
    </div>
    ${alumni.length ? alumni.slice().reverse().map((c) => `
      <div class="card" style="margin-bottom:20px;">
        <h3>${c.name}</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;">Graduated ${c.graduationDate ? formatDate(c.graduationDate) : ""}</p>
        <div class="resident-grid" style="margin-top:16px;">
          ${c.residents.map((r) => `
            <div class="resident-card">
              <div class="resident-name">${r.name.charAt(0)}. — IronMen Graduate</div>
              ${r.placement ? `<div class="placement-badge" style="margin-top:8px;font-size:0.8rem;">Placed: ${r.placement.organization}</div>` : `<span style="color:var(--text-muted);font-size:0.8rem;">Brotherhood alumni</span>`}
            </div>
          `).join("")}
        </div>
      </div>
    `).join("") : `<div class="empty-state"><div class="icon">🏆</div><p>Our first graduating cohort will be celebrated here.</p></div>`}
  `;
}