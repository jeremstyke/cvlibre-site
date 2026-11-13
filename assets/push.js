/* 14 nov 2026 (Jeremy): Notifpush (Adrenalead) only asks for notifications later:
   after a CV or letter download (print), or from the 3rd page viewed. Already subscribed: loads right away. */
(function () {
  // 14 nov 2026 (Jeremy): Notifpush on pause. Set PAUSED to false to turn it back on (nothing else to change).
  var PAUSED = true;
  if (PAUSED) return;
  if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
  var done = false;
  function load() {
    if (done) return; done = true;
    window._nAdzq = window._nAdzq || [];
    window._nAdzq.push(["setIds", "62e1995e0e7de2e0"]);
    var t = document.createElement("script");
    t.async = true; t.src = "https://notifpush.com/scripts/nadz-sdk.js";
    document.head.appendChild(t);
  }
  window.cvlPush = load; // used by assets/app.js after the user turns notifications on in the jobs app
  var p = Notification.permission;
  if (p === "granted") return load();
  // in the installed jobs app, the request comes from the "Get new jobs" button (assets/app.js)
  if ((window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true) return;
  if (p === "denied") return;
  var n = 0;
  try { n = (parseInt(localStorage.getItem("cvl_pv") || "0", 10) || 0) + 1; localStorage.setItem("cvl_pv", String(n)); } catch (e) {}
  if (n >= 3) return setTimeout(load, 4000);
  window.addEventListener("afterprint", function () { setTimeout(load, 1500); });
})();
