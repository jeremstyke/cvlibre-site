/* Connexion partagée (lettre de motivation, Mon espace) : lien par e-mail via Supabase. */
(function () {
  "use strict";
  var URL_ = "https://zltqrnflowxkycrjmhbx.supabase.co", PUB = "sb_publishable_KVXGhm7oHvaymjzOZyfp6A_03X6EcXr";
  var $ = function (s) { return document.querySelector(s); };
  var dlg = $("#acc-dlg"), user = null, ready = false, cbs = [];
  if (!dlg || !window.supabase) { window.CVAUTH = null; return; }
  var sb = window.supabase.createClient(URL_, PUB, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  var note = $("#acc-note");
  function say(t, bad) { note.textContent = t || ""; note.className = "pass-note" + (bad ? " bad" : ""); }
  function step(n) { $("#acc-step1").hidden = n !== 1; $("#acc-step2").hidden = n !== 2; if (n === 2) $("#acc-email").focus(); }
  function back() { try { localStorage.setItem("cv_back", JSON.stringify({ p: location.pathname, t: Date.now() })); } catch (e) {} }
  function open() { say(""); step(1); if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", ""); $("#acc-mail-open").focus({ preventScroll: true }); }
  function close() { dlg.close ? dlg.close() : dlg.removeAttribute("open"); }
  function fire() { linkPass(); findPass(); if (window.CVNAV) window.CVNAV.show(!!user); cbs.forEach(function (f) { f(user); }); }
  var gb = $("#acc-google");
  if (gb) gb.addEventListener("click", function () {
    say("Redirection vers Google..."); back();
    sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname + location.search.replace(/[?&]connexion=1/, "") } }).then(function (r) {
      if (r.error) say("Connexion Google impossible. Essayez avec votre e-mail.", true);
    });
  });
  $("#acc-mail-open").addEventListener("click", function () { step(2); });
  $("#acc-back").addEventListener("click", function () { say(""); step(1); });
  $("#acc-close").addEventListener("click", close);
  $("#acc-email").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("#acc-mail-go").click(); } });
  $("#acc-mail-go").addEventListener("click", function () {
    var m = $("#acc-email").value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) { say("Saisissez une adresse email valide.", true); return; }
    say("Envoi en cours..."); back();
    sb.auth.signInWithOtp({ email: m, options: { emailRedirectTo: location.origin + location.pathname + location.search.replace(/[?&]connexion=1/, "") } }).then(function (r) {
      say(r.error ? "Envoi impossible. Réessayez dans un instant." : "Un lien de connexion vient de vous être envoyé. Ouvrez-le sur cet appareil.", !!r.error);
    });
  });

  /* Lie la clé de licence au compte : elle suit la personne sur tous ses appareils. */
  function linkPass() {
    var P = window.CVPASS;
    if (!user || !P || !P.paid() || !P.key()) return;
    sb.rpc("link_pass", { k: P.key(), u: new Date(P.until()).toISOString() });
  }
  if (window.CVPASS) window.CVPASS.onChange(linkPass);
  /* Pass acheté avec la même adresse e-mail : retrouvé et activé automatiquement. */
  var passTried = false;
  function findPass() {
    var P = window.CVPASS;
    if (passTried || !user || !P || P.paid()) return;
    passTried = true;
    sb.rpc("my_pass").then(function (r) { if (!r.error && r.data) P.activate(r.data); else if (!r.error) P.resumeBuy(); });
  }
  var acc = $("#nav-acc");
  if (acc) acc.addEventListener("click", function (e) { if (!user) { e.preventDefault(); open(); } });
  if (window.CVPASS) { window.CVPASS.setUser(function () { return user && user.email ? user.email : ""; }); window.CVPASS.setLogin(open); }
  window.CVAUTH = {
    sb: sb, open: open, close: close, user: function () { return user; },
    on: function (f) { cbs.push(f); if (ready) f(user); },
    signOut: function () { return sb.auth.signOut(); }
  };
  sb.auth.onAuthStateChange(function (ev, s) { user = s && s.user ? s.user : null; if (ev === "SIGNED_OUT") { passTried = false; if (window.CVPASS) window.CVPASS.forget(); } if (ready) fire(); });
  sb.auth.getSession().then(function (r) {
    user = r.data && r.data.session ? r.data.session.user : null; ready = true; fire();
    if (/[?&]connexion=1/.test(location.search)) { if (!user) open(); try { history.replaceState(null, "", location.pathname); } catch (e) {} }
  });
})();
