/* Généré par tools/i18n/build_de.py depuis assets/account.js : ne pas modifier à la main. */
/* Compte gratuit requis pour télécharger le PDF : connexion Google ou lien par email, CV enregistrés en ligne (Supabase). Sans compte, tout reste dans ce navigateur. */
(function () {
  "use strict";
  var URL_ = "https://zltqrnflowxkycrjmhbx.supabase.co", PUB = "sb_publishable_KVXGhm7oHvaymjzOZyfp6A_03X6EcXr";
  var CK = "cvlibre.cvid";
  var $ = function (s) { return document.querySelector(s); };
  var dlg = $("#acc-dlg"), btn = $("#acc-btn");
  if (!dlg || !btn || !window.supabase || !window.CVB) { if (btn) btn.hidden = true; return; }
  var sb = window.supabase.createClient(URL_, PUB, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  var user = null, curId = null;
  try { curId = localStorage.getItem(CK) || null; } catch (e) {}
  var out = $("#acc-out"), inn = $("#acc-in"), note = $("#acc-note"), list = $("#acc-list");
  function say(t, bad) { note.textContent = t || ""; note.className = "pass-note" + (bad ? " bad" : ""); }
  function remember(id) { curId = id; try { if (id) localStorage.setItem(CK, id); else localStorage.removeItem(CK); } catch (e) {} }
  function fmt(d) { return new Date(d).toLocaleDateString("de-DE", { day: "numeric", month: "short", year: "numeric" }); }
  var closeBtn = $("#acc-close");
  function step(n) { $("#acc-step1").hidden = n !== 1; $("#acc-step2").hidden = n !== 2; if (n === 2) $("#acc-email").focus(); }
  function openDlg() {
    say(""); step(1);
    if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", "");
    var f = user ? null : $("#acc-mail-open"); if (f) f.focus({ preventScroll: true });
  }
  var gb = $("#acc-google");
  if (gb) gb.addEventListener("click", function () {
    say("Weiterleitung zu Google...");
    sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname + location.search.replace(/[?&]connexion=1/, "") } }).then(function (r) {
      if (r.error) say("Anmeldung mit Google fehlgeschlagen. Versuchen Sie es mit Ihrer E-Mail-Adresse.", true);
    });
  });
  $("#acc-mail-open").addEventListener("click", function () { step(2); });
  $("#acc-back").addEventListener("click", function () { say(""); step(1); });
  $("#acc-email").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("#acc-mail-go").click(); } });
  if (window.CVPASS) { window.CVPASS.setUser(function () { return user && user.email ? user.email : ""; }); window.CVPASS.setLogin(openDlg); }
  window.CVACC = { signOut: function () { return sb.auth.signOut(); } };
  var hl0 = document.getElementById("nav-acc");
  if (hl0) hl0.addEventListener("click", function (e) { if (!user) { e.preventDefault(); openDlg(); } });
  function ui() {
    out.hidden = !!user; inn.hidden = !user;
    btn.textContent = user ? "Mein Konto" : "Online speichern (kostenloses Konto)";
    var pr = $("#acc-promo"); if (pr) pr.hidden = !!user;
    if (window.CVNAV) window.CVNAV.show(!!user);
    if (user) { $("#acc-mail").textContent = user.email || ""; refresh(); findPass(); linkPass(); }
  }

  /* Lie la clé de licence au compte : elle suit la personne sur tous ses appareils. */
  function linkPass() {
    var P = window.CVPASS;
    if (!user || !P || !P.paid() || !P.key()) return;
    sb.rpc("link_pass", { k: P.key(), u: new Date(P.until()).toISOString() });
  }
  if (window.CVPASS) window.CVPASS.onChange(linkPass);
  var passTried = false;
  function findPass() {
    if (passTried || !window.CVPASS || window.CVPASS.paid()) return;
    passTried = true;
    sb.rpc("my_pass").then(function (r) {
      if (r.error) return;
      if (!r.data) { window.CVPASS.resumeBuy(); return; }
      window.CVPASS.activate(r.data).then(function (a) { if (a.ok) say(""); });
    });
  }
  function refresh() {
    sb.from("cvs").select("id,title,updated_at").order("updated_at", { ascending: false }).then(function (r) {
      list.innerHTML = "";
      if (r.error) { say("Ihre Lebensläufe können gerade nicht geladen werden.", true); return; }
      if (!r.data.length) { var p = document.createElement("p"); p.className = "pass-note"; p.textContent = "Noch kein gespeicherter Lebenslauf."; list.appendChild(p); return; }
      r.data.forEach(function (c) {
        var row = document.createElement("div"); row.className = "pass-row";
        var t = document.createElement("span"); t.textContent = (c.title || "CV") + " (" + fmt(c.updated_at) + ")" + (c.id === curId ? " - geöffnet" : "");
        var o = document.createElement("button"); o.type = "button"; o.className = "btn btn-ghost btn-sm"; o.textContent = "Öffnen";
        o.onclick = function () { open_(c.id); };
        var d = document.createElement("button"); d.type = "button"; d.className = "btn btn-ghost btn-sm"; d.textContent = "Löschen";
        d.onclick = function () { if (d.dataset.arm !== "1") { d.dataset.arm = "1"; d.textContent = "Bestätigen"; setTimeout(function () { d.dataset.arm = ""; d.textContent = "Löschen"; }, 4000); return; } del(c.id); };
        row.appendChild(t); row.appendChild(o); row.appendChild(d); list.appendChild(row);
      });
    });
  }
  function open_(id) {
    sb.from("cvs").select("title,data").eq("id", id).single().then(function (r) {
      if (r.error || !r.data) { say("Dieser Lebenslauf wurde nicht gefunden.", true); return; }
      window.CVB.set(r.data.data); $("#acc-title-in").value = r.data.title || ""; remember(id); say("Lebenslauf geöffnet."); refresh();
    });
  }
  function del(id) {
    sb.from("cvs").delete().eq("id", id).then(function (r) {
      if (r.error) { say("Löschen fehlgeschlagen. Bitte erneut versuchen.", true); return; }
      if (id === curId) remember(null);
      say("Lebenslauf gelöscht."); refresh();
    });
  }
  var FREE_CVS = 1;
  var maxCvs = function () { return window.CVP && window.CVP.paid() ? 20 : FREE_CVS; };
  function saveCv(asNew) {
    var creating = !curId || asNew;
    if (creating) {
      sb.from("cvs").select("id", { count: "exact", head: true }).then(function (c) {
        var m = maxCvs();
        if (!c.error && (c.count || 0) >= m) { say(m === FREE_CVS ? "Das kostenlose Konto speichert 1 Lebenslauf online. Mit dem CVLibre Pass können Sie bis zu 20 speichern. Sie können Ihren bestehenden Lebenslauf bearbeiten oder ersetzen." : "Sie haben das Limit von " + m + " Lebensläufen erreicht. Löschen Sie zuerst einen.", true); return; }
        doSave(asNew);
      });
      return;
    }
    doSave(asNew);
  }
  function doSave(asNew) {
    var data = window.CVB.get(), typed = ($("#acc-title-in").value || "").trim().slice(0, 60);
    var title = typed || ((data.name || "").trim() ? "Lebenslauf " + data.name.trim() : "Mein Lebenslauf");
    $("#acc-title-in").value = title;
    var q = (curId && !asNew) ? sb.from("cvs").update({ title: title, data: data }).eq("id", curId).select("id") : sb.from("cvs").insert({ user_id: user.id, title: title, data: data }).select("id");
    q.then(function (r) {
      if (r.error) { say(/cv_limit/.test(r.error.message) ? "Sie haben das Limit für Lebensläufe erreicht. Löschen Sie zuerst einen." : "Speichern fehlgeschlagen. Bitte erneut versuchen.", true); return; }
      if (!r.data || !r.data.length) { remember(null); saveCv(true); return; }
      remember(r.data[0].id); say("Lebenslauf gespeichert."); refresh();
    });
  }
  var pb = $("#acc-promo-btn"); if (pb) pb.addEventListener("click", function () { openDlg(); });
  btn.addEventListener("click", function () { openDlg(); });
  $("#acc-mail-go").addEventListener("click", function () {
    var m = $("#acc-email").value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) { say("Geben Sie eine gültige E-Mail-Adresse ein.", true); return; }
    say("Wird gesendet...");
    sb.auth.signInWithOtp({ email: m, options: { data: { lang: LANG }, emailRedirectTo: location.origin + location.pathname } }).then(function (r) {
      say(r.error ? "Senden fehlgeschlagen. Bitte versuchen Sie es gleich noch einmal." : "Ein Anmeldelink wurde Ihnen gesendet. Öffnen Sie ihn auf diesem Gerät.", !!r.error);
    });
  });
  $("#acc-save").addEventListener("click", function () { saveCv(false); });
  $("#acc-new").addEventListener("click", function () { saveCv(true); });
  $("#acc-out-btn").addEventListener("click", function () { sb.auth.signOut().then(function () { remember(null); say(""); }); });
  var delAcc = $("#acc-del");
  delAcc.addEventListener("click", function () {
    if (delAcc.dataset.arm !== "1") { delAcc.dataset.arm = "1"; delAcc.textContent = "Bestätigen: mein Konto und alle Lebensläufe löschen"; setTimeout(function () { delAcc.dataset.arm = ""; delAcc.textContent = "Mein Konto löschen"; }, 5000); return; }
    sb.rpc("delete_my_account").then(function (r) {
      if (r.error) { say("Löschen fehlgeschlagen. Schreiben Sie uns an contact@cvlibre.com.", true); return; }
      remember(null); sb.auth.signOut().then(function () { say("Ihr Konto und Ihre Lebensläufe wurden gelöscht."); });
    });
    delAcc.dataset.arm = ""; delAcc.textContent = "Mein Konto löschen";
  });
  closeBtn.addEventListener("click", function () { dlg.close ? dlg.close() : dlg.removeAttribute("open"); });
  /* Langue des e-mails de connexion (modele Supabase bilingue, lu dans user_metadata.lang). */
  var LANG = "de";
  function syncLang() { if (!user) return; var l = (user.user_metadata || {}).lang; if (l !== LANG && !(LANG === "fr" && !l)) sb.auth.updateUser({ data: { lang: LANG } }); }
  sb.auth.onAuthStateChange(function (ev, s) { user = s && s.user ? s.user : null; if (ev === "SIGNED_IN" || ev === "INITIAL_SESSION") syncLang(); if (ev === "SIGNED_OUT") { passTried = false; if (window.CVPASS) window.CVPASS.forget(); } ui(); });
  sb.auth.getSession().then(function (r) {
    user = r.data && r.data.session ? r.data.session.user : null; ui();
    /* lien « Se connecter » de l'en-tête (visiteurs qui reviennent) */
    if (/[?&](connexion|account)=1/.test(location.search)) { openDlg(); try { history.replaceState(null, "", location.pathname); } catch (e) {} }
    var m = /[?&]cv=([0-9a-f-]{36})/.exec(location.search);
    if (m && user) { open_(m[1]); try { history.replaceState(null, "", location.pathname); } catch (e) {} }
  });
})();
