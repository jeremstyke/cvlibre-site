/* 13 nov 2026 (Jeremy) : croissance ou déclin du site, période en cours comparée à la période précédente de même durée. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var A = window.CVAUTH, days = 1, busy = false;
  if (!A || !$("#gr")) return;
  var N = function (n) { return Number(n || 0).toLocaleString("fr-FR"); };
  var LBL = { entries: "Visites", view: "Pages vues", pdf: "CV téléchargés", letter_pdf: "Lettres téléchargées", ai: "Utilisations de l'IA", courrier: "Courriers rédigés", job_search: "Recherches d'offres", job_open: "Clics vers une offre", rc_post: "Offres de recruteurs", users: "Nouveaux comptes" };
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function delta(cur, prev) {
    if (!prev && !cur) return { t: "=", c: "gr-eq" };
    if (!prev) return { t: "▲ nouveau", c: "gr-up" };
    var p = Math.round(((cur - prev) / prev) * 100);
    return p > 0 ? { t: "▲ +" + p + " %", c: "gr-up" } : p < 0 ? { t: "▼ " + p + " %", c: "gr-down" } : { t: "= 0 %", c: "gr-eq" };
  }
  function movers(box, list, up, name) {
    box.textContent = "";
    var l = (list || []).map(function (r) { return { k: r.k, d: Number(r.cur) - Number(r.prev), cur: Number(r.cur), prev: Number(r.prev) }; })
      .filter(function (r) { return up ? r.d > 0 : r.d < 0; }).sort(function (a, b) { return up ? b.d - a.d : a.d - b.d; }).slice(0, 6);
    if (!l.length) { box.appendChild(el("p", "st-note", up ? "Aucune hausse sur la période." : "Aucune baisse sur la période.")); return; }
    l.forEach(function (r) {
      var row = el("div", "gr-row");
      row.appendChild(el("span", "", name(r.k)));
      var v = el("span", up ? "" : "", (r.d > 0 ? "+" : "") + N(r.d) + " (" + N(r.prev) + " → " + N(r.cur) + ")");
      v.style.color = up ? "#166534" : "#9a1c1c"; row.appendChild(v); box.appendChild(row);
    });
  }
  function show(d) {
    var per = days === 1 ? "24 dernières heures" : days + " derniers jours";
    var prv = days === 1 ? "les 24 h d'avant" : "les " + days + " jours d'avant";
    var sub = "Les " + per + " comparées à " + prv + ".";
    if (d.first && Date.now() - Date.parse(d.first) < 2 * days * 864e5) sub += " Attention : les statistiques ont commencé le " + new Date(d.first).toLocaleDateString("fr-FR") + ", la période précédente est donc incomplète.";
    $("#gr-sub").textContent = sub;
    var k = $("#gr-kpis"); k.textContent = "";
    (d.m || []).concat([{ k: "users", cur: d.users.cur, prev: d.users.prev }]).forEach(function (m) {
      var c = el("div", "gr-k"); c.appendChild(el("b", "", N(m.cur))); c.appendChild(el("span", "gr-l", LBL[m.k] || m.k));
      var dl = delta(Number(m.cur), Number(m.prev)); var s = el("span", "gr-d " + dl.c, dl.t); s.title = "Avant : " + N(m.prev); c.appendChild(s);
      c.appendChild(el("span", "gr-l", "avant : " + N(m.prev))); k.appendChild(c);
    });
    var ch = $("#gr-chart"); ch.textContent = "";
    var ds = d.days || [], mx = Math.max.apply(null, ds.map(function (r) { return Number(r.c); }).concat([1])), half = ds.length - Math.max(1, days);
    ds.forEach(function (r, i) {
      var b = el("i", i < half ? "prev" : ""); b.style.height = Math.max(2, Math.round((Number(r.c) / mx) * 130)) + "px";
      b.title = new Date(r.day).toLocaleDateString("fr-FR") + " : " + N(r.c) + " visites"; ch.appendChild(b);
    });
    var pg = function (x) { return x === "/" ? "Accueil" : x; }, rf = function (x) { return x || "(direct ou inconnu)"; };
    movers($("#gr-pup"), d.pages, true, pg); movers($("#gr-pdown"), d.pages, false, pg);
    movers($("#gr-rup"), d.refs, true, rf); movers($("#gr-rdown"), d.refs, false, rf);
  }
  function load() {
    if (busy) return; busy = true;
    A.sb.rpc("stats_growth", { days_: days }).then(function (r) { busy = false; if (!r.error) show(r.data || {}); else $("#gr-sub").textContent = "Chargement impossible."; });
  }
  Array.prototype.forEach.call(document.querySelectorAll("#gr-days button"), function (b) {
    b.addEventListener("click", function () {
      days = +b.dataset.d; Array.prototype.forEach.call(document.querySelectorAll("#gr-days button"), function (x) { x.setAttribute("aria-pressed", String(x === b)); }); load();
    });
  });
  A.on(function (user) { if (user) load(); });
})();
