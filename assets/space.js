/* Mon espace : liste des CV et des lettres enregistrés. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var A = window.CVAUTH;
  if (!A) { $("#sp-who").textContent = "Cette page n'a pas pu se charger. Rechargez-la."; return; }
  function fmt(d) { return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); }
  function row(box, table, r, openUrl, label) {
    var d = document.createElement("div"); d.className = "sp-row";
    var t = document.createElement("div"); t.className = "sp-t";
    var a = document.createElement("a"); a.href = openUrl; a.textContent = r.title || label;
    var s = document.createElement("span"); s.textContent = "Modifié le " + fmt(r.updated_at);
    t.appendChild(a); t.appendChild(s);
    var del = document.createElement("button"); del.type = "button"; del.className = "btn btn-ghost btn-sm"; del.textContent = "Supprimer";
    del.addEventListener("click", function () {
      if (del.dataset.arm !== "1") { del.dataset.arm = "1"; del.textContent = "Confirmer"; setTimeout(function () { del.dataset.arm = ""; del.textContent = "Supprimer"; }, 4000); return; }
      A.sb.from(table).delete().eq("id", r.id).then(function (x) { if (!x.error) { d.remove(); if (!box.children.length) empty(box, table); } else del.textContent = "Échec"; });
    });
    d.appendChild(t); d.appendChild(del); box.appendChild(d);
  }
  function empty(box, table) {
    var p = document.createElement("p"); p.className = "hint";
    p.textContent = table === "cvs" ? "Aucun CV enregistré pour l'instant." : "Aucune lettre enregistrée pour l'instant."; box.appendChild(p);
  }
  function fill(box, table, openBase, label) {
    box.textContent = "";
    A.sb.from(table).select("id,title,updated_at").order("updated_at", { ascending: false }).then(function (r) {
      if (r.error) { var p = document.createElement("p"); p.className = "hint"; p.textContent = "Chargement impossible pour le moment."; box.appendChild(p); return; }
      if (!r.data.length) { empty(box, table); return; }
      r.data.forEach(function (x) { row(box, table, x, openBase + x.id, label); });
    });
  }
  function offer() {
    var P = window.CVPASS, t = $("#sp-offer-txt"); if (!P || !t) return;
    t.textContent = !P.paid() ? "Offre gratuite : 1 CV gardé en ligne, PDF avec bandeau. Le Pass 1 an (4,99 € TTC) retire le bandeau et ouvre les lettres IA et 20 CV." :
      P.plan() === "pro" ? "Offre Pro active : CV de plusieurs personnes, 30 PDF et 60 utilisations IA par jour, jusqu'à 200 CV et 200 lettres." :
      "Pass 1 an actif jusqu'au " + new Date(P.until()).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + " : PDF sans bandeau, lettres IA, jusqu'à 20 CV et 30 lettres.";
  }
  if (window.CVPASS) window.CVPASS.onChange(offer);
  offer();
  $("#sp-login").addEventListener("click", function () { A.open(); });
  A.on(function (user) {
    $("#sp-out").hidden = !!user; $("#sp-in").hidden = !user;
    if (!user) { $("#sp-who").textContent = "Vous n'êtes pas connecté."; A.open(); return; }
    $("#sp-who").textContent = "Connecté : " + (user.email || "");
    A.close();
    fill($("#sp-cvs"), "cvs", "/creer-un-cv/?cv=", "CV");
    fill($("#sp-letters"), "letters", "/lettre-de-motivation/?l=", "Lettre");
  });
})();
