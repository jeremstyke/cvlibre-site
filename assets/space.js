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
    t.textContent = !P.paid() ? "Offre gratuite : 1 CV gardé en ligne, PDF avec bandeau. Le Pass 1 an (4,99 €) retire le bandeau et ouvre les lettres IA et 20 CV." :
      P.plan() === "pro" ? "Offre Pro active : CV de plusieurs personnes, 30 PDF et 60 utilisations IA par jour, jusqu'à 200 CV et 200 lettres." :
      "Pass 1 an actif jusqu'au " + new Date(P.until()).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + " : PDF sans bandeau, lettres IA, jusqu'à 20 CV et 30 lettres.";
  }
  /* Liste des pass du compte : un pass par personne, on choisit celui à utiliser sur cet appareil. */
  function passes() {
    var P = window.CVPASS, box = $("#sp-passes"), add = $("#sp-add");
    if (!P || !box || !A.user()) return Promise.resolve(0);
    add.href = P.buyUrl(A.user().email || "");
    return A.sb.rpc("my_passes").then(function (r) {
      box.textContent = "";
      var list = r.error || !r.data ? [] : r.data, live = 0;
      list.forEach(function (x, i) {
        var ok = new Date(x.until).getTime() > Date.now(); if (ok) live++;
        var d = document.createElement("div"); d.className = "sp-row";
        var t = document.createElement("div"); t.className = "sp-t";
        var a = document.createElement("strong"); a.textContent = "Pass " + (i + 1);
        var s = document.createElement("span"); s.textContent = (ok ? "Valable jusqu'au " : "Expiré le ") + fmt(x.until);
        t.appendChild(a); t.appendChild(s); d.appendChild(t);
        if (ok) {
          var b = document.createElement("button"); b.type = "button"; b.className = "btn btn-ghost btn-sm";
          var cur = P.paid() && P.key() === x.key;
          b.textContent = cur ? "Utilisé sur cet appareil" : "Utiliser sur cet appareil"; b.disabled = cur;
          b.addEventListener("click", function () { b.disabled = true; P.activate(x.key).then(function () { passes(); offer(); }); });
          d.appendChild(b);
        }
        box.appendChild(d);
      });
      $("#sp-addp").hidden = !live; $("#sp-addhint").hidden = !live;
      return live;
    });
  }
  /* Retour de Stripe : le pass est créé quelques secondes après le paiement. */
  function waitPay() {
    var P = window.CVPASS, m = $("#sp-pay"), n = 0;
    if (!/[?&]paiement=ok/.test(location.search) || !m) return;
    m.hidden = false; m.textContent = "Paiement reçu. Activation de votre pass en cours...";
    (function tick() {
      A.sb.rpc("my_passes").then(function (r) {
        var live = (r.data || []).filter(function (x) { return new Date(x.until).getTime() > Date.now(); });
        if (live.length) {
          var last = live[live.length - 1];
          var go = P.paid() && P.key() === last.key ? Promise.resolve() : P.activate(last.key);
          go.then(function () { m.textContent = "Votre pass est activé. Merci !"; offer(); passes(); });
          try { history.replaceState(null, "", location.pathname); } catch (e) {}
        } else if (++n < 15) setTimeout(tick, 3000);
        else m.textContent = "Le paiement est bien reçu, l'activation prend plus de temps que prévu. Rechargez cette page dans une minute, ou écrivez-nous : contact@cvlibre.com.";
      });
    })();
  }
  if (window.CVPASS) window.CVPASS.onChange(function () { offer(); });
  offer();
  $("#sp-login").addEventListener("click", function () { A.open(); });
  A.on(function (user) {
    $("#sp-out").hidden = !!user; $("#sp-in").hidden = !user;
    if (!user) { $("#sp-who").textContent = "Vous n'êtes pas connecté."; A.open(); return; }
    $("#sp-who").textContent = "Connecté : " + (user.email || "");
    A.close();
    fill($("#sp-cvs"), "cvs", "/creer-un-cv/?cv=", "CV");
    fill($("#sp-letters"), "letters", "/lettre-de-motivation/?l=", "Lettre");
    waitPay(); passes();
  });
})();
