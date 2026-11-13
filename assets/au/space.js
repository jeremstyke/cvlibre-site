/* Généré par tools/i18n/anglo_pages.py (au) depuis la version UK, elle-même générée par tools/i18n/build.py depuis assets/space.js : ne pas modifier à la main. */
/* Mon espace : liste des CV et des lettres enregistrés. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var A = window.CVAUTH;
  if (!A) { $("#sp-who").textContent = "This page could not load. Please reload it."; return; }
  function fmt(d) { return new Date(d).toLocaleDateString("en-AU", { day: "numeric", month: "short", year: "numeric" }); }
  function row(box, table, r, openUrl, label) {
    var d = document.createElement("div"); d.className = "sp-row";
    var t = document.createElement("div"); t.className = "sp-t";
    var a = document.createElement("a"); a.href = openUrl; a.textContent = r.title || label;
    var s = document.createElement("span"); s.textContent = "Edited " + fmt(r.updated_at);
    t.appendChild(a); t.appendChild(s);
    var del = document.createElement("button"); del.type = "button"; del.className = "btn btn-ghost btn-sm"; del.textContent = "Delete";
    del.addEventListener("click", function () {
      if (del.dataset.arm !== "1") { del.dataset.arm = "1"; del.textContent = "Confirm"; setTimeout(function () { del.dataset.arm = ""; del.textContent = "Delete"; }, 4000); return; }
      A.sb.from(table).delete().eq("id", r.id).then(function (x) { if (!x.error) { d.remove(); if (!box.children.length) empty(box, table); } else del.textContent = "Failed"; });
    });
    d.appendChild(t);
    /* CVthèque : mise en pause le 13 nov 2026 (Jeremy), case cachée. Remettre CVT à true pour la réactiver. */
    var CVT = false;
    if (CVT && table === "cvs") {
      var lab = document.createElement("label"); lab.className = "sp-cvt";
      var cb = document.createElement("input"); cb.type = "checkbox"; cb.checked = !!r.cvtheque;
      lab.appendChild(cb); lab.appendChild(document.createTextNode(" Visible to recruiters (resume database)"));
      cb.addEventListener("change", function () {
        cb.disabled = true;
        A.sb.from("cvs").update({ cvtheque: cb.checked, cvtheque_at: cb.checked ? new Date().toISOString() : null }).eq("id", r.id).then(function (x) {
          cb.disabled = false; if (x.error) cb.checked = !cb.checked;
          else try { window.CVSTAT && window.CVSTAT(cb.checked ? "cvt_on" : "cvt_off"); } catch (e) {}
        });
      });
      t.appendChild(lab);
    }
    d.appendChild(del); box.appendChild(d);
  }
  function empty(box, table) {
    var p = document.createElement("p"); p.className = "hint";
    p.textContent = table === "cvs" ? "No saved resumes yet." : "No saved cover letters yet."; box.appendChild(p);
  }
  function fill(box, table, openBase, label) {
    box.textContent = "";
    A.sb.from(table).select(table === "cvs" ? "id,title,updated_at,cvtheque" : "id,title,updated_at").order("updated_at", { ascending: false }).then(function (r) {
      if (r.error) { var p = document.createElement("p"); p.className = "hint"; p.textContent = "Could not load right now."; box.appendChild(p); return; }
      if (!r.data.length) { empty(box, table); return; }
      r.data.forEach(function (x) { row(box, table, x, openBase + x.id, label); });
    });
  }
  function offer() {
    var P = window.CVPASS, t = $("#sp-offer-txt"); if (!P || !t) return;
    t.textContent = !P.paid() ? "Offre gratuite : 1 resume gardé en ligne, PDF avec bandeau. Le Pass 1 an (4,99 € TTC) retire le bandeau et ouvre les lettres IA et 20 resume." :
      P.plan() === "pro" ? "Offre Pro active : resume de plusieurs personnes, 30 PDF et 60 utilisations IA par jour, jusqu'à 200 resume et 200 lettres." :
      "Pass 1 an actif jusqu'au " + new Date(P.until()).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + " : PDF sans bandeau, lettres IA, jusqu'à 20 resume et 30 lettres.";
  }
  /* Liste des pass du compte : un pass par personne, un pass par personne. */
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
        var a = document.createElement("strong"); a.textContent = x.holder_p ? "Pass de " + x.holder_p + " " + x.holder_n : "Pass " + (i + 1) + " (nom à définir)";
        var s = document.createElement("span"); s.textContent = (ok ? "Valable jusqu'au " : "Expiré le ") + fmt(x.until);
        t.appendChild(a); t.appendChild(s); d.appendChild(t);
        if (ok) {
          var cur = P.paid() && P.key() === x.key;
          if (cur && !x.holder_p) {
            var b = document.createElement("button"); b.type = "button"; b.className = "btn btn-sm"; b.textContent = "Définir le nom";
            b.addEventListener("click", function () { P.askHolder(); });
            d.appendChild(b);
          }
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
          go.then(function () { m.textContent = "Votre pass est activé. Merci !"; $("#sp-back").hidden = false; offer(); passes(); });
          try { history.replaceState(null, "", location.pathname); } catch (e) {}
        } else if (++n < 15) setTimeout(tick, 3000);
        else m.textContent = "Le paiement est bien reçu, l'activation prend plus de temps que prévu. Rechargez cette page dans une minute, ou écrivez-nous : contact@cvlibre.com.";
      });
    })();
  }
  if (window.CVPASS) window.CVPASS.onChange(function () { offer(); passes(); });
  offer();
  $("#sp-login").addEventListener("click", function () { A.open(); });
  $("#sp-out-btn").addEventListener("click", function () { A.signOut(); });
  var sdel = $("#sp-del"), smsg = $("#sp-del-msg");
  sdel.addEventListener("click", function () {
    if (sdel.dataset.arm !== "1") {
      sdel.dataset.arm = "1"; sdel.textContent = "Confirm: delete my account and all my resumes";
      setTimeout(function () { sdel.dataset.arm = ""; sdel.textContent = "Delete my account"; }, 5000); return;
    }
    sdel.disabled = true;
    A.sb.rpc("delete_my_account").then(function (r) {
      sdel.disabled = false; sdel.dataset.arm = ""; sdel.textContent = "Delete my account"; smsg.hidden = false;
      if (r.error) { smsg.textContent = "Could not delete. Email us at contact@cvlibre.com."; return; }
      try { localStorage.removeItem("cvlibre.cvid"); } catch (e) {}
      smsg.textContent = "Your account and your data have been deleted."; A.signOut();
    });
  });
  A.on(function (user) {
    $("#sp-out").hidden = !!user; $("#sp-in").hidden = !user;
    if (!user) { $("#sp-who").textContent = "You are not signed in."; A.open(); return; }
    $("#sp-who").textContent = "Signed in as " + (user.email || "");
    A.close();
    fill($("#sp-cvs"), "cvs", "/au/resume-builder/?cv=", "CV");
    fill($("#sp-letters"), "letters", "/au/cover-letter/?l=", "Cover letter");
    waitPay(); passes();
  });
})();
