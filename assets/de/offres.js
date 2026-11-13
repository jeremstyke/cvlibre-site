/* Généré par tools/i18n/build_de.py depuis assets/offres.js : ne pas modifier à la main. */
/* Offres d'emploi (Careerjet, et La bonne alternance pour l'alternance, via le serveur CVLibre) + passage vers l'adaptation du CV et la lettre. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var API = "https://cvlibre-ai-production.up.railway.app/jobs", OK = "cvlibre.offre", LAST = "cvlibre.de.jobsearch";
  var list = $("#jb-list"), msg = $("#jb-msg"), more = $("#jb-more"), go = $("#jb-go");
  /* 13 nov 2026 (Jeremy) : une pub toutes les 8 offres, sans limite */
  function adAfter(n) {
    if (n % 8 || !document.querySelector('script[src*="adsbygoogle.js"]')) return;
    var d = document.createElement("div"); d.className = "ad-in jb-ad";
    d.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="-5n+c2-23-51+w1" data-ad-client="ca-pub-8638687738606649" data-ad-slot="6195574268"></ins>';
    list.appendChild(d); try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
  }
  var cur = { q: "", ville: "", contrat: "", page: 0 }, shown = 0, total = 0, offres = {};
  function stat(e, x) { try { window.CVSTAT && window.CVSTAT(e, x); } catch (er) {} }
  function el(tag, cls, txt) { var d = document.createElement(tag); if (cls) d.className = cls; if (txt != null) d.textContent = txt; return d; }
  function ago(iso) {
    var t = Date.parse(iso); if (!t) return "";
    var d = Math.floor((Date.now() - t) / 864e5);
    return d <= 0 ? "Heute veröffentlicht" : d === 1 ? "Gestern veröffentlicht" : "Vor " + d + " Tagen veröffentlicht";
  }
  function handoff(o) {
    try { localStorage.setItem(OK, JSON.stringify({ titre: o.titre, entreprise: o.entreprise, lieu: o.lieu, ad: (o.titre + (o.entreprise ? " - " + o.entreprise : "") + (o.lieu ? " - " + o.lieu : "") + (o.contrat ? " - " + o.contrat : "") + "\n\n" + o.desc).slice(0, 5000), url: o.url, at: Date.now() })); } catch (e) {}
  }
  function card(o) {
    offres[o.id] = o;
    var c = el("article", "jb-card lt-card");
    if (o.own) { hit(o.id, "view"); c.classList.add("jb-own"); c.appendChild(el("p", "jb-badge", "Auf CVLibre veröffentlicht · geprüfte Stelle")); }
    var h = el("h2", "jb-t", o.titre); c.appendChild(h);
    var m = el("p", "jb-meta", [o.entreprise, o.lieu].filter(Boolean).join(" · ") || "Unternehmen nicht angegeben"); c.appendChild(m);
    var tags = el("p", "jb-tags");
    [o.contrat, o.duree, String(o.salaire || "")].filter(Boolean).forEach(function (t) { tags.appendChild(el("span", "jb-tag", t)); });
    if (tags.childNodes.length) c.appendChild(tags);
    var ds = String(o.desc || ""), d = el("p", "jb-desc", ds.length > 260 ? ds.slice(0, 260).replace(/\s+\S*$/, "") + "..." : ds); c.appendChild(d);
    if (o.desc.length > 260) {
      var tg = el("button", "link-btn", "Ganze Anzeige lesen"); tg.type = "button";
      tg.addEventListener("click", function () { var full = d.dataset.full === "1"; d.textContent = full ? o.desc.slice(0, 260).replace(/\s+\S*$/, "") + "..." : o.desc; d.dataset.full = full ? "" : "1"; tg.textContent = full ? "Ganze Anzeige lesen" : "Weniger anzeigen"; });
      c.appendChild(tg);
    }
    var a = el("div", "jb-act");
    var see = el("a", "btn btn-sm", "Stelle ansehen und bewerben"); see.href = o.url; see.target = "_blank"; see.rel = "noopener nofollow";
    see.addEventListener("click", function () { stat("job_open", o.id); if (o.own) hit(o.id, "click"); });
    var cv = el("a", "btn btn-sm btn-ghost", "Lebenslauf anpassen"); cv.href = "/de/lebenslauf-erstellen/?offre=1";
    cv.addEventListener("click", function () { handoff(o); stat("job_tailor", o.id); });
    var lt = el("a", "btn btn-sm btn-ghost", "Anschreiben"); lt.href = "/de/anschreiben/?offre=1";
    lt.addEventListener("click", function () { handoff(o); stat("job_letter", o.id); });
    a.appendChild(see); a.appendChild(cv); a.appendChild(lt); c.appendChild(a);
    var dt = ago(o.date); if (dt) c.appendChild(el("p", "jb-date", dt));
    return c;
  }
  /* Compteur de vues et de clics des offres recruteurs (une vue par offre et par session). */
  var hq = { view: [], click: [] }, ht = null;
  function hit(id, k) {
    id = String(id).replace(/^cvl-/, "");
    if (k === "view") { var sk = "cvl_v_" + id; try { if (sessionStorage.getItem(sk)) return; sessionStorage.setItem(sk, "1"); } catch (e) {} }
    if (hq[k].indexOf(id) < 0) hq[k].push(id);
    clearTimeout(ht); ht = setTimeout(flush, k === "click" ? 0 : 1500);
  }
  function flush() {
    ["view", "click"].forEach(function (k) {
      if (!hq[k].length) return; var ids = hq[k].splice(0, 60);
      try { fetch(SB.replace("/job_posts", "/rpc/job_hit"), { method: "POST", keepalive: true, headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify({ p_ids: ids, p_kind: k }) }).catch(function () {}); } catch (e) {}
    });
  }
  /* Offres publiées par les recruteurs sur CVLibre (validées), affichées en premier. */
  var SB = "https://zltqrnflowxkycrjmhbx.supabase.co/rest/v1/job_posts", KEY = "sb_publishable_KVXGhm7oHvaymjzOZyfp6A_03X6EcXr", ownAll = null;
  var fold = function (t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };
  function own() {
    if (ownAll) return Promise.resolve(ownAll);
    return fetch(SB + "?select=id,company,title,city,contract,hours,salary,description,apply_url,apply_email,approved_at&country=eq.DE&status=eq.approved&expires_at=gt." + encodeURIComponent(new Date().toISOString()) + "&order=approved_at.desc&limit=200", { headers: { apikey: KEY } })
      .then(function (r) { return r.ok ? r.json() : []; }, function () { return []; })
      .then(function (l) { ownAll = (l || []).map(function (o) { return { id: "cvl-" + o.id, own: true, titre: o.title, entreprise: o.company, lieu: o.city, contrat: o.contract, duree: o.hours || "", salaire: o.salary || "", date: o.approved_at, desc: o.description, url: o.apply_url || ("mailto:" + o.apply_email + "?subject=" + encodeURIComponent("Bewerbung: " + o.title)) }; }); return ownAll; });
  }
  function ownMatch(list) {
    var ws = fold(cur.q).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; }), v = fold(cur.ville).replace(/[^a-z0-9]/g, "");
    var ct = { CDI: "Unbefristet", CDD: "Befristet", MIS: "Zeitarbeit", SAI: "Saisonarbeit", ALT: "Ausbildung" }[cur.contrat];
    return list.filter(function (o) {
      if (ct && o.contrat !== ct) return false;
      if (ws.length && !ws.some(function (w) { return fold(o.titre + " " + o.desc).indexOf(w) > -1; })) return false;
      if (v && fold(o.lieu).replace(/[^a-z0-9]/g, "").indexOf(v) === -1) return false;
      return true;
    }).slice(0, cur.recent ? 5 : 10);
  }
  function run(reset) {
    if (reset) { cur.page = 0; shown = 0; list.textContent = ""; }
    go.disabled = true; more.hidden = true; msg.textContent = "Stellen werden gesucht...";
    Promise.all([
      fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(Object.assign({ lang: "de" }, cur)) })
        .then(function (r) { return r.json().catch(function () { return { error: "api" }; }); }, function () { return { error: "net" }; }),
      reset ? own().then(ownMatch) : Promise.resolve([])
    ]).then(function (res) {
        var j = res[0] || {}, mine = res[1] || [];
        if (j.error && mine.length) j = { offres: [], total: 0, lieu: cur.ville };
        j._own = mine;
        go.disabled = false;
        if (!j || j.error) { msg.textContent = j && j.error === "empty" ? "Geben Sie eine Position oder einen Ort ein." : j && j.error === "limit" ? "Zu viele Suchen heute. Bitte versuchen Sie es morgen erneut." : "Die Jobsuche antwortet gerade nicht. Bitte versuchen Sie es in ein paar Minuten erneut."; return; }
        if (j.needCity) { msg.textContent = "Geben Sie einen Ort ein."; return; }
        if (j.lieu === null) { msg.textContent = "Ort nicht gefunden. Prüfen Sie die Schreibweise oder versuchen Sie eine Stadt in der Nähe."; return; }
        total = j.total || 0;
        if (reset && j._own) j._own.forEach(function (o) { list.appendChild(card(o)); shown++; total++; });
        (j.offres || []).forEach(function (o) { list.appendChild(card(o)); shown++; adAfter(shown); });
        var cnt = $("#jb-count");
        if (cur.recent && shown) {
          if (cnt && total > 100) { cnt.hidden = false; cnt.textContent = ""; var bn = el("strong", "", total.toLocaleString("de-DE")); cnt.appendChild(bn); cnt.appendChild(document.createTextNode(" Stellen sind gerade in Deutschland verfügbar. Hier sind die neuesten.")); }
          msg.textContent = "Geben Sie eine Position und einen Ort ein, um passende Stellen zu finden.";
        }
        else msg.textContent = shown ? total.toLocaleString("de-DE") + " Stelle" + (total > 1 ? "n" : "") + (cur.q ? " für \"" + cur.q + "\"" : "") + (j.lieu ? " in der Nähe von " + j.lieu : "") + "." : "Keine Stellen gefunden. Versuchen Sie ein anderes Stichwort oder eine größere Stadt.";
        more.hidden = !(shown < total && cur.page < 9);
        if (reset && !cur.recent) stat("job_search", (cur.q || "") .slice(0, 40));
      });
  }
  $("#jb-form").addEventListener("submit", function (e) {
    e.preventDefault();
    cur.recent = 0; if ($("#jb-count")) $("#jb-count").hidden = true; cur.q = $("#jb-q").value.trim(); cur.ville = $("#jb-ville").value.trim(); cur.contrat = $("#jb-contrat").value;
    if (!cur.q && !cur.ville) { msg.textContent = "Geben Sie eine Position oder einen Ort ein."; return; }
    try { localStorage.setItem(LAST, JSON.stringify({ q: cur.q, ville: cur.ville, contrat: cur.contrat })); } catch (er) {}
    try { history.replaceState(null, "", "?" + new URLSearchParams({ q: cur.q, ville: cur.ville }).toString()); } catch (er) {}
    run(true);
  });
  more.addEventListener("click", function () { cur.page++; run(false); });
  /* Pré-remplissage : paramètres de l'adresse, dernière recherche, sinon le titre et la ville du CV. */
  var p = new URLSearchParams(location.search), pre = {};
  try { pre = JSON.parse(localStorage.getItem(LAST) || "{}") || {}; } catch (e) {}
  if (!pre.q && !pre.ville) { try { var cvd = JSON.parse(localStorage.getItem("cvlibre.de.v1") || "{}") || {}; pre = { q: cvd.title || "", ville: cvd.city || "" }; } catch (e) {} }
  $("#jb-q").value = p.get("q") || pre.q || ""; $("#jb-ville").value = p.get("ville") || pre.ville || ""; if (pre.contrat && !p.get("q")) $("#jb-contrat").value = pre.contrat;
  /* Toujours des offres à l'arrivée : la recherche pré-remplie, sinon les dernières offres en France. */
  if ($("#jb-q").value.trim() || $("#jb-ville").value.trim()) $("#jb-form").dispatchEvent(new Event("submit", { cancelable: true }));
  else { cur = { q: "", ville: "", contrat: "", page: 0, recent: 1 }; run(true); }
  /* Autour de moi : position du navigateur (avec votre accord), convertie en nom de commune par l'API Géo de l'État. */
  var gb = $("#jb-geo");
  if (gb && !navigator.geolocation) gb.hidden = true;
  if (gb) gb.addEventListener("click", function () {
    gb.disabled = true; gb.textContent = "Localisation...";
    navigator.geolocation.getCurrentPosition(function (pos) {
      fetch("https://geo.api.gouv.fr/communes?lat=" + pos.coords.latitude.toFixed(3) + "&lon=" + pos.coords.longitude.toFixed(3) + "&fields=nom&limit=1")
        .then(function (r) { return r.json(); })
        .then(function (l) {
          gb.disabled = false; gb.textContent = "📍 Autour de moi";
          if (!l || !l[0]) { msg.textContent = "Position hors de France ou introuvable : indiquez votre ville."; return; }
          $("#jb-ville").value = l[0].nom; stat("job_geo");
          $("#jb-form").dispatchEvent(new Event("submit", { cancelable: true }));
        }, function () { gb.disabled = false; gb.textContent = "📍 Autour de moi"; msg.textContent = "Localisation impossible : indiquez votre ville."; });
    }, function () { gb.disabled = false; gb.textContent = "📍 Autour de moi"; msg.textContent = "Localisation refusée : indiquez votre ville, c'est tout aussi rapide."; }, { timeout: 10000, maximumAge: 600000 });
  });
})();
