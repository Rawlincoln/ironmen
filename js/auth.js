async function verifyStaffPin(pin, role) {
  if (apiOnline) {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin, role }),
      });
      if (res.ok) {
        const data = await res.json();
        staffToken = data.token;
        localStorage.setItem("ironmen_staff_token", staffToken);
        return true;
      }
    } catch {}
  }
  const expected = role === "mentor" ? siteConfig.mentorPin : siteConfig.directorPin;
  if (pin === expected) {
    staffToken = "local-" + role;
    localStorage.setItem("ironmen_staff_token", staffToken);
    return true;
  }
  return false;
}

function clearStaffToken() {
  staffToken = "";
  localStorage.removeItem("ironmen_staff_token");
}

function requiresStaffPin(role) {
  return role === "director" || role === "mentor";
}

function renderStaffPinGate(role, onSuccessCallback) {
  return `
    <div class="form-group" style="margin-top:16px;">
      <label>${role === "director" ? "House Director" : "Mentor"} access PIN *</label>
      <input class="form-control" id="staff-pin" type="password" placeholder="Enter staff PIN" autocomplete="off">
      <p style="color:var(--text-muted);font-size:0.8rem;margin-top:6px;">Staff roles require a PIN. Default: director <code>ironmen</code>, mentor <code>mentor</code> — change in Director Settings.</p>
    </div>
  `;
}

async function validateStaffPinForOnboarding(role) {
  const pin = document.getElementById("staff-pin")?.value || "";
  if (!pin) {
    alert("Staff PIN is required for Director and Mentor roles.");
    return false;
  }
  const ok = await verifyStaffPin(pin, role);
  if (!ok) {
    alert("Invalid PIN. Contact the House Director if you need access.");
    return false;
  }
  return true;
}