const SOS_VERSES = [
  { ref: "1 Corinthians 10:13", text: "No temptation has overtaken you except what is common to mankind. And God is faithful." },
  { ref: "James 5:16", text: "Confess your sins to each other and pray for each other so that you may be healed." },
  { ref: "Psalm 51:10", text: "Create in me a pure heart, O God, and renew a steadfast spirit within me." },
];

function renderSosButton() {
  if (!user.loggedIn || !user.onboardingComplete) return "";
  return `<button class="sos-fab" onclick="openSosModal()" title="I need help now">SOS</button>`;
}

function openSosModal() {
  const verse = SOS_VERSES[Math.floor(Math.random() * SOS_VERSES.length)];
  const c = siteConfig.contact;
  const wa = c.whatsapp ? `https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent("IronMen SOS — I need accountability support right now.")}` : "#";
  const tel = c.phone ? `tel:${c.phone.replace(/\s/g, "")}` : "#";
  const partner = user.accountabilityPartner || "your accountability partner";
  const root = document.getElementById("modal-root");
  root.innerHTML = `
    <div class="modal-overlay" onclick="closeModal(event)">
      <div class="modal sos-modal" onclick="event.stopPropagation()">
        <h2>You are not alone</h2>
        <p style="color:var(--text-muted);margin-bottom:16px;">Take a breath. This moment will pass. Reach out before you isolate.</p>
        <div class="verse-block" style="margin-bottom:20px;">
          <div class="verse-text">"${verse.text}"</div>
          <div class="verse-ref">— ${verse.ref}</div>
        </div>
        <div class="sos-actions">
          <a class="btn btn-primary btn-block" href="${wa}" target="_blank" rel="noopener">WhatsApp Director</a>
          <a class="btn btn-secondary btn-block" href="${tel}">Call ${c.phone || "Director"}</a>
          <button class="btn btn-secondary btn-block" onclick="logSosRelapse();closeModal();">Log struggle honestly</button>
          <button class="btn btn-ghost btn-block" onclick="closeModal()">I'm steady — close</button>
        </div>
        <p style="font-size:0.8rem;color:var(--text-muted);margin-top:16px;">Accountability partner: <strong>${partner}</strong></p>
      </div>
    </div>
  `;
}

function logSosRelapse() {
  navigate("checkin");
  selectedMood = "Struggling";
  selectedVictory = false;
  render();
}