/* 15 nov 2026 (Jeremy) : statistiques de demarches.cvlibre.com (PDF Démarches France) dans la page Stats de CVLibre. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var A = window.CVAUTH, days = 30;
  if (!A || !$("#dm")) return;
  var N = function (n) { return Number(n || 0).toLocaleString("fr-FR"); };
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function list(box, rows, name) {
    box.textContent = "";
    if (!rows || !rows.length) { box.appendChild(el("p", "st-note", "Rien pour l'instant.")); return; }
    rows.forEach(function (r) { var row = el("div", "gr-row"); row.appendChild(el("span", "", name(r.k))); row.appendChild(el("span", "", N(r.c))); box.appendChild(row); });
  }
  function show(d) {
    var k = $("#dm-kpis"); k.textContent = "";
    [["views", "Pages vues"], ["entries", "Visites"], ["today", "Pages vues aujourd'hui"], ["mobile", "Pages vues sur mobile"]].forEach(function (m) {
      var c = el("div", "gr-k"); c.appendChild(el("b", "", N(d[m[0]]))); c.appendChild(el("span", "gr-l", m[1])); k.appendChild(c);
    });
    var ch = $("#dm-chart"); ch.textContent = "";
    var ds = d.days || [], mx = Math.max.apply(null, ds.map(function (r) { return Number(r.c); }).concat([1]));
    ds.forEach(function (r) { var b = el("i", ""); b.style.height = Math.max(2, Math.round((Number(r.c) / mx) * 130)) + "px"; b.title = new Date(r.day).toLocaleDateString("fr-FR") + " : " + N(r.c) + " pages vues"; ch.appendChild(b); });
    list($("#dm-pages"), d.pages, function (x) { return x === "/" ? "Accueil" : x; });
    list($("#dm-refs"), d.refs, function (x) { return x || "(direct ou inconnu)"; });
  }
  function load() { A.sb.rpc("stats_demarches", { days_: days }).then(function (r) { if (!r.error) show(r.data || {}); else $("#dm-sub").textContent = "Chargement impossible."; }); }
  Array.prototype.forEach.call(document.querySelectorAll("#dm-days button"), function (b) {
    b.addEventListener("click", function () { days = +b.dataset.d; Array.prototype.forEach.call(document.querySelectorAll("#dm-days button"), function (x) { x.setAttribute("aria-pressed", String(x === b)); }); load(); });
  });
  A.on(function (user) { if (user) load(); });
})();
