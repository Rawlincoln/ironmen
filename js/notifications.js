function initNotifications() {
  if (!("Notification" in window) || !user.loggedIn) return;
  if (Notification.permission === "default") {
    setTimeout(() => {
      if (confirm("Enable reminders for daily check-in and Friday service?")) {
        Notification.requestPermission();
      }
    }, 3000);
  }
  scheduleLocalReminders();
}

function scheduleLocalReminders() {
  if (!user.loggedIn || Notification.permission !== "granted") return;
  const last = localStorage.getItem("ironmen_last_notify_day");
  const today = new Date().toISOString().split("T")[0];
  if (last === today) return;
  if (!hasCheckedInToday(user) && new Date().getHours() >= 18) {
    new Notification("IronMen — Daily Check-in", { body: "Brother, take 2 minutes to check in honestly today." });
    localStorage.setItem("ironmen_last_notify_day", today);
  }
  const svc = house.fridayService || getDefaultFridayService();
  const next = getNextFriday(new Date(), svc.serviceTime);
  const hoursUntil = (next - new Date()) / (1000 * 60 * 60);
  if (next.getDay() === 5 && hoursUntil > 0 && hoursUntil <= 2) {
    new Notification("IronMen — Friday Service", { body: `Brotherhood service in ${Math.round(hoursUntil * 60)} minutes.` });
  }
}

