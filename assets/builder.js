/* Créateur de CV : état, formulaire, aperçu en direct, impression PDF. Tout reste dans le navigateur. */
(function () {
  "use strict";
  var KEY = "cvlibre.v1";
  var COLORS = [["#1f4fd8", "Bleu"], ["#0f766e", "Vert"], ["#9d174d", "Prune"], ["#b45309", "Ambre"], ["#374151", "Ardoise"], ["#111827", "Noir"]];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var clone = function (o) { return JSON.parse(JSON.stringify(o)); };

  var LISTS = {
    exp: { el: "#exp-list", label: "Expérience", blank: { role: "", company: "", city: "", from: "", to: "", desc: "" }, fields: [
      ["role", "Poste", "text", "full"], ["company", "Entreprise", "text", "half"], ["city", "Ville", "text", "half"],
      ["from", "Début", "text", "half", "Ex. Sept. 2022"], ["to", "Fin", "text", "half", "Ex. Aujourd'hui"],
      ["desc", "Missions et résultats", "area", "full", "Une ligne par mission. Commence la ligne par un tiret pour faire une puce."]] },
    edu: { el: "#edu-list", label: "Formation", blank: { degree: "", school: "", from: "", to: "", desc: "" }, fields: [
      ["degree", "Diplôme ou formation", "text", "full"], ["school", "École ou université", "text", "full"],
      ["from", "Début", "text", "half"], ["to", "Fin", "text", "half"], ["desc", "Détails (facultatif)", "area", "full"]] },
    langs: { el: "#langs-list", label: "Langue", blank: { name: "", level: "" }, fields: [
      ["name", "Langue", "text", "half"], ["level", "Niveau", "text", "half", "Ex. Courant (C1)"]] }
  };

  var S = load(), saveT = 0;
  function load() {
    try {
      var t = localStorage.getItem(KEY);
      if (t) { var o = JSON.parse(t); if (o && typeof o === "object") return Object.assign(clone(CVR.sample), o); }
    } catch (e) {}
    return clone(CVR.sample);
  }
  function flush() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function save() { clearTimeout(saveT); saveT = setTimeout(flush, 300); }
  window.addEventListener("pagehide", flush);
  document.addEventListener("visibilitychange", function () { if (document.visibilityState === "hidden") flush(); });

  /* ---------- aperçu ---------- */
  var sheet = $("#sheet"), pbox = $("#pbox"), warn = $("#pages-warn"), forceWm = false;
  function wmOn() { return forceWm || !(window.CVPASS && window.CVPASS.paid()); }
  var PREMIUM = { elegant: 1, bandeau: 1, chrono: 1, marge: 1, nuit: 1, cadre: 1, ruban: 1, journal: 1, bandes: 1, cartes: 1, aurore: 1, horizon: 1, minimal: 1, pastel: 1, atelier: 1, prestige: 1, standard: 1, compact: 1, diagonale: 1, bulle: 1, papier: 1, pop: 1, affiche: 1, monogramme: 1, sombre: 1, vertical: 1, retro: 1, duo: 1, geometrie: 1, editorial: 1 };
  var FONTS = { inter: '"CVF Inter", Arial, Helvetica, sans-serif', nunito: '"CVF Nunito", Arial, Helvetica, sans-serif', montserrat: '"CVF Montserrat", Arial, Helvetica, sans-serif', sourcesans: '"Source Sans 3", Arial, Helvetica, sans-serif', bricolage: '"Bricolage Grotesque", "Source Sans 3", Arial, sans-serif', lora: '"CVF Lora", Georgia, "Times New Roman", serif', playfair: '"CVF Playfair", Georgia, "Times New Roman", serif', sourceserif: '"Source Serif 4", Georgia, "Times New Roman", serif' };
  /* Mise en forme du Pass : une police par élément (n nom, i intitulé, r rubriques, p postes et diplômes, t texte), taille et espacement */
  var FMT_KEYS = ["n", "i", "r", "p", "t"], SIZES = { s: 1, l: 1 }, SPACES = { t: 1, a: 1 };
  function applyFmt() {
    var f = paid() && S.fnt ? S.fnt : {};
    FMT_KEYS.forEach(function (k) {
      if (f[k] && FONTS[f[k]]) { sheet.setAttribute("data-f-" + k, ""); sheet.style.setProperty("--f-" + k, FONTS[f[k]]); }
      else { sheet.removeAttribute("data-f-" + k); sheet.style.removeProperty("--f-" + k); }
    });
    if (paid() && SIZES[S.size]) sheet.setAttribute("data-size", S.size); else sheet.removeAttribute("data-size");
    if (paid() && SPACES[S.space]) sheet.setAttribute("data-space", S.space); else sheet.removeAttribute("data-space");
    var on = paid();
    $$("#fmt-dlg select[data-f]").forEach(function (el) { el.value = on && f[el.dataset.f] && FONTS[f[el.dataset.f]] ? f[el.dataset.f] : ""; });
    $$("#fmt-dlg [data-size]").forEach(function (x) { x.setAttribute("aria-pressed", String((on && S.size || "") === x.dataset.size)); });
    $$("#fmt-dlg [data-space]").forEach(function (x) { x.setAttribute("aria-pressed", String((on && S.space || "") === x.dataset.space)); });
    var fb = $("#fmt-btn"); if (fb) fb.textContent = on ? "Personnaliser" : "Personnaliser (Pass)";
  }
  var TPLS = [["classique", "Classique"], ["moderne", "Moderne"], ["sobre", "Sobre"], ["affiche", "Affiche"], ["duo", "Duo"], ["vertical", "Vertical"], ["editorial", "Éditorial"], ["geometrie", "Géométrie"], ["monogramme", "Monogramme"], ["sombre", "Sombre"], ["retro", "Rétro"], ["elegant", "Élégant"], ["bandeau", "Bandeau"], ["chrono", "Chronologie"], ["marge", "Marge"], ["nuit", "Nuit"], ["cadre", "Cadre"], ["ruban", "Ruban"], ["journal", "Journal"], ["bandes", "Bandes"], ["cartes", "Cartes"], ["aurore", "Aurore"], ["horizon", "Horizon"], ["minimal", "Minimal"], ["pastel", "Pastel"], ["atelier", "Atelier"], ["prestige", "Prestige"], ["standard", "Standard"], ["compact", "Compact"], ["diagonale", "Diagonale"], ["bulle", "Bulle"], ["papier", "Papier"], ["pop", "Pop"]];
  /* modèle demandé depuis l'accueil (?modele=duo) ou galerie complète (?modeles=1) */
  try {
    var qs = new URLSearchParams(location.search), qm = qs.get("modele");
    if (qm && TPLS.some(function (t) { return t[0] === qm; })) { S.tpl = qm; flush(); }
  } catch (e) {}
  function paid() { return !!(window.CVPASS && window.CVPASS.paid()); }
  function paint() {
    lockName();
    sheet.className = "sheet t-" + (PREMIUM[S.tpl] && !paid() ? "moderne" : S.tpl);
    sheet.style.setProperty("--acc", S.accent);
    applyFmt();
    sheet.innerHTML = CVR.render(S) + (wmOn() ? '<div class="wm" role="img" aria-label="CV créé gratuitement avec CVLibre"></div>' : "");
    fit();
    $$("#tpls button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tpl === S.tpl && !(PREMIUM[S.tpl] && !paid()))); b.classList.toggle("locked", !!PREMIUM[b.dataset.tpl] && !paid()); });
    var tm = $("#tpl-more"); if (tm) { var cur = PREMIUM[S.tpl] && paid(); tm.setAttribute("aria-pressed", String(!!cur)); tm.textContent = cur ? (TPLS.filter(function (t) { return t[0] === S.tpl; })[0] || ["", "Plus de modèles"])[1] : "Plus de modèles"; }
    $$("#swatches button").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.c === S.accent)); });
    var tc = $("#tpl-cur"); if (tc) tc.textContent = (TPLS.filter(function (t) { return t[0] === S.tpl; })[0] || ["", "Moderne"])[1] + " ▾";
  }
  function fit() {
    var w = pbox.clientWidth, sw = sheet.offsetWidth;
    if (!w || !sw) return;
    var k = w / sw;
    var cvEl = sheet.querySelector(".cv"); sheet.style.minHeight = ""; if (cvEl) cvEl.style.minHeight = "";
    /* à l'impression les marges haut et bas se répètent sur chaque page : on en tient compte */
    var cs = getComputedStyle(sheet), mv = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0), pg = 297 * 96 / 25.4;
    var pages = Math.max(1, Math.ceil((sheet.offsetHeight - 3 - mv) / Math.max(pg - mv, pg / 2)));
    /* la feuille remplit un nombre entier de pages : fonds et cadres vont jusqu'en bas de la dernière page */
    if (pages > 1) { var mh = (pages * 297 - 0.4) + "mm"; sheet.style.minHeight = mh; if (cvEl) cvEl.style.minHeight = mh; }
    sheet.style.transform = "scale(" + k + ")";
    pbox.style.height = Math.ceil(sheet.offsetHeight * k) + "px";
    if (pages > 1) { warn.hidden = false; warn.textContent = "Votre CV fait " + pages + " pages. Pour la plupart des candidatures, une page suffit : raccourcissez les descriptions ou gardez les expériences les plus récentes."; }
    else warn.hidden = true;
  }
  /* Pass personnel : le nom du CV est celui du titulaire et ne peut plus être modifié. */
  function lockName() {
    var P = window.CVPASS, h = P && P.paid() && P.holder ? P.holder() : null, el = $('[data-k="name"]'), nt = $("#name-lock");
    if (h) {
      if (S.name !== h.name) S.name = h.name;
      if (el) { el.value = h.name; el.readOnly = true; }
      if (nt) { nt.hidden = false; nt.textContent = "Nom verrouillé par votre pass (" + h.name + "). Pour le CV d'une autre personne, ajoutez un deuxième pass dans Mon espace."; }
    } else { if (el) el.readOnly = false; if (nt) nt.hidden = true; }
  }
  function changed() { lockName(); save(); paint(); }

  /* ---------- champs simples ---------- */
  $$("[data-k]").forEach(function (el) {
    el.value = S[el.dataset.k] || "";
    el.addEventListener("input", function () { S[el.dataset.k] = el.value; changed(); });
  });

  /* ---------- listes (expériences, formations, langues) ---------- */
  function renderList(key) {
    var cfg = LISTS[key], box = $(cfg.el), arr = S[key];
    box.innerHTML = "";
    arr.forEach(function (item, i) {
      var card = document.createElement("div"); card.className = "item";
      var head = document.createElement("div"); head.className = "item-head";
      var t = document.createElement("strong"); t.textContent = cfg.label + " " + (i + 1);
      var mini = document.createElement("div"); mini.className = "mini";
      [["↑", "Monter", -1], ["↓", "Descendre", 1], ["×", "Supprimer", 0]].forEach(function (a) {
        var b = document.createElement("button"); b.type = "button"; b.textContent = a[0];
        b.setAttribute("aria-label", a[1] + " : " + cfg.label.toLowerCase() + " " + (i + 1));
        if ((a[2] === -1 && i === 0) || (a[2] === 1 && i === arr.length - 1)) b.disabled = true;
        b.addEventListener("click", function () {
          if (a[2] === 0) arr.splice(i, 1);
          else { var j = i + a[2], tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp; }
          renderList(key); changed();
        });
        mini.appendChild(b);
      });
      head.appendChild(t); head.appendChild(mini); card.appendChild(head);
      var row = null;
      cfg.fields.forEach(function (f) {
        var id = key + "-" + i + "-" + f[0], wrap = document.createElement("div"); wrap.className = "fld";
        var lab = document.createElement("label"); lab.htmlFor = id; lab.textContent = f[1];
        var inp = document.createElement(f[2] === "area" ? "textarea" : "input"); inp.id = id; inp.value = item[f[0]] || "";
        if (f[4] && f[2] !== "area") inp.placeholder = f[4];
        wrap.appendChild(lab); wrap.appendChild(inp);
        if (f[4] && f[2] === "area") { var h = document.createElement("span"); h.className = "hint"; h.textContent = f[4]; wrap.appendChild(h); }
        inp.addEventListener("input", function () { item[f[0]] = inp.value; changed(); });
        if (f[0] === "desc") {
          var rw = document.createElement("button"); rw.type = "button"; rw.className = "link-btn rw"; rw.textContent = "Reformuler avec l'IA";
          rw.addEventListener("click", function () { window.CVAI.rewrite(rw, function () { return inp.value; }, function (v) { inp.value = v; item.desc = v; changed(); }, key); });
          wrap.appendChild(rw);
        }
        if (f[3] === "half") {
          if (!row) { row = document.createElement("div"); row.className = "row2"; card.appendChild(row); }
          row.appendChild(wrap);
          if (row.children.length === 2) row = null;
        } else { row = null; card.appendChild(wrap); }
      });
      box.appendChild(card);
    });
  }
  $$("[data-add]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.dataset.add; S[k].push(clone(LISTS[k].blank)); renderList(k); changed();
      var last = $(LISTS[k].el + " .item:last-child input"); if (last) last.focus();
    });
  });
  Object.keys(LISTS).forEach(renderList);

  /* ---------- modèle et couleur ---------- */
  var tdlg = $("#tpl-dlg"), tgrid = $("#tpl-grid"), tmore = $("#tpl-more");
  function openGallery() {
    tgrid.textContent = "";
    TPLS.forEach(function (t) {
      var locked = !!PREMIUM[t[0]] && !paid();
      var card = document.createElement("button"); card.type = "button"; card.className = "tpl-card" + (S.tpl === t[0] ? " on" : ""); card.setAttribute("data-tpl", t[0]); card.setAttribute("data-locked", locked ? "1" : "0");
      var th = document.createElement("span"); th.className = "tpl-thumb";
      var sh = document.createElement("div"); sh.className = "sheet t-" + t[0]; sh.style.setProperty("--acc", S.accent); sh.setAttribute("aria-hidden", "true");
      sh.innerHTML = CVR.render(S); th.appendChild(sh);
      var nm = document.createElement("span"); nm.className = "tpl-name"; nm.textContent = t[1];
      if (locked) { var bd = document.createElement("span"); bd.className = "tpl-badge"; bd.textContent = "Pass"; nm.appendChild(bd); }
      card.appendChild(th); card.appendChild(nm);
      card.addEventListener("click", function () {
        tdlg.close();
        if (locked) { var pb = $("#pass-btn"); if (pb) pb.click(); return; }
        S.tpl = t[0]; changed();
      });
      tgrid.appendChild(card);
    });
    if (tdlg.showModal) tdlg.showModal(); else tdlg.setAttribute("open", "");
  }
  if (tmore && tdlg) tmore.addEventListener("click", openGallery);
  try { if (/[?&]modeles=1/.test(location.search) && tdlg) setTimeout(openGallery, 300); } catch (e) {}
  var tcur = $("#tpl-cur"); if (tcur && tdlg) tcur.addEventListener("click", openGallery);
  /* menu Plus : se ferme après un choix (sauf la 1re pression sur Repartir de zéro) et au clic ailleurs */
  var more = $("#more");
  if (more) {
    more.addEventListener("click", function (e) { var it = e.target.closest && e.target.closest(".tbm-item"); if (!it) return; if (it.id === "reset" && it.dataset.arm === "1") return; setTimeout(function () { more.open = false; }, 0); });
    document.addEventListener("click", function (e) { if (more.open && !more.contains(e.target)) more.open = false; });
    /* sur mobile le menu est fixé à l'écran : on le place juste sous le bouton Plus */
    var place = function () { var m = more.querySelector(".tbm-menu"); if (!more.open || !m) return; if (getComputedStyle(m).position === "fixed") m.style.top = (more.querySelector("summary").getBoundingClientRect().bottom + 6) + "px"; else m.style.top = ""; };
    more.addEventListener("toggle", place); window.addEventListener("scroll", place, { passive: true }); window.addEventListener("resize", place);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && more.open) { more.open = false; more.querySelector("summary").focus(); } });
  }
  $$("#tpls button").forEach(function (b) { b.addEventListener("click", function () {
    if (PREMIUM[b.dataset.tpl] && !paid()) { var pb = $("#pass-btn"); if (pb) pb.click(); return; }
    S.tpl = b.dataset.tpl; changed();
  }); });
  var fdlg = $("#fmt-dlg"), fbtn = $("#fmt-btn");
  if (fbtn && fdlg) {
    fbtn.addEventListener("click", function () {
      if (!paid()) { var pb = $("#pass-btn"); if (pb) pb.click(); return; }
      if (fdlg.showModal) fdlg.showModal(); else fdlg.setAttribute("open", "");
    });
    $$("#fmt-dlg select[data-f]").forEach(function (el) { el.addEventListener("change", function () { S.fnt = Object.assign({}, S.fnt || {}); S.fnt[el.dataset.f] = el.value; changed(); }); });
    $$("#fmt-dlg [data-size]").forEach(function (x) { x.addEventListener("click", function () { S.size = x.dataset.size; changed(); }); });
    $$("#fmt-dlg [data-space]").forEach(function (x) { x.addEventListener("click", function () { S.space = x.dataset.space; changed(); }); });
    $("#fmt-reset").addEventListener("click", function () { S.fnt = {}; S.size = ""; S.space = ""; changed(); });
  }
  COLORS.forEach(function (c) {
    var b = document.createElement("button"); b.type = "button"; b.dataset.c = c[0]; b.style.background = c[0];
    b.setAttribute("aria-label", c[1]); b.title = c[1];
    b.addEventListener("click", function () { S.accent = c[0]; changed(); });
    $("#swatches").appendChild(b);
  });

  /* ---------- photo ---------- */
  var prev = $("#photo-prev"), del = $("#photo-del");
  function photoUI() { prev.style.backgroundImage = S.photo ? "url(" + S.photo + ")" : "none"; del.hidden = !S.photo; }
  $("#photo-file").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0]; if (!f) return;
    var rd = new FileReader();
    rd.onload = function () {
      var img = new Image();
      img.onload = function () {
        var s = Math.min(img.width, img.height), c = document.createElement("canvas"); c.width = c.height = 360;
        c.getContext("2d").drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, 360, 360);
        S.photo = c.toDataURL("image/jpeg", 0.85); photoUI(); changed();
      };
      img.src = rd.result;
    };
    rd.readAsDataURL(f);
  });
  del.addEventListener("click", function () { S.photo = ""; $("#photo-file").value = ""; photoUI(); changed(); });

  /* ---------- impression PDF ---------- */
  var oldTitle = document.title, passMsg = $("#pass-msg");
  function doPrint() {
    var n = (S.name || "").trim();
    document.title = n ? "CV " + n : "CV";
    paint();
    window.print();
  }
  $("#print").addEventListener("click", function () {
    passMsg.hidden = true; forceWm = false;
    if (!window.CVPASS || !window.CVPASS.paid()) {
      var wd = $("#wm-dlg");
      if (wd && wd.showModal && !wmSeen) { wd.showModal(); return; }
      doPrint(); return;
    }
    window.CVPASS.exportPdf(S.name).then(function (r) {
      forceWm = !!r.wm;
      if (r.text) { passMsg.textContent = r.text; passMsg.hidden = false; }
      doPrint();
    });
  });
  var wmSeen = false, wmd = $("#wm-dlg");
  if (wmd) {
    $("#wm-go").addEventListener("click", function () { wmSeen = true; wmd.close(); doPrint(); });
    $("#wm-remove").addEventListener("click", function () { wmd.close(); var b = $("#pass-btn"); if (b) b.click(); });
  }
  window.addEventListener("afterprint", function () { document.title = oldTitle; forceWm = false; paint();
    /* 12 nov 2026 : site 100 % gratuit, un petit mot de soutien après le PDF */
    if (passMsg) { passMsg.innerHTML = 'Votre CV est prêt. CVLibre est 100 % gratuit, financé par la publicité et vos dons : l\'IA nous coûte à chaque utilisation. <a href="/soutenir/">Soutenir CVLibre sur Tipeee ❤️</a>'; passMsg.hidden = false; }
    afterAsk();
  });
  /* après le téléchargement : proposer le compte gratuit et le don (au plus une fois par jour) */
  var adlg = $("#after-dlg"), asked = false;
  function afterAsk() {
    if (!adlg || asked || !adlg.showModal) return;
    try { var t = +localStorage.getItem("cvlibre.afterAsk") || 0; if (Date.now() - t < 864e5) return; localStorage.setItem("cvlibre.afterAsk", String(Date.now())); } catch (e) {}
    asked = true;
    var ab = $("#acc-btn"), logged = ab && /compte/i.test(ab.textContent || "");
    $("#after-acc").hidden = !ab || ab.hidden || logged;
    setTimeout(function () { if (!adlg.open) adlg.showModal(); }, 400);
  }
  if (adlg) {
    $("#after-acc-go").addEventListener("click", function () { adlg.close(); var ab = $("#acc-btn"); if (ab) ab.click(); });
    $("#after-don").addEventListener("click", function () { setTimeout(function () { adlg.close(); }, 300); });
  }
  /* sur iPhone, "afterprint" n'arrive pas toujours : on propose aussi peu après le clic sur le PDF */
  $("#print").addEventListener("click", function () { setTimeout(function () { if (!document.hidden) afterAsk(); }, 2500); });
  if (window.CVPASS) window.CVPASS.onChange(function () { paint(); });

  /* ---------- IA : remplir le CV et reformuler ---------- */
  var AI = "https://cvlibre-ai-production.up.railway.app";
  var ERR = {
    limit: "Vous avez utilisé vos 5 utilisations gratuites de l'IA pour aujourd'hui. Revenez demain. Chaque utilisation de l'IA nous coûte : si CVLibre vous aide, pensez à nous soutenir (lien en bas de page).",
    busy: "Le service est très demandé en ce moment. Réessayez un peu plus tard.",
    empty: "Écrivez quelques lignes sur votre parcours ou ajoutez votre ancien CV.",
    net: "Connexion impossible. Vérifiez votre connexion et réessayez."
  };
  function aiPost(path, payload) {
    if (window.CVPASS && window.CVPASS.key()) payload.key = window.CVPASS.key();
    return fetch(AI + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j.status = r.status; return j; }); })
      .catch(function () { return { error: "net" }; });
  }
  var leftTxt = function (n) { return typeof n === "number" ? " Il vous reste " + n + " utilisation" + (n > 1 ? "s" : "") + " aujourd'hui." : ""; };
  var aiMsg = $("#ai-msg"), aiGo = $("#ai-go"), aiUndo = $("#ai-undo"), aiPrev = null;
  function str(x) { return typeof x === "string" ? x.trim() : ""; }
  function normCV(cv) {
    var list = function (a, max, fn, blank) { var r = (Array.isArray(a) ? a : []).slice(0, max).map(fn); return r.length ? r : [clone(blank)]; };
    var skills = Array.isArray(cv.skills) ? cv.skills.map(str).filter(Boolean).join(", ") : str(cv.skills);
    return {
      tpl: S.tpl, accent: S.accent, fnt: S.fnt || {}, size: S.size || "", space: S.space || "", photo: S.photo,
      name: str(cv.name), title: str(cv.title), email: str(cv.email), phone: str(cv.phone), city: str(cv.city), link: str(cv.link), summary: str(cv.summary),
      exp: list(cv.exp, 6, function (e) { e = e || {}; return { role: str(e.role), company: str(e.company), city: str(e.city), from: str(e.from), to: str(e.to), desc: str(e.desc) }; }, LISTS.exp.blank),
      edu: list(cv.edu, 4, function (e) { e = e || {}; return { degree: str(e.degree), school: str(e.school), from: str(e.from), to: str(e.to), desc: str(e.desc) }; }, LISTS.edu.blank),
      skills: skills,
      langs: list(cv.langs, 5, function (l) { l = l || {}; return { name: str(l.name), level: str(l.level) }; }, LISTS.langs.blank),
      hobbies: str(cv.hobbies)
    };
  }
  function setState(n) {
    S = n; $$("[data-k]").forEach(function (el) { el.value = S[el.dataset.k] || ""; });
    Object.keys(LISTS).forEach(renderList); photoUI(); changed();
  }
  window.CVB = { get: function () { return clone(S); }, set: function (d) { setState(Object.assign(clone(CVR.sample), d)); } };
  function fileToPayload(f) {
    return new Promise(function (ok, ko) {
      if (!f) return ok(null);
      if (f.type === "application/pdf") {
        if (f.size > 4 * 1024 * 1024) return ko("Ce PDF dépasse 4 Mo. Réduisez-le ou collez son texte ci-dessus.");
        var rd = new FileReader(); rd.onload = function () { ok({ type: f.type, data: String(rd.result).split(",")[1] }); }; rd.onerror = function () { ko("Fichier illisible."); }; rd.readAsDataURL(f); return;
      }
      if (!/^image\/(jpeg|png|webp)$/.test(f.type)) return ko("Format non pris en charge. Utilisez un PDF ou une photo (JPEG, PNG).");
      var url = URL.createObjectURL(f), img = new Image();
      img.onload = function () {
        var k = Math.min(1, 1600 / Math.max(img.width, img.height)), c = document.createElement("canvas");
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(url);
        ok({ type: "image/jpeg", data: c.toDataURL("image/jpeg", 0.85).split(",")[1] });
      };
      img.onerror = function () { URL.revokeObjectURL(url); ko("Image illisible."); };
      img.src = url;
    });
  }
  aiGo.addEventListener("click", function () {
    var text = $("#ai-text").value.trim(), f = $("#ai-file").files && $("#ai-file").files[0];
    if (!text && !f) { aiMsg.textContent = ERR.empty; return; }
    aiGo.disabled = true; aiGo.textContent = "L'IA travaille..."; aiMsg.textContent = "Cela prend 5 à 15 secondes.";
    fileToPayload(f).then(function (file) {
      return aiPost("/fill", { text: text, file: file });
    }, function (m) { return { error: "local", msg: m }; }).then(function (j) {
      aiGo.disabled = false; aiGo.textContent = "Remplir mon CV";
      if (j.error || !j.cv) { aiMsg.textContent = j.msg || ERR[j.error] || "L'IA n'a pas réussi cette fois. Réessayez, cette utilisation n'est pas décomptée."; return; }
      aiPrev = clone(S); setState(normCV(j.cv)); aiUndo.hidden = false;
      aiMsg.textContent = "C'est rempli. Relisez tout et corrigez : l'IA peut se tromper." + leftTxt(j.left);
      $("#f-name").scrollIntoView({ block: "nearest" });
    });
  });
  aiUndo.addEventListener("click", function () { if (aiPrev) { setState(aiPrev); aiPrev = null; } aiUndo.hidden = true; aiMsg.textContent = "Votre CV d'avant est de retour."; });

  /* ---------- adapter le CV à une offre (IA) ---------- */
  var tlGo = $("#tl-go"), tlMsg = $("#tl-msg"), tlRes = $("#tl-res"), tlUndo = $("#tl-undo"), tlPrev = null;
  function esc(t) { var d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
  if (tlGo) {
    var tlOpen = $("#tailor-open");
    if (tlOpen) tlOpen.addEventListener("click", function () { var d = $("#tailor"); d.open = true; document.body.dataset.tab = "edit"; d.scrollIntoView({ behavior: "smooth", block: "start" }); setTimeout(function () { $("#tl-ad").focus(); }, 400); });
    /* Arrivée depuis une offre d'emploi (/offres-emploi/) : l'annonce est déjà collée dans « Adapter mon CV à une offre ». */
    if (/[?&]offre=1/.test(location.search)) {
      var OF = null; try { OF = JSON.parse(localStorage.getItem("cvlibre.offre") || "null"); } catch (e) {}
      if (OF && OF.ad && Date.now() - (OF.at || 0) < 864e5) {
        var tdet = $("#tailor"), tad = $("#tl-ad");
        if (tdet && tad) { tad.value = OF.ad; tad.dispatchEvent(new Event("input", { bubbles: true })); tdet.open = true; document.body.dataset.tab = "edit"; setTimeout(function () { tdet.scrollIntoView({ behavior: "smooth", block: "start" }); }, 300); }
      }
    }
    tlGo.addEventListener("click", function () {
      var ad = $("#tl-ad").value.trim();
      if (ad.length < 60) { tlMsg.textContent = "Collez le texte complet de l'offre (au moins quelques lignes)."; return; }
      var hasCv = (S.title || S.summary || S.skills || (S.exp || []).some(function (e) { return e.role || e.desc; }));
      if (!hasCv) { tlMsg.textContent = "Remplissez d'abord votre CV (ou utilisez « Remplir avec l'IA » plus haut), puis adaptez-le."; return; }
      var cv = { title: S.title, summary: S.summary, skills: S.skills, exp: (S.exp || []).map(function (e) { return { role: e.role, company: e.company, desc: e.desc }; }), edu: (S.edu || []).map(function (e) { return { degree: e.degree }; }) };
      tlGo.disabled = true; tlGo.textContent = "L'IA analyse l'offre..."; tlMsg.textContent = "Cela prend 5 à 20 secondes."; tlRes.hidden = true;
      aiPost("/tailor", { ad: ad, cv: JSON.stringify(cv) }).then(function (j) {
        tlGo.disabled = false; tlGo.textContent = "Adapter mon CV";
        if (j.error || !j.tailor) { tlMsg.textContent = ERR[j.error] || "L'IA n'a pas réussi cette fois. Réessayez, cette utilisation n'est pas décomptée."; return; }
        showTailor(j.tailor); tlMsg.textContent = "Voici les propositions. Cochez ce que vous gardez, puis appliquez." + leftTxt(j.left);
      });
    });
    tlUndo.addEventListener("click", function () { if (tlPrev) { setState(tlPrev); tlPrev = null; } tlUndo.hidden = true; tlMsg.textContent = "Votre CV d'avant est de retour."; });
  }
  function showTailor(t) {
    var items = [];
    if (str(t.title) && str(t.title) !== S.title) items.push({ k: "title", lab: "Poste visé", old: S.title, val: str(t.title) });
    if (str(t.summary) && str(t.summary) !== S.summary) items.push({ k: "summary", lab: "Profil", old: S.summary, val: str(t.summary) });
    var sk = Array.isArray(t.skills) ? t.skills.map(str).filter(Boolean).join(", ") : str(t.skills);
    if (sk && sk !== S.skills) items.push({ k: "skills", lab: "Compétences", old: S.skills, val: sk });
    (Array.isArray(t.exp) ? t.exp : []).forEach(function (e) {
      var i = parseInt(e && e.i, 10), cur = S.exp && S.exp[i];
      if (cur && str(e.desc) && str(e.desc) !== cur.desc) items.push({ k: "exp", i: i, lab: "Missions : " + (cur.role || "expérience " + (i + 1)) + (cur.company ? " (" + cur.company + ")" : ""), old: cur.desc, val: str(e.desc) });
    });
    var kw = (Array.isArray(t.missing) ? t.missing : []).map(str).filter(Boolean).slice(0, 12);
    var tips = (Array.isArray(t.tips) ? t.tips : []).map(str).filter(Boolean).slice(0, 4);
    var h = "";
    if (typeof t.match === "number") h += '<p class="tl-score">Correspondance avec l\'offre avant adaptation : <strong>' + Math.max(0, Math.min(100, Math.round(t.match))) + ' %</strong> <span class="hint">(indication, pas une garantie)</span></p>';
    if (items.length) {
      h += '<ul class="tl-list">' + items.map(function (it, n) {
        return '<li><label class="tl-item"><input type="checkbox" checked data-n="' + n + '"><span><strong>' + esc(it.lab) + '</strong><span class="tl-new">' + esc(it.val).replace(/\n/g, "<br>") + '</span>' + (it.old ? '<span class="tl-old">Avant : ' + esc(it.old).replace(/\n/g, "<br>") + '</span>' : '') + '</span></label></li>';
      }).join("") + '</ul><div class="ai-actions"><button type="button" class="btn btn-sm" id="tl-apply">Appliquer la sélection</button></div>';
    } else h += '<p class="hint">Votre CV correspond déjà bien à l\'offre : rien à changer dans le texte.</p>';
    if (kw.length) h += '<p class="tl-h">Mots-clés de l\'offre absents de votre CV</p><p class="tl-kw">' + kw.map(function (k) { return '<span>' + esc(k) + '</span>'; }).join("") + '</p><p class="hint">Ajoutez-les seulement s\'ils sont vrais pour vous : un recruteur vérifiera en entretien.</p>';
    if (tips.length) h += '<p class="tl-h">Conseils</p><ul class="tl-tips">' + tips.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    tlRes.innerHTML = h; tlRes.hidden = false;
    var ap = $("#tl-apply");
    if (ap) ap.addEventListener("click", function () {
      var n2 = clone(S), done = 0;
      $$("#tl-res input[data-n]").forEach(function (c) { if (!c.checked) return; var it = items[+c.dataset.n]; if (it.k === "exp") n2.exp[it.i].desc = it.val; else n2[it.k] = it.val; done++; });
      if (!done) { tlMsg.textContent = "Cochez au moins une proposition."; return; }
      tlPrev = clone(S); setState(n2); tlUndo.hidden = false; tlRes.hidden = true;
      tlMsg.textContent = done + " modification" + (done > 1 ? "s appliquées" : " appliquée") + ". Relisez votre CV : l'IA peut se tromper.";
    });
  }

  function rewrite(btn, get, set, field) {  // exposé plus bas pour les listes
    var t = get().trim(); if (t.length < 5) { btn.textContent = "Écrivez d'abord quelques mots"; setTimeout(function () { btn.textContent = "Reformuler avec l'IA"; }, 2500); return; }
    btn.disabled = true; btn.textContent = "Reformulation...";
    aiPost("/rewrite", { text: t, field: field }).then(function (j) {
      btn.disabled = false;
      if (j.error || !j.text) { btn.textContent = ERR[j.error] ? ERR[j.error].split(".")[0] : "Échec, réessayez"; setTimeout(function () { btn.textContent = "Reformuler avec l'IA"; }, 3500); return; }
      set(j.text); btn.textContent = "Reformulé" + (typeof j.left === "number" ? " (reste " + j.left + " utilisation" + (j.left > 1 ? "s" : "") + ")" : "");
      setTimeout(function () { btn.textContent = "Reformuler avec l'IA"; }, 4000);
    });
  }
  window.CVAI = { rewrite: rewrite };
  $$("[data-rw]").forEach(function (b) {
    b.addEventListener("click", function () {
      var k = b.dataset.rw, el = $('[data-k="' + k + '"]');
      rewrite(b, function () { return el.value; }, function (v) { el.value = v; S[k] = v; changed(); }, k);
    });
  });

  /* ---------- repartir de zéro ---------- */
  var rst = $("#reset"), rstT = 0;
  rst.addEventListener("click", function () {
    if (rst.dataset.arm !== "1") {
      rst.dataset.arm = "1"; rst.textContent = "Confirmer l'effacement";
      rstT = setTimeout(function () { rst.dataset.arm = ""; rst.textContent = "Repartir de zéro"; }, 4000); return;
    }
    clearTimeout(rstT); rst.dataset.arm = ""; rst.textContent = "Repartir de zéro";
    var keepTpl = S.tpl, keepAcc = S.accent, keepFnt = S.fnt || {}, keepSize = S.size || "", keepSpace = S.space || "";
    S = { tpl: keepTpl, accent: keepAcc, fnt: keepFnt, size: keepSize, space: keepSpace, photo: "", name: "", title: "", email: "", phone: "", city: "", link: "", summary: "", exp: [clone(LISTS.exp.blank)], edu: [clone(LISTS.edu.blank)], skills: "", langs: [clone(LISTS.langs.blank)], hobbies: "" };
    $$("[data-k]").forEach(function (el) { el.value = ""; });
    Object.keys(LISTS).forEach(renderList); photoUI(); changed();
  });


  /* ---------- sauvegarde en fichier (sans compte) ---------- */
  $("#export").addEventListener("click", function () {
    var n = (S.name || "").trim().replace(/[^\w\u00C0-\u017F-]+/g, "_") || "cv";
    var a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([JSON.stringify(S)], { type: "application/json" }));
    a.download = "cvlibre-" + n + ".json"; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
  $("#import").addEventListener("click", function () { $("#import-file").click(); });
  $("#import-file").addEventListener("change", function (e) {
    var f = e.target.files && e.target.files[0]; e.target.value = "";
    if (!f) return;
    if (f.size > 3e6) { passMsg.textContent = "Ce fichier est trop volumineux pour être un CV CVLibre."; passMsg.hidden = false; return; }
    var r = new FileReader();
    r.onload = function () {
      try {
        var o = JSON.parse(r.result);
        if (!o || typeof o !== "object" || !Array.isArray(o.exp) || typeof o.name !== "string") throw 0;
        passMsg.hidden = true; setState(Object.assign(clone(CVR.sample), o));
      } catch (x) { passMsg.textContent = "Ce fichier n'est pas un CV exporté depuis CVLibre."; passMsg.hidden = false; }
    };
    r.readAsText(f);
  });

  /* ---------- onglets mobile ---------- */
  $$(".mobile-tabs button").forEach(function (b) {
    b.addEventListener("click", function () {
      document.body.dataset.tab = b.dataset.tab;
      $$(".mobile-tabs button").forEach(function (x) { x.setAttribute("aria-pressed", String(x === b)); });
      setTimeout(fit, 30); window.scrollTo(0, 0);
    });
  });

  window.addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  photoUI(); paint();
})();
