/* Tableau de bord des statistiques : réservé au compte propriétaire (contrôlé côté base). */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var A = window.CVAUTH, days = 30;
  if (!A) { $("#st-who").textContent = "Cette page n'a pas pu se charger. Rechargez-la."; return; }
  var N = function (n) { return Number(n || 0).toLocaleString("fr-FR"); };
  function pct(a, b) { return b ? Math.round((a / b) * 100) + " %" : "0 %"; }
  function rows(box, list, label) {
    box.textContent = "";
    if (!list || !list.length) { var p = document.createElement("p"); p.className = "st-note"; p.textContent = "Pas encore de données."; box.appendChild(p); return; }
    var max = Math.max.apply(null, list.map(function (r) { return r.c; })) || 1;
    list.forEach(function (r) {
      var d = document.createElement("div"); d.className = "st-row";
      var a = document.createElement("span"); a.textContent = label ? label(r.k) : (r.k || "(direct)");
      var b = document.createElement("span"); b.textContent = N(r.c);
      var u = document.createElement("u"); var i = document.createElement("i"); i.style.width = Math.max(3, Math.round((r.c / max) * 100)) + "%"; u.appendChild(i);
      d.appendChild(a); d.appendChild(b); d.appendChild(u); box.appendChild(d);
    });
  }
  function kpi(box, n, label) { var d = document.createElement("div"); d.className = "st-kpi"; var b = document.createElement("b"); b.textContent = n; var s = document.createElement("span"); s.textContent = label; d.appendChild(b); d.appendChild(s); box.appendChild(d); }
  var TPL = { classique: "Classique", moderne: "Moderne", sobre: "Sobre", elegant: "Élégant", bandeau: "Bandeau", chrono: "Chronologie", marge: "Marge", nuit: "Nuit", cadre: "Cadre", ruban: "Ruban", journal: "Journal", bandes: "Bandes", cartes: "Cartes" };
  var AI = { fill: "Remplir avec l'IA", rewrite: "Reformuler", letter: "Lettre de motivation", support: "Aide du site" };
  function show(d) {
    var ev = d.ev || {};
    var e = function (k) { return Number(ev[k] || 0); };
    var entries = (d.days || []).reduce(function (s, r) { return s + Number(r.entries || 0); }, 0);
    var k = $("#st-kpis"); k.textContent = "";
    kpi(k, N(entries), "Visites (entrées sur le site)");
    kpi(k, N(e("view")), "Pages vues");
    kpi(k, N(e("pdf")), "PDF téléchargés");
    kpi(k, pct(e("pass_open"), e("pdf")), "Ouvertures du Pass / PDF");
    kpi(k, N(e("buy_pass") + e("buy_pro")), "Clics vers le paiement");
    kpi(k, N(e("key_ok")), "Clés activées");
    kpi(k, N(d.users), "Comptes (+" + N(d.users_new) + ")");
    kpi(k, N(d.passes), "Pass et abonnements enregistrés");
    var ch = $("#st-chart"); ch.textContent = "";
    var mx = Math.max.apply(null, (d.days || []).map(function (r) { return Number(r.views || 0); }).concat([1]));
    (d.days || []).forEach(function (r) { var i = document.createElement("i"); i.style.height = Math.max(2, Math.round((Number(r.views || 0) / mx) * 130)) + "px"; i.title = r.day + " : " + N(r.views) + " pages vues"; ch.appendChild(i); });
    rows($("#st-funnel"), [
      { k: "Pages vues", c: e("view") }, { k: "PDF téléchargés (avec bandeau : " + N(d.pdf_wm) + ")", c: e("pdf") },
      { k: "Fenêtre « Retirer le bandeau » : clic sur Retirer", c: e("wm_remove") }, { k: "Fenêtre du Pass ouverte", c: e("pass_open") },
      { k: "Clic Acheter le Pass", c: e("buy_pass") }, { k: "Clé activée", c: e("key_ok") },
      { k: "Modèle réservé touché sans Pass", c: e("tpl_locked") }
    ]);
    rows($("#st-pages"), d.pages || []);
    rows($("#st-refs"), (d.refs || []).map(function (r) { return { k: r.k || "(direct ou inconnu)", c: r.c }; }));
    rows($("#st-tpl"), d.tpl || [], function (x) { return TPL[x] || x; });
    var ai = (d.ai || []).map(function (r) { return { k: r.k, c: r.c }; });
    rows($("#st-ai"), ai, function (x) { return AI[x] || x; });
    var n = document.createElement("p"); n.className = "st-note"; n.textContent = "Appareils : " + N(d.mobile) + " mobile, " + N(d.desktop) + " ordinateur. Blocages IA (accès réservé) : " + N(e("ai_402")) + ". Données anonymes, sans cookie.";
    $("#st-ai").appendChild(n);
  }
  function load() {
    $("#st-err").hidden = true;
    A.sb.rpc("stats_summary", { days_: days }).then(function (r) {
      if (r.error) { $("#st-err").hidden = false; $("#st-err").textContent = "Accès refusé ou chargement impossible. Connectez-vous avec le compte propriétaire."; return; }
      show(r.data || {});
    });
  }
  $("#st-login").addEventListener("click", function () { A.open(); });
  Array.prototype.forEach.call(document.querySelectorAll("#st-days button"), function (b) {
    b.addEventListener("click", function () {
      days = +b.dataset.d; Array.prototype.forEach.call(document.querySelectorAll("#st-days button"), function (x) { x.setAttribute("aria-pressed", String(x === b)); }); load();
    });
  });
  A.on(function (user) {
    $("#st-out").hidden = !!user; $("#st-in").hidden = !user;
    if (!user) { $("#st-who").textContent = "Vous n'êtes pas connecté."; A.open(); return; }
    $("#st-who").textContent = "Connecté : " + (user.email || ""); A.close(); load();
  });
})();
