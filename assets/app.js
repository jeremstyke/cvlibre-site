/* 14 nov 2026 (Jeremy): "Jobs CVLibre" app, only for the job pages.
   Outside the app: a discreet install card. No notifications for now (Notifpush sends ads, not jobs). */
(function () {
  var lg = (document.documentElement.lang || "fr").slice(0, 2);
  var T = {
    fr: { t: "<strong>Appli Jobs CVLibre</strong> : les offres en un clic depuis votre écran d'accueil.", b: "Installer", x: "Fermer",
      ios: "Sur iPhone : appuyez sur <strong>Partager</strong> <span aria-hidden=\"true\">⬆️</span> en bas de l'écran, puis <strong>Sur l'écran d'accueil</strong>.",
      and: "Ouvrez le menu <strong>⋮</strong> du navigateur, puis <strong>Ajouter à l'écran d'accueil</strong> (ou <strong>Installer l'appli</strong>)." },
    en: { t: "<strong>Jobs CVLibre app</strong>: jobs one tap from your home screen.", b: "Install", x: "Close",
      ios: "On iPhone: tap <strong>Share</strong> <span aria-hidden=\"true\">⬆️</span> at the bottom of the screen, then <strong>Add to Home Screen</strong>.",
      and: "Open the browser menu <strong>⋮</strong>, then <strong>Add to Home screen</strong> (or <strong>Install app</strong>)." },
    de: { t: "<strong>App Jobs CVLibre</strong>: Stellenangebote mit einem Tippen vom Startbildschirm.", b: "Installieren", x: "Schließen",
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
  function track(ev) { try { if (window.CVSTAT) window.CVSTAT(ev); } catch (e) {} }
  var st = document.createElement("style");
  st.textContent = ".cvapp{display:flex;align-items:center;gap:12px;margin:0 0 16px;padding:12px 14px;border:1px solid #d9e2f5;border-radius:12px;background:#f5f8ff;font-size:.95rem}" +
    ".cvapp img{width:40px;height:40px;border-radius:10px;flex:none}.cvapp p{margin:0;flex:1;line-height:1.35}.cvapp .btn{flex:none;padding:8px 14px}" +
    ".cvapp-x{flex:none;background:none;border:0;font-size:1.3rem;line-height:1;color:#667;cursor:pointer;padding:4px}" +
    ".cvapp-h{margin:-8px 0 16px;padding:10px 14px;border-radius:10px;background:#fff8e6;font-size:.92rem}";
  document.head.appendChild(st);

  if (standalone) {
    track("app_open");
    // only the job pages live in the app: every other link opens in the normal browser
    var scope = location.pathname.replace(/[^/]*$/, "");
    var fix = function (a) {
      try {
        var u = new URL(a.getAttribute("href"), location.href);
        if (u.origin !== location.origin || u.pathname.indexOf(scope) !== 0) { a.target = "_blank"; a.rel = "noopener"; }
      } catch (e) {}
    };
    document.addEventListener("click", function (e) { var a = e.target.closest && e.target.closest("a[href]"); if (a) fix(a); }, true);
    return;
  }

  if (!mobile) return;
  try { if (localStorage.getItem("cvl_app_x")) return; } catch (e) {}
  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; });
  var card = document.createElement("div");
  card.className = "cvapp";
  card.innerHTML = '<img src="/assets/app-192.png?v=2" alt=""><p>' + T.t + '</p><button type="button" class="btn">' + T.b + '</button><button type="button" class="cvapp-x" aria-label="' + T.x + '">×</button>';
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

/* 14 nov 2026 (Jeremy): job alerts. After a search, "get the new jobs every morning" button.
   Our own notifications (not Adrenalead), sent by the CVLibre server, deleted with the alert. */
(function () {
  var ALERTS_ON = true; // turned on once the job_alerts table exists in Supabase (tools/sql/job_alerts.sql)
  if (!ALERTS_ON) return;
  var form = document.getElementById("jb-form"), msg = document.getElementById("jb-msg"), list = document.getElementById("jb-list");
  if (!form || !msg || !list) return;
  var API = "https://cvlibre-ai-production.up.railway.app/alerts/";
  var path = location.pathname.replace(/[^/]*$/, "");
  var seg = path.split("/")[1] || "";
  var lang = seg === "de" ? "de" : ["en", "us", "ca", "au", "nz"].indexOf(seg) > -1 ? "en" : "fr";
  var cc = { us: "US", ca: "CA", au: "AU", nz: "NZ" }[seg] || "";
  var T = {
    fr: { ask: function (q, v) { return "🔔 Recevoir chaque matin les nouvelles offres" + (q ? " « " + q + " »" : "") + (v ? " autour de " + v : "") + "."; }, b: "Créer l'alerte", on: "✅ Alerte active : vous recevrez les nouvelles offres chaque matin.", del: "Supprimer", mine: "Mes alertes", wait: "Activation...",
      ios: "Sur iPhone, les alertes emploi marchent dans l'appli : appuyez sur <strong>Partager</strong> ⬆️ puis <strong>Sur l'écran d'accueil</strong>, ouvrez <strong>Jobs CVLibre</strong> et créez l'alerte.",
      no: "Notifications refusées : activez-les dans les réglages du navigateur pour recevoir les alertes.", err: "L'alerte n'a pas pu être créée. Réessayez plus tard.", many: "Vous avez déjà 5 alertes. Supprimez-en une pour en créer une autre." },
    en: { ask: function (q, v) { return "🔔 Get new" + (q ? " “" + q + "”" : "") + " jobs" + (v ? " near " + v : "") + " every morning."; }, b: "Create alert", on: "✅ Alert on: you will get the new jobs every morning.", del: "Delete", mine: "My alerts", wait: "Turning on...",
      ios: "On iPhone, job alerts work in the app: tap <strong>Share</strong> ⬆️ then <strong>Add to Home Screen</strong>, open <strong>Jobs CVLibre</strong> and create the alert.",
      no: "Notifications are blocked: allow them in your browser settings to get alerts.", err: "The alert could not be created. Please try again later.", many: "You already have 5 alerts. Delete one to create another." },
    de: { ask: function (q, v) { return "🔔 Jeden Morgen neue Stellenangebote" + (q ? " „" + q + "“" : "") + (v ? " in " + v : "") + " erhalten."; }, b: "Alarm erstellen", on: "✅ Alarm aktiv: Sie erhalten jeden Morgen die neuen Angebote.", del: "Löschen", mine: "Meine Alarme", wait: "Wird aktiviert...",
      ios: "Auf dem iPhone funktionieren Job-Alarme in der App: Tippen Sie auf <strong>Teilen</strong> ⬆️, dann <strong>Zum Home-Bildschirm</strong>, öffnen Sie <strong>Jobs CVLibre</strong> und erstellen Sie den Alarm.",
      no: "Benachrichtigungen blockiert: Erlauben Sie sie in den Browsereinstellungen, um Alarme zu erhalten.", err: "Der Alarm konnte nicht erstellt werden. Bitte später erneut versuchen.", many: "Sie haben bereits 5 Alarme. Löschen Sie einen, um einen neuen zu erstellen." }
  }[lang];
  var ua = navigator.userAgent || "";
  var ios = /iPhone|iPad|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var standalone = (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
  var canPush = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (!canPush && !(ios && !standalone)) return;
  function track(ev, x) { try { if (window.CVSTAT) window.CVSTAT(ev, x); } catch (e) {} }
  function load() { try { return JSON.parse(localStorage.getItem("cvl_alerts") || "[]") || []; } catch (e) { return []; } }
  function save(l) { try { localStorage.setItem("cvl_alerts", JSON.stringify(l)); } catch (e) {} }
  var k = function (s) { return [s.q, s.ville, s.contrat].join("|").toLowerCase(); };
  var st = document.createElement("style");
  st.textContent = ".cval{margin:0 0 14px;padding:12px 14px;border:1px solid #d9e2f5;border-radius:12px;background:#f5f8ff;font-size:.95rem}.cval p{margin:0 0 8px}.cval .btn{padding:8px 14px}.cval .cval-h{margin:8px 0 0;padding:8px 10px;border-radius:8px;background:#fff8e6}.cval-l{margin:8px 0 0;padding:0;list-style:none;font-size:.9rem}.cval-l li{display:flex;justify-content:space-between;gap:8px;padding:4px 0;border-top:1px solid #e3e9f6}.cval-l button{background:none;border:0;color:#2454e0;cursor:pointer;padding:0 4px}";
  document.head.appendChild(st);
  var box = document.createElement("div"); box.className = "cval"; box.hidden = true;
  msg.insertAdjacentElement("afterend", box);
  var g = function (id) { var e = document.getElementById(id); return e ? e.value.trim() : ""; };
  var read = function () { return { q: g("jb-q"), ville: g("jb-ville"), contrat: g("jb-contrat") }; };
  // the jobs script may already have run the pre-filled search before this file loads
  var curS = (g("jb-q") || g("jb-ville")) ? read() : null;
  form.addEventListener("submit", function () { curS = read(); box.hidden = true; }, true);
  new MutationObserver(function () { if (curS && list.querySelector(".jb-card")) render(); }).observe(msg, { childList: true, characterData: true, subtree: true });
  if (curS && list.querySelector(".jb-card")) setTimeout(render, 0);
  function render() {
    if (!curS || (!curS.q && !curS.ville)) { box.hidden = true; return; }
    var mine = load(), has = mine.filter(function (a) { return k(a) === k(curS); })[0];
    box.textContent = ""; box.hidden = false;
    var p = document.createElement("p");
    if (has) {
      p.textContent = T.on; box.appendChild(p);
    } else {
      p.textContent = T.ask(curS.q, curS.ville); box.appendChild(p);
      var b = document.createElement("button"); b.type = "button"; b.className = "btn"; b.textContent = T.b; box.appendChild(b);
      b.addEventListener("click", function () { create(b); });
    }
    if (mine.length) {
      var ul = document.createElement("ul"); ul.className = "cval-l";
      var h = document.createElement("li"); h.innerHTML = "<strong></strong>"; h.firstChild.textContent = T.mine; ul.appendChild(h);
      mine.forEach(function (a) {
        var li = document.createElement("li"), sp = document.createElement("span"), x = document.createElement("button");
        sp.textContent = [a.q, a.ville].filter(Boolean).join(" · "); x.type = "button"; x.textContent = T.del;
        x.addEventListener("click", function () { remove(a); });
        li.appendChild(sp); li.appendChild(x); ul.appendChild(li);
      });
      box.appendChild(ul);
    }
  }
  function note(html) { var n = box.querySelector(".cval-h"); if (!n) { n = document.createElement("p"); n.className = "cval-h"; box.appendChild(n); } n.innerHTML = html; }
  function remove(a) {
    fetch(API + "del", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: a.id, tok: a.tok }) }).catch(function () {});
    save(load().filter(function (x) { return x.id !== a.id; })); track("alert_del"); render();
  }
  function ready(reg) {
    return new Promise(function (res) {
      if (reg.active) return res(reg);
      var w = reg.installing || reg.waiting; if (!w) return res(reg);
      w.addEventListener("statechange", function () { if (w.state === "activated") res(reg); });
    });
  }
  function create(b) {
    track("alert_click");
    if (ios && !standalone) { note(T.ios); return; }
    var s = curS; b.disabled = true; b.textContent = T.wait;
    var once = false;
    var done = function (perm) {
      if (once) return; once = true;
      if (perm !== "granted") { b.disabled = false; b.textContent = T.b; note(T.no); return; }
      Promise.all([navigator.serviceWorker.register(path + "sw.js", { scope: path }).then(ready), fetch(API + "key", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }).then(function (r) { return r.json(); })])
        .then(function (r) {
          var reg = r[0], key = r[1] && r[1].key; if (!key) throw new Error("key");
          var raw = atob(key.replace(/-/g, "+").replace(/_/g, "/")), arr = new Uint8Array(raw.length);
          for (var i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
          return reg.pushManager.getSubscription().then(function (old) { return old || reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: arr }); });
        })
        .then(function (sub) {
          return fetch(API + "add", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ sub: sub.toJSON(), q: s.q, ville: s.ville, contrat: s.contrat, lang: lang, cc: cc }) }).then(function (r) { return r.json(); });
        })
        .then(function (j) {
          if (!j || !j.ok) { b.disabled = false; b.textContent = T.b; note(j && j.error === "too_many" ? T.many : T.err); return; }
          var l = load().filter(function (a) { return k(a) !== k(s); }); l.push({ id: j.id, tok: j.tok, q: s.q, ville: s.ville, contrat: s.contrat }); save(l);
          track("alert_on", (s.q || s.ville).slice(0, 40)); render();
        })
        .catch(function () { b.disabled = false; b.textContent = T.b; note(T.err); });
    };
    try { var r = Notification.requestPermission(done); if (r && r.then) r.then(done); } catch (e) { done("denied"); }
  }
})();
