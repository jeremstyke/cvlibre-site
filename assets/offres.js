/* Offres d'emploi (Careerjet, et La bonne alternance pour l'alternance, via le serveur CVLibre) + passage vers l'adaptation du CV et la lettre. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var API = "https://cvlibre-ai-production.up.railway.app/jobs", OK = "cvlibre.offre", LAST = "cvlibre.jobsearch";
  var list = $("#jb-list"), msg = $("#jb-msg"), more = $("#jb-more"), go = $("#jb-go");
  var cur = { q: "", ville: "", contrat: "", page: 0 }, shown = 0, total = 0, offres = {};
  function stat(e, x) { try { window.CVSTAT && window.CVSTAT(e, x); } catch (er) {} }
  function el(tag, cls, txt) { var d = document.createElement(tag); if (cls) d.className = cls; if (txt != null) d.textContent = txt; return d; }
  function ago(iso) {
    var t = Date.parse(iso); if (!t) return "";
    var d = Math.floor((Date.now() - t) / 864e5);
    return d <= 0 ? "Publiée aujourd'hui" : d === 1 ? "Publiée hier" : "Publiée il y a " + d + " jours";
  }
  function handoff(o) {
    try { localStorage.setItem(OK, JSON.stringify({ titre: o.titre, entreprise: o.entreprise, lieu: o.lieu, ad: (o.titre + (o.entreprise ? " - " + o.entreprise : "") + (o.lieu ? " - " + o.lieu : "") + (o.contrat ? " - " + o.contrat : "") + "\n\n" + o.desc).slice(0, 5000), url: o.url, at: Date.now() })); } catch (e) {}
  }
  function card(o) {
    offres[o.id] = o;
    var c = el("article", "jb-card lt-card");
    if (o.own) { c.classList.add("jb-own"); c.appendChild(el("p", "jb-badge", "Publiée sur CVLibre · offre vérifiée")); }
    var h = el("h2", "jb-t", o.titre); c.appendChild(h);
    var m = el("p", "jb-meta", [o.entreprise, o.lieu].filter(Boolean).join(" · ") || "Entreprise non précisée"); c.appendChild(m);
    var tags = el("p", "jb-tags");
    [o.contrat, o.duree, String(o.salaire || "").replace(/ per hour/i, " de l'heure").replace(/ per year/i, " par an").replace(/ per month/i, " par mois").replace(/ per week/i, " par semaine").replace(/ per day/i, " par jour")].filter(Boolean).forEach(function (t) { tags.appendChild(el("span", "jb-tag", t)); });
    if (tags.childNodes.length) c.appendChild(tags);
    var d = el("p", "jb-desc", o.desc.length > 260 ? o.desc.slice(0, 260).replace(/\s+\S*$/, "") + "..." : o.desc); c.appendChild(d);
    if (o.desc.length > 260) {
      var tg = el("button", "link-btn", "Lire toute l'offre"); tg.type = "button";
      tg.addEventListener("click", function () { var full = d.dataset.full === "1"; d.textContent = full ? o.desc.slice(0, 260).replace(/\s+\S*$/, "") + "..." : o.desc; d.dataset.full = full ? "" : "1"; tg.textContent = full ? "Lire toute l'offre" : "Réduire"; });
      c.appendChild(tg);
    }
    var a = el("div", "jb-act");
    var see = el("a", "btn btn-sm", "Voir l'offre et postuler"); see.href = o.url; see.target = "_blank"; see.rel = "noopener nofollow";
    see.addEventListener("click", function () { stat("job_open", o.id); });
    var cv = el("a", "btn btn-sm btn-ghost", "Adapter mon CV"); cv.href = "/creer-un-cv/?offre=1";
    cv.addEventListener("click", function () { handoff(o); stat("job_tailor", o.id); });
    var lt = el("a", "btn btn-sm btn-ghost", "Lettre de motivation"); lt.href = "/lettre-de-motivation/?offre=1";
    lt.addEventListener("click", function () { handoff(o); stat("job_letter", o.id); });
    a.appendChild(see); a.appendChild(cv); a.appendChild(lt); c.appendChild(a);
    var dt = ago(o.date); if (dt) c.appendChild(el("p", "jb-date", dt));
    return c;
  }
  /* Offres publiées par les recruteurs sur CVLibre (validées), affichées en premier. */
  var SB = "https://zltqrnflowxkycrjmhbx.supabase.co/rest/v1/job_posts", KEY = "sb_publishable_KVXGhm7oHvaymjzOZyfp6A_03X6EcXr", ownAll = null;
  var fold = function (t) { return String(t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); };
  function own() {
    if (ownAll) return Promise.resolve(ownAll);
    return fetch(SB + "?select=id,company,title,city,contract,hours,salary,description,apply_url,apply_email,approved_at&status=eq.approved&expires_at=gt." + encodeURIComponent(new Date().toISOString()) + "&order=approved_at.desc&limit=200", { headers: { apikey: KEY } })
      .then(function (r) { return r.ok ? r.json() : []; }, function () { return []; })
      .then(function (l) { ownAll = (l || []).map(function (o) { return { id: "cvl-" + o.id, own: true, titre: o.title, entreprise: o.company, lieu: o.city, contrat: o.contract, duree: o.hours || "", salaire: o.salary || "", date: o.approved_at, desc: o.description, url: o.apply_url || ("mailto:" + o.apply_email + "?subject=" + encodeURIComponent("Candidature : " + o.title)) }; }); return ownAll; });
  }
  function ownMatch(list) {
    var ws = fold(cur.q).split(/[^a-z0-9]+/).filter(function (w) { return w.length > 2; }), v = fold(cur.ville).replace(/[^a-z0-9]/g, "");
    var ct = { CDI: "CDI", CDD: "CDD", MIS: "Intérim", SAI: "Saisonnier", ALT: "Alternance" }[cur.contrat];
    return list.filter(function (o) {
      if (ct && o.contrat !== ct) return false;
      if (ws.length && !ws.some(function (w) { return fold(o.titre + " " + o.desc).indexOf(w) > -1; })) return false;
      if (v && fold(o.lieu).replace(/[^a-z0-9]/g, "").indexOf(v) === -1) return false;
      return true;
    }).slice(0, cur.recent ? 5 : 10);
  }
  function run(reset) {
    if (reset) { cur.page = 0; shown = 0; list.textContent = ""; }
    go.disabled = true; more.hidden = true; msg.textContent = "Recherche des offres...";
    Promise.all([
      fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(cur) })
        .then(function (r) { return r.json().catch(function () { return { error: "api" }; }); }, function () { return { error: "net" }; }),
      reset ? own().then(ownMatch) : Promise.resolve([])
    ]).then(function (res) {
        var j = res[0] || {}, mine = res[1] || [];
        if (j.error && mine.length) j = { offres: [], total: 0, lieu: cur.ville };
        j._own = mine;
        go.disabled = false;
        if (!j || j.error) { msg.textContent = j && j.error === "empty" ? "Indiquez un métier ou une ville." : j && j.error === "limit" ? "Trop de recherches aujourd'hui. Réessayez demain." : "La recherche d'offres ne répond pas pour le moment. Réessayez dans quelques minutes."; return; }
        if (j.needCity) { msg.textContent = "Pour l'alternance, indiquez une ville ou un numéro de département."; return; }
        if (j.lieu === null) { msg.textContent = "Ville introuvable. Vérifiez l'orthographe ou indiquez le numéro du département."; return; }
        total = j.total || 0;
        if (reset && j._own) j._own.forEach(function (o) { list.appendChild(card(o)); shown++; total++; });
        (j.offres || []).forEach(function (o) { list.appendChild(card(o)); shown++; });
        var cnt = $("#jb-count");
        if (cur.recent && shown) {
          if (cnt && total > 100) { cnt.hidden = false; cnt.textContent = ""; var bn = el("strong", "", total.toLocaleString("fr-FR")); cnt.appendChild(bn); cnt.appendChild(document.createTextNode(" offres d'emploi en ce moment en France. Voici les plus récentes.")); }
          msg.textContent = "Indiquez un métier et une ville, ou touchez « Autour de moi », pour trouver celles qui vous correspondent.";
        }
        else msg.textContent = shown ? total.toLocaleString("fr-FR") + " offre" + (total > 1 ? "s" : "") + (cur.q ? " pour « " + cur.q + " »" : "") + (j.lieu ? " autour de " + j.lieu : "") + "." : "Aucune offre trouvée. Essayez un autre mot-clé, ou une ville plus grande.";
        more.hidden = !(shown < total && cur.page < 9);
        if (reset && !cur.recent) stat("job_search", (cur.q || "") .slice(0, 40));
      });
  }
  $("#jb-form").addEventListener("submit", function (e) {
    e.preventDefault();
    cur.recent = 0; if ($("#jb-count")) $("#jb-count").hidden = true; cur.q = $("#jb-q").value.trim(); cur.ville = $("#jb-ville").value.trim(); cur.contrat = $("#jb-contrat").value;
    if (!cur.q && !cur.ville) { msg.textContent = "Indiquez un métier ou une ville."; return; }
    try { localStorage.setItem(LAST, JSON.stringify({ q: cur.q, ville: cur.ville, contrat: cur.contrat })); } catch (er) {}
    try { history.replaceState(null, "", "?" + new URLSearchParams({ q: cur.q, ville: cur.ville }).toString()); } catch (er) {}
    run(true);
  });
  more.addEventListener("click", function () { cur.page++; run(false); });
  /* Pré-remplissage : paramètres de l'adresse, dernière recherche, sinon le titre et la ville du CV. */
  var p = new URLSearchParams(location.search), pre = {};
  try { pre = JSON.parse(localStorage.getItem(LAST) || "{}") || {}; } catch (e) {}
  if (!pre.q && !pre.ville) { try { var cvd = JSON.parse(localStorage.getItem("cvlibre.v1") || "{}") || {}; pre = { q: cvd.title || "", ville: cvd.city || "" }; } catch (e) {} }
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
