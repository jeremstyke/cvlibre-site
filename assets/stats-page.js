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
  var AI = { fill: "Remplir le CV", rewrite: "Reformuler", tailor: "Adapter à une offre", letter: "Lettre de motivation", courrier: "Courriers emploi", support: "Aide du site" };
  var CTN = { demission: "Lettre de démission", rupture: "Rupture conventionnelle", relance: "Relance après entretien", candidature: "E-mail de candidature" };
  function show(d) {
    var ev = d.ev || {};
    var e = function (k) { return Number(ev[k] || 0); };
    var entries = (d.days || []).reduce(function (s, r) { return s + Number(r.entries || 0); }, 0);
    var ai = (d.ai || []).filter(function (r) { return r.k !== "usage"; });
    var aiN = ai.reduce(function (s, r) { return s + Number(r.c || 0); }, 0);
    var dons = e("pass_link") + e("after_don");
    var k = $("#st-kpis"); k.textContent = "";
    kpi(k, N(entries), "Visites (entrées sur le site)");
    kpi(k, N(e("view")), "Pages vues");
    kpi(k, N(e("pdf")), "CV téléchargés en PDF");
    kpi(k, N(e("letter_pdf")), "Lettres téléchargées en PDF");
    kpi(k, N(aiN), "Utilisations de l'IA");
    kpi(k, N(e("courrier_ia") + e("courrier_modele")), "Courriers rédigés");
    kpi(k, N(e("job_search")), "Recherches d'offres d'emploi");
    kpi(k, N(e("job_open")), "Clics vers une offre (Careerjet paie au clic)");
    kpi(k, N(e("job_tailor") + e("job_letter")), "Offre vers CV ou lettre");
    kpi(k, N(e("rc_post")), "Offres envoyées par des recruteurs");
    kpi(k, N(dons), "Clics vers le Pass");
    kpi(k, N(d.users), "Comptes (+" + N(d.users_new) + ")");
    var ch = $("#st-chart"); ch.textContent = "";
    var mx = Math.max.apply(null, (d.days || []).map(function (r) { return Number(r.views || 0); }).concat([1]));
    (d.days || []).forEach(function (r) { var i = document.createElement("i"); i.style.height = Math.max(2, Math.round((Number(r.views || 0) / mx) * 130)) + "px"; i.title = r.day + " : " + N(r.views) + " pages vues"; ch.appendChild(i); });
    rows($("#st-funnel"), [
      { k: "Pages vues", c: e("view") }, { k: "Modèle choisi (créateur ou galerie de l'accueil)", c: e("tpl_pick") + e("gal_pick") },
      { k: "CV téléchargé en PDF", c: e("pdf") }, { k: "Après le PDF : clic Créer mon compte", c: e("after_account") },
      { k: "Après le PDF : clic Découvrir le Pass", c: e("after_don") }, { k: "Connexion demandée (e-mail ou Google)", c: e("login_mail") + e("login_google") },
      { k: "Tous les clics vers le Pass", c: dons }, { k: "Clics Acheter le Pass", c: e("pass_buy") }
    ]);
    var cb = $("#st-courriers"); cb.textContent = "";
    (d.courriers || []).forEach(function (r) {
      var p = document.createElement("p"); p.className = "st-row st-ct";
      var b = document.createElement("strong"); b.textContent = CTN[r.k] || r.k; p.appendChild(b);
      p.appendChild(document.createTextNode(" : " + N(r.vues) + " pages vues, " + N(r.ia) + " avec l'IA, " + N(r.modele) + " modèle sans IA, " + N(r["export"]) + " copiés, envoyés ou imprimés"));
      cb.appendChild(p);
    });
    rows($("#st-pages"), d.pages || []);
    rows($("#st-refs"), (d.refs || []).map(function (r) { return { k: r.k || "(direct ou inconnu)", c: r.c }; }));
    rows($("#st-tpl"), d.tpl || [], function (x) { return TPL[x] || (x.charAt(0).toUpperCase() + x.slice(1)); });
    rows($("#st-ai"), ai, function (x) { return AI[x] || x; });
    var n = document.createElement("p"); n.className = "st-note"; n.textContent = "Appareils : " + N(d.mobile) + " mobile, " + N(d.desktop) + " ordinateur. Données anonymes, sans cookie.";
    $("#st-ai").appendChild(n);
  }
  /* Modération des offres publiées par les recruteurs. */
  function mod() {
    var box = $("#st-mod-list"); box.textContent = "";
    A.sb.rpc("job_posts_pending").then(function (r) {
      if (r.error) { box.textContent = "Chargement impossible."; return; }
      if (!r.data.length) { var p0 = document.createElement("p"); p0.className = "st-note"; p0.textContent = "Aucune offre en attente."; box.appendChild(p0); return; }
      r.data.forEach(function (o) {
        var c = document.createElement("div"); c.className = "st-job";
        var h = document.createElement("p"); var b = document.createElement("strong"); b.textContent = (({ GB: "🇬🇧 ", DE: "🇩🇪 ", US: "🇺🇸 ", CA: "🇨🇦 ", AU: "🇦🇺 ", NZ: "🇳🇿 " })[o.country] || "") + o.title + " · " + o.company + " · " + o.city + " · " + o.contract; h.appendChild(b); c.appendChild(h);
        var meta = document.createElement("p"); meta.className = "st-note";
        meta.textContent = [o.salary, o.hours, o.siret ? "SIRET " + o.siret : "Sans SIRET", o.contact_name, "Postuler : " + (o.apply_url || o.apply_email), "Reçue le " + new Date(o.created_at).toLocaleString("fr-FR")].filter(Boolean).join(" · ");
        c.appendChild(meta);
        var d = document.createElement("p"); d.className = "st-desc"; d.textContent = o.description; c.appendChild(d);
        var why = document.createElement("input"); why.placeholder = "Motif du refus (visible par le recruteur)"; why.maxLength = 300; why.className = "st-why";
        var ok = document.createElement("button"); ok.type = "button"; ok.className = "btn btn-sm"; ok.textContent = "✅ Publier";
        var no = document.createElement("button"); no.type = "button"; no.className = "btn btn-ghost btn-sm"; no.textContent = "❌ Refuser";
        function act(yes) { ok.disabled = no.disabled = true; A.sb.rpc("job_posts_moderate", { pid: o.id, ok: yes, reason: why.value.trim() || null }).then(function (x) { if (x.error) { ok.disabled = no.disabled = false; alert0(c, "Échec"); } else c.remove(); if (!box.children.length) mod(); }); }
        function alert0(el, t) { var e = document.createElement("p"); e.className = "st-note"; e.textContent = t; el.appendChild(e); }
        ok.addEventListener("click", function () { act(true); }); no.addEventListener("click", function () { act(false); });
        var bar = document.createElement("div"); bar.className = "st-jobbar"; bar.appendChild(ok); bar.appendChild(no); bar.appendChild(why);
        c.appendChild(bar); box.appendChild(c);
      });
    });
  }
  function load() {
    mod();
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
