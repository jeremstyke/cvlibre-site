/* 14 nov 2026 (Jeremy): "CVLibre Emploi" app, only for the job pages.
   Outside the app: a discreet install card. No notifications for now (Notifpush sends ads, not jobs). */
(function () {
  var lg = (document.documentElement.lang || "fr").slice(0, 2);
  var T = {
    fr: { t: "<strong>Appli CVLibre Emploi</strong> : les offres en un clic depuis votre écran d'accueil.", b: "Installer", x: "Fermer",
      ios: "Sur iPhone : appuyez sur <strong>Partager</strong> <span aria-hidden=\"true\">⬆️</span> en bas de l'écran, puis <strong>Sur l'écran d'accueil</strong>.",
      and: "Ouvrez le menu <strong>⋮</strong> du navigateur, puis <strong>Ajouter à l'écran d'accueil</strong> (ou <strong>Installer l'appli</strong>)." },
    en: { t: "<strong>CVLibre Jobs app</strong>: jobs one tap from your home screen.", b: "Install", x: "Close",
      ios: "On iPhone: tap <strong>Share</strong> <span aria-hidden=\"true\">⬆️</span> at the bottom of the screen, then <strong>Add to Home Screen</strong>.",
      and: "Open the browser menu <strong>⋮</strong>, then <strong>Add to Home screen</strong> (or <strong>Install app</strong>)." },
    de: { t: "<strong>App CVLibre Jobs</strong>: Stellenangebote mit einem Tippen vom Startbildschirm.", b: "Installieren", x: "Schließen",
      ios: "Auf dem iPhone: Tippen Sie unten auf <strong>Teilen</strong> <span aria-hidden=\"true\">⬆️</span>, dann auf <strong>Zum Home-Bildschirm</strong>.",
      and: "Öffnen Sie das Browsermenü <strong>⋮</strong>, dann <strong>Zum Startbildschirm hinzufügen</strong> (oder <strong>App installieren</strong>)." }
  }[lg] || null;
  if (!T) return;
  var ua = navigator.userAgent || "";
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var mobile = ios || /Android/.test(ua);
  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  var lead = document.querySelector("main .lead");
  if (!lead) return;
  function track(ev) { try { if (window.CVSTATS && window.CVSTATS.track) window.CVSTATS.track(ev); } catch (e) {} }
  var st = document.createElement("style");
  st.textContent = ".cvapp{display:flex;align-items:center;gap:12px;margin:0 0 16px;padding:12px 14px;border:1px solid #d9e2f5;border-radius:12px;background:#f5f8ff;font-size:.95rem}" +
    ".cvapp img{width:40px;height:40px;border-radius:10px;flex:none}.cvapp p{margin:0;flex:1;line-height:1.35}.cvapp .btn{flex:none;padding:8px 14px}" +
    ".cvapp-x{flex:none;background:none;border:0;font-size:1.3rem;line-height:1;color:#667;cursor:pointer;padding:4px}" +
    ".cvapp-h{margin:-8px 0 16px;padding:10px 14px;border-radius:10px;background:#fff8e6;font-size:.92rem}";
  document.head.appendChild(st);

  if (standalone) { track("app_open"); return; }

  if (!mobile) return;
  try { if (localStorage.getItem("cvl_app_x")) return; } catch (e) {}
  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
  var card = document.createElement("div");
  card.className = "cvapp";
  card.innerHTML = '<img src="/assets/app-192.png" alt=""><p>' + T.t + '</p><button type="button" class="btn">' + T.b + '</button><button type="button" class="cvapp-x" aria-label="' + T.x + '">×</button>';
  lead.insertAdjacentElement("afterend", card);
  var help = null;
  card.querySelector(".btn").addEventListener("click", function () {
    track("app_install_click");
    if (deferred) {
      deferred.prompt();
      deferred.userChoice.then(function (c) { if (c && c.outcome === "accepted") { track("app_installed"); card.remove(); if (help) help.remove(); } });
      deferred = null; return;
    }
    if (!help) { help = document.createElement("p"); help.className = "cvapp-h"; help.innerHTML = ios ? T.ios : T.and; card.insertAdjacentElement("afterend", help); }
  });
  card.querySelector(".cvapp-x").addEventListener("click", function () {
    try { localStorage.setItem("cvl_app_x", "1"); } catch (e) {}
    card.remove(); if (help) help.remove();
  });
  window.addEventListener("appinstalled", function () { track("app_installed"); });
})();
