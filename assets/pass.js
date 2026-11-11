/* Pass 1 an : paiement Stripe, clé créée à l'achat et rattachée au compte. La clé reste dans ce navigateur. */
(function () {
  "use strict";
  var API = "https://cvlibre-ai-production.up.railway.app";
  var BUY = "https://buy.stripe.com/5kQ7sE1GEfnbh31bijcjS04";
  var PK = "cvlibre.pass";
  var $ = function (s) { return document.querySelector(s); };
  var st = load(), subs = [], userFn = function () { return ""; }, loginFn = null;
  function buyUrl(email) { return BUY + (email ? "?prefilled_email=" + encodeURIComponent(email) : ""); }

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
    expired: "Ce pass a expiré (12 mois après l'achat) ou a été remboursé.",
    refunded: "Cet achat a été remboursé : la clé n'est plus valable.",
    net: "Connexion impossible. Vérifiez votre connexion et réessayez.",
    name: "Ce pass est personnel : il est verrouillé au nom de son titulaire. Pour le CV d'une autre personne, ajoutez un deuxième pass dans Mon espace.",
    holder: "Indiquez d'abord pour qui est ce pass (prénom et nom) : il sera ensuite verrouillé sur votre CV.",
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

  var asked = false;
  function isCvl() { return !!(st && /^CVL-/.test(st.key)); }
  function holder() { return st && st.hp ? { p: st.hp, n: st.hn, name: st.hp + " " + st.hn } : null; }
  function nameText() { var h = holder(); return h ? "Ce pass est celui de " + h.name + " : le CV doit porter ce nom. Pour le CV d'une autre personne, ajoutez un deuxième pass dans Mon espace." : TEXT.name; }
  /* Titulaire du pass : défini une seule fois, ensuite verrouillé (contrôlé par le serveur à chaque PDF). */
  function bind(first, last) {
    if (!paid()) return Promise.resolve({ ok: false, text: TEXT.expired });
    return post("/pass/bind", { key: st.key, first: first, last: last }).then(function (r) {
      if (r.ok && r.holder) { st.hp = r.holder.p; st.hn = r.holder.n; persist(); notify(); return { ok: true }; }
      if (r.error === "empty") return { ok: false, text: "Indiquez le prénom et le nom." };
      return { ok: false, text: TEXT[r.error] || TEXT.net };
    });
  }

  /* Active une clé. Résout { ok } ou { ok:false, text }. */
  function activate(key) {
    key = String(key || "").trim();
    if (key.length < 8) return Promise.resolve({ ok: false, text: TEXT.invalid });
    return post("/pass/verify", { key: key }).then(function (r) {
      if (r.ok) { st = { key: key, until: r.until, plan: r.plan || "pass", hp: r.holder ? r.holder.p : "", hn: r.holder ? r.holder.n : "" }; persist(); notify(); askHolder(); return { ok: true }; }
      return { ok: false, text: TEXT[r.error] || TEXT.net };
    });
  }
  function forget() { st = null; persist(); notify(); }

  /* Avant un PDF : le serveur compte l'export et contrôle le nom. Résout { wm:boolean, text? }. */
  function exportPdf(name) {
    if (!paid()) return Promise.resolve({ wm: true });
    if (!String(name || "").trim()) return Promise.resolve({ wm: true, text: TEXT.noname });
    if (isCvl() && !holder()) { askHolder(true); return Promise.resolve({ wm: true, text: TEXT.holder }); }
    return Promise.all([nameHashes(name), hash("f:" + norm(name))]).then(function (h) { return post("/pass/export", { key: st.key, p: h[0][0], n: h[0][1], f: h[1] }); }).then(function (r) {
      if (r.ok) return { wm: false };
      if (r.error === "holder") { askHolder(true); return { wm: true, text: TEXT.holder }; }
      if (r.error === "name") { if (r.holder) { st.hp = r.holder.p; st.hn = r.holder.n; persist(); notify(); } return { wm: true, text: nameText() }; }
      if (r.error === "invalid" || r.error === "expired" || r.error === "refunded") { var t = TEXT[r.error]; forget(); return { wm: true, text: t }; }
      return { wm: true, text: TEXT[r.error] || TEXT.net };
    });
  }

  /* Après la connexion, si la personne venait de cliquer sur « Acheter », on l'envoie directement au paiement. */
  function resumeBuy() {
    var em = userFn(), t = 0;
    if (!em || paid()) return;
    try { t = Number(localStorage.getItem("cvlibre.buy") || 0); localStorage.removeItem("cvlibre.buy"); } catch (x) {}
    if (t && Date.now() - t < 30 * 60000) location.href = buyUrl(em);
  }

  window.CVPASS = { paid: paid, key: function () { return paid() ? st.key : ""; }, until: function () { return st ? st.until : 0; }, plan: function () { return paid() && st.plan === "pro" ? "pro" : "pass"; }, activate: activate, forget: forget, holder: holder, bind: bind, askHolder: function () { askHolder(true); }, exportPdf: exportPdf, onChange: function (f) { subs.push(f); },
    buyUrl: buyUrl, resumeBuy: resumeBuy, setUser: function (f) { userFn = f; }, setLogin: function (f) { loginFn = f; } };

  /* ---------- fenêtre ---------- */
  var dlg = $("#pass-dlg");
  if (!dlg) return;
  var off = $("#pass-off"), on = $("#pass-on"), note = $("#pass-note"), btn = $("#pass-btn");
  var buy = $("#pass-buy");
  buy.href = BUY;
  /* Le pass est rattaché au compte : on se connecte d'abord, puis le paiement s'ouvre avec l'e-mail déjà rempli. */
  buy.addEventListener("click", function (e) {
    var em = userFn();
    if (em) { buy.href = buyUrl(em); return; }
    if (!loginFn) return;
    e.preventDefault();
    try { localStorage.setItem("cvlibre.buy", String(Date.now())); } catch (x) {}
    if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
    loginFn();
  });
  var who = $("#pass-who");
  function askHolder(force) {
    if (!dlg || !paid() || !isCvl() || holder() || (asked && !force)) return;
    asked = true;
    var nm = $("#f-name"), v = nm ? String(nm.value || "").trim().split(/\s+/) : [];
    if (v[0] && who && !$("#who-p").value) { $("#who-p").value = v[0]; $("#who-n").value = v.slice(1).join(" "); }
    ui(); if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
  }
  var whoBtn = $("#who-ok");
  if (whoBtn) whoBtn.addEventListener("click", function () {
    var a = $("#who-p").value.trim(), b = $("#who-n").value.trim();
    if (!a || !b) { note.textContent = "Indiquez le prénom et le nom."; return; }
    whoBtn.disabled = true; note.textContent = "Enregistrement...";
    bind(a, b).then(function (r) { whoBtn.disabled = false; note.textContent = r.ok ? "Votre pass est verrouillé au nom de " + a + " " + b + "." : r.text; });
  });
  function ui() {
    var p = paid();
    off.hidden = p; on.hidden = !p;
    var h = p ? holder() : null;
    if (who) who.hidden = !(p && isCvl() && !h);
    if (p) {
      var pro = st.plan === "pro", rl = $("#pass-rules");
      $("#pass-status").textContent = pro ? "Offre Pro active. Vos PDF sortent sans filigrane." : (h ? "Pass de " + h.name + ", actif" : "Pass actif") + " jusqu'au " + new Date(st.until).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + ". Vos PDF sortent sans filigrane.";
      var mt = $("#pass-manage-txt");
      if (mt) mt.textContent = pro ? "Une question sur votre abonnement ?" : "Une question sur votre pass ou votre facture ?";
      if (rl) rl.textContent = pro ? "Offre Pro : prénom et nom libres, 30 PDF sans filigrane et 60 utilisations IA par jour, jusqu'à 200 CV et 200 lettres enregistrés." : (h ? "Pass personnel, verrouillé au nom de " + h.name + " : le nom du CV ne peut plus être changé. Pour le CV d'une autre personne, ajoutez un deuxième pass dans Mon espace. " : "Pass personnel : un seul titulaire. ") + "3 PDF sans filigrane par jour.";
    }
    btn.textContent = p ? "Pass actif" : (btn.getAttribute("data-off") || "Retirer le filigrane");
  }
  btn.addEventListener("click", function () { note.textContent = ""; ui(); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); });
  subs.push(ui); ui();
  /* Au chargement : on rafraîchit le pass (titulaire, validité), puis on demande le nom s'il manque. */
  if (isCvl()) post("/pass/verify", { key: st.key }).then(function (r) {
    if (!r.ok || !st) { return; }
    st.until = r.until || st.until; st.hp = r.holder ? r.holder.p : ""; st.hn = r.holder ? r.holder.n : "";
    persist(); notify(); askHolder();
  });
})();
