/* Pass 1 an : clé de licence Gumroad vérifiée par le serveur. La clé reste dans ce navigateur. */
(function () {
  "use strict";
  var API = "https://cvlibre-ai-production.up.railway.app";
  var BUY = "https://jeremstyke.gumroad.com/l/Pass-1an-cvlibre?wanted=true";
  var PK = "cvlibre.pass";
  var $ = function (s) { return document.querySelector(s); };
  var st = load(), subs = [];

  function load() { try { var o = JSON.parse(localStorage.getItem(PK)); if (o && o.key) return o; } catch (e) {} return null; }
  function persist() { try { if (st) localStorage.setItem(PK, JSON.stringify(st)); else localStorage.removeItem(PK); } catch (e) {} }
  function paid() { return !!(st && st.until && st.until > Date.now()); }
  function notify() { subs.forEach(function (f) { f(); }); }
  function post(path, body) {
    return fetch(API + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.status = r.status; return j; }); })
      .catch(function () { return { error: "net" }; });
  }
  var TEXT = {
    invalid: "Cette clé n'est pas reconnue. Vérifiez qu'elle est copiée en entier.",
    expired: "Ce pass a expiré (12 mois après l'achat).",
    refunded: "Cet achat a été remboursé : la clé n'est plus valable.",
    net: "Connexion impossible. Vérifiez votre connexion et réessayez.",
    name: "Ce pass est personnel : il est déjà utilisé pour une autre personne. Un autre CV nécessite un autre pass.",
    limit: "Vous avez atteint la limite de PDF sans filigrane du jour. Celui-ci garde le bandeau. Revenez demain.",
    noname: "Indiquez le prénom et le nom dans le CV pour télécharger sans filigrane."
  };
  function norm(s) { return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]/g, ""); }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join(""); }
  function hash(t) { return crypto.subtle.digest("SHA-256", new TextEncoder().encode("cvlibre:" + t)).then(hex); }
  function nameHashes(full) {
    var parts = String(full || "").trim().split(/\s+/);
    return Promise.all([hash("p:" + norm(parts[0])), hash("n:" + norm(parts.slice(1).join(" ")))]);
  }

  /* Active une clé. Résout { ok } ou { ok:false, text }. */
  function activate(key) {
    key = String(key || "").trim();
    if (key.length < 8) return Promise.resolve({ ok: false, text: TEXT.invalid });
    return post("/pass/verify", { key: key }).then(function (r) {
      if (r.ok) { st = { key: key, until: r.until, plan: r.plan || "pass" }; persist(); notify(); return { ok: true }; }
      return { ok: false, text: TEXT[r.error] || TEXT.net };
    });
  }
  function forget() { st = null; persist(); notify(); }

  /* Avant un PDF : le serveur compte l'export et contrôle le nom. Résout { wm:boolean, text? }. */
  function exportPdf(name) {
    if (!paid()) return Promise.resolve({ wm: true });
    if (!String(name || "").trim()) return Promise.resolve({ wm: true, text: TEXT.noname });
    return nameHashes(name).then(function (h) { return post("/pass/export", { key: st.key, p: h[0], n: h[1] }); }).then(function (r) {
      if (r.ok) return { wm: false };
      if (r.error === "invalid" || r.error === "expired" || r.error === "refunded") { var t = TEXT[r.error]; forget(); return { wm: true, text: t }; }
      return { wm: true, text: TEXT[r.error] || TEXT.net };
    });
  }

  window.CVPASS = { paid: paid, key: function () { return paid() ? st.key : ""; }, until: function () { return st ? st.until : 0; }, plan: function () { return paid() && st.plan === "pro" ? "pro" : "pass"; }, activate: activate, forget: forget, exportPdf: exportPdf, onChange: function (f) { subs.push(f); } };

  /* ---------- fenêtre ---------- */
  var dlg = $("#pass-dlg");
  if (!dlg) return;
  var off = $("#pass-off"), on = $("#pass-on"), note = $("#pass-note"), keyIn = $("#pass-key"), go = $("#pass-go"), offBtn = $("#pass-off-btn"), btn = $("#pass-btn");
  $("#pass-buy").href = BUY;
  function ui() {
    var p = paid();
    off.hidden = p; on.hidden = !p; offBtn.hidden = !p;
    if (p) {
      var pro = st.plan === "pro", rl = $("#pass-rules");
      $("#pass-status").textContent = pro ? "Offre Pro active. Vos PDF sortent sans filigrane." : "Pass actif jusqu'au " + new Date(st.until).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + ". Vos PDF sortent sans filigrane.";
      var mt = $("#pass-manage-txt");
      if (mt) mt.textContent = pro ? "Pour résilier votre abonnement, utilisez le lien « Gérer l'abonnement » de votre e-mail de reçu, ou retrouvez votre clé et vos factures :" : "Clé perdue ou facture à retrouver ?";
      if (rl) rl.textContent = pro ? "Offre Pro : prénom et nom libres, 30 PDF sans filigrane et 60 utilisations IA par jour, jusqu'à 200 CV et 200 lettres enregistrés." : "Pass personnel : un seul prénom, le nom de famille peut être modifié une fois. 3 PDF sans filigrane par jour.";
    }
    btn.textContent = p ? "Pass actif" : (btn.getAttribute("data-off") || "Retirer le filigrane");
  }
  btn.addEventListener("click", function () { note.textContent = ""; ui(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); });
  go.addEventListener("click", function () {
    go.disabled = true; note.textContent = "Vérification en cours...";
    activate(keyIn.value).then(function (r) { go.disabled = false; note.textContent = r.ok ? "" : r.text; if (r.ok) keyIn.value = ""; });
  });
  keyIn.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); go.click(); } });
  offBtn.addEventListener("click", function () { forget(); note.textContent = "Clé retirée de cet appareil."; });
  subs.push(ui); ui();
})();
