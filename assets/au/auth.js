/* Généré par tools/i18n/anglo_pages.py (au) depuis la version UK, elle-même générée par tools/i18n/build.py depuis assets/auth.js : ne pas modifier à la main. */
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
  function step(n) { $("#acc-step1").hidden = n !== 1; $("#acc-step2").hidden = n !== 2; if (codeBox) codeBox.hidden = n !== 3; if (n === 2) $("#acc-email").focus(); if (n === 3) $("#acc-code").focus(); }
  function back() { try { localStorage.setItem("cv_back", JSON.stringify({ p: location.pathname, t: Date.now() })); } catch (e) {} }
  function open() { say(""); step(1); if (dlg.showModal) { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute("open", ""); $("#acc-mail-open").focus({ preventScroll: true }); }
  function close() { dlg.close ? dlg.close() : dlg.removeAttribute("open"); }
  function fire() { linkPass(); findPass(); if (window.CVNAV) window.CVNAV.show(!!user); cbs.forEach(function (f) { f(user); }); }
  var gb = $("#acc-google");
  if (gb) gb.addEventListener("click", function () {
    say("Redirecting to Google..."); back();
    sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: location.origin + location.pathname + location.search.replace(/[?&]connexion=1/, "") } }).then(function (r) {
      if (r.error) say("Google sign-in failed. Try with your email.", true);
    });
  });
  $("#acc-mail-open").addEventListener("click", function () { step(2); });
  $("#acc-back").addEventListener("click", function () { say(""); step(1); });
  $("#acc-close").addEventListener("click", close);
  $("#acc-email").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("#acc-mail-go").click(); } });
  /* Connexion par code reçu par e-mail (Resend) : le lien de l'e-mail fonctionne toujours aussi. */
  var codeBox = document.createElement("div"), sentTo = "", waitT = 0;
  codeBox.id = "acc-step3"; codeBox.hidden = true;
  codeBox.innerHTML = '<p id="acc-code-txt"></p><input type="text" id="acc-code" inputmode="numeric" autocomplete="one-time-code" maxlength="10" style="width:100%;box-sizing:border-box;font-size:1.6rem;letter-spacing:.35em;text-align:center;font-weight:700"><button type="button" class="btn acc-big" id="acc-code-go"></button><button type="button" class="link-btn" id="acc-code-again"></button><button type="button" class="link-btn" id="acc-code-back"></button>';
  $("#acc-step2").insertAdjacentElement("afterend", codeBox);
  $("#acc-mail-go").textContent = "Get my sign-in code";
  $("#acc-code").placeholder = "Code";
  $("#acc-code-go").textContent = "Sign in";
  $("#acc-code-back").textContent = "Use a different email";
  function againLabel() { var b = $("#acc-code-again"), s = Math.ceil((waitT - Date.now()) / 1000); b.disabled = s > 0; b.textContent = s > 0 ? "Resend code (" + s + " s)" : "Resend code"; if (s > 0) setTimeout(againLabel, 1000); }
  function codeSent(m, err) {
    if (err) { say(/second|rate|limit/i.test(err.message || "") ? "Please wait a minute before asking for a new code." : "Could not send. Please try again in a moment.", true); return; }
    sentTo = m; $("#acc-code").value = ""; say("");
    $("#acc-code-txt").textContent = "A sign-in email has just been sent to " + m + ". Enter the code it contains below, or simply click its button. Check your spam folder too.";
    step(3); waitT = Date.now() + 60000; againLabel();
  }
  $("#acc-code").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); $("#acc-code-go").click(); } });
  $("#acc-code-back").addEventListener("click", function () { say(""); step(2); });
  $("#acc-code-again").addEventListener("click", function () { if (sentTo) { $("#acc-email").value = sentTo; $("#acc-mail-go").click(); } });
  $("#acc-code-go").addEventListener("click", function () {
    var c = $("#acc-code").value.replace(/\D/g, "");
    if (c.length < 6) { say("Enter the code from the email.", true); return; }
    say("Checking...");
    sb.auth.verifyOtp({ email: sentTo, token: c, type: "email" }).then(function (r) {
      if (r.error) { say("Wrong or expired code. Check it or ask for a new one.", true); return; }
      say(""); close();
    });
  });
  $("#acc-mail-go").addEventListener("click", function () {
    var m = $("#acc-email").value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) { say("Enter a valid email address.", true); return; }
    say("Sending..."); back();
    sb.auth.signInWithOtp({ email: m, options: { data: { lang: LANG }, emailRedirectTo: location.origin + location.pathname + location.search.replace(/[?&]connexion=1/, "") } }).then(function (r) {
      codeSent(m, r.error);
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
  /* Langue des e-mails de connexion (modele Supabase bilingue, lu dans user_metadata.lang). */
  var LANG = "en";
  function syncLang() { if (!user) return; var l = (user.user_metadata || {}).lang; if (l !== LANG && !(LANG === "fr" && !l)) sb.auth.updateUser({ data: { lang: LANG } }); }
  sb.auth.onAuthStateChange(function (ev, s) { user = s && s.user ? s.user : null; if (ev === "SIGNED_IN" || ev === "INITIAL_SESSION") syncLang(); if (ev === "SIGNED_OUT") { passTried = false; if (window.CVPASS) window.CVPASS.forget(); } if (ready) fire(); });
  sb.auth.getSession().then(function (r) {
    user = r.data && r.data.session ? r.data.session.user : null; ready = true; fire();
    if (/[?&]connexion=1/.test(location.search)) { if (!user) open(); try { history.replaceState(null, "", location.pathname); } catch (e) {} }
  });
})();
