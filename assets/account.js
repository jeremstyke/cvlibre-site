/* Compte facultatif : connexion Google ou lien par email, CV enregistrés en ligne (Supabase). Sans compte, tout reste dans ce navigateur. */
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
  function fmt(d) { return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }); }
  function ui() {
    out.hidden = !!user; inn.hidden = !user;
    btn.textContent = user ? "Mon compte" : "Se connecter";
    if (user) { $("#acc-mail").textContent = user.email || ""; refresh(); }
  }
  function refresh() {
    sb.from("cvs").select("id,title,updated_at").order("updated_at", { ascending: false }).then(function (r) {
      list.innerHTML = "";
      if (r.error) { say("Impossible de charger vos CV pour le moment.", true); return; }
      if (!r.data.length) { var p = document.createElement("p"); p.className = "pass-note"; p.textContent = "Aucun CV enregistré pour l'instant."; list.appendChild(p); return; }
      r.data.forEach(function (c) {
        var row = document.createElement("div"); row.className = "pass-row";
        var t = document.createElement("span"); t.textContent = (c.title || "CV") + " (" + fmt(c.updated_at) + ")" + (c.id === curId ? " - en cours" : "");
        var o = document.createElement("button"); o.type = "button"; o.className = "btn btn-ghost btn-sm"; o.textContent = "Ouvrir";
        o.onclick = function () { open_(c.id); };
        var d = document.createElement("button"); d.type = "button"; d.className = "btn btn-ghost btn-sm"; d.textContent = "Supprimer";
        d.onclick = function () { if (d.dataset.arm !== "1") { d.dataset.arm = "1"; d.textContent = "Confirmer"; setTimeout(function () { d.dataset.arm = ""; d.textContent = "Supprimer"; }, 4000); return; } del(c.id); };
        row.appendChild(t); row.appendChild(o); row.appendChild(d); list.appendChild(row);
      });
    });
  }
  function open_(id) {
    sb.from("cvs").select("data").eq("id", id).single().then(function (r) {
      if (r.error || !r.data) { say("Ce CV est introuvable.", true); return; }
      window.CVB.set(r.data.data); remember(id); say("CV ouvert."); refresh();
    });
  }
  function del(id) {
    sb.from("cvs").delete().eq("id", id).then(function (r) {
      if (r.error) { say("Suppression impossible. Réessayez.", true); return; }
      if (id === curId) remember(null);
      say("CV supprimé."); refresh();
    });
  }
  function saveCv(asNew) {
    var data = window.CVB.get(), title = (data.name || "").trim() ? "CV " + data.name.trim() : "Mon CV";
    var q = (curId && !asNew) ? sb.from("cvs").update({ title: title, data: data }).eq("id", curId).select("id") : sb.from("cvs").insert({ user_id: user.id, title: title, data: data }).select("id");
    q.then(function (r) {
      if (r.error) { say(/cv_limit/.test(r.error.message) ? "Vous avez atteint la limite de 20 CV. Supprimez-en un." : "Enregistrement impossible. Réessayez.", true); return; }
      if (!r.data || !r.data.length) { remember(null); saveCv(true); return; }
      remember(r.data[0].id); say("CV enregistré."); refresh();
    });
  }
  btn.addEventListener("click", function () { say(""); if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", ""); });
  $("#acc-mail-go").addEventListener("click", function () {
    var m = $("#acc-email").value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(m)) { say("Saisissez une adresse email valide.", true); return; }
    say("Envoi en cours...");
    sb.auth.signInWithOtp({ email: m, options: { emailRedirectTo: location.origin + location.pathname } }).then(function (r) {
      say(r.error ? "Envoi impossible. Réessayez dans un instant." : "Un lien de connexion vient de vous être envoyé. Ouvrez-le sur cet appareil.", !!r.error);
    });
  });
  $("#acc-save").addEventListener("click", function () { saveCv(false); });
  $("#acc-new").addEventListener("click", function () { saveCv(true); });
  $("#acc-out-btn").addEventListener("click", function () { sb.auth.signOut().then(function () { remember(null); say(""); }); });
  var delAcc = $("#acc-del");
  delAcc.addEventListener("click", function () {
    if (delAcc.dataset.arm !== "1") { delAcc.dataset.arm = "1"; delAcc.textContent = "Confirmer : supprimer mon compte et tous mes CV"; setTimeout(function () { delAcc.dataset.arm = ""; delAcc.textContent = "Supprimer mon compte"; }, 5000); return; }
    sb.rpc("delete_my_account").then(function (r) {
      if (r.error) { say("Suppression impossible. Écrivez-nous à contact@cvlibre.com.", true); return; }
      remember(null); sb.auth.signOut().then(function () { say("Votre compte et vos CV ont été supprimés."); });
    });
    delAcc.dataset.arm = ""; delAcc.textContent = "Supprimer mon compte";
  });
  $("#acc-close").addEventListener("click", function () { dlg.close ? dlg.close() : dlg.removeAttribute("open"); });
  sb.auth.onAuthStateChange(function (ev, s) { user = s && s.user ? s.user : null; ui(); });
  sb.auth.getSession().then(function (r) { user = r.data && r.data.session ? r.data.session.user : null; ui(); });
})();
