/* Espace recruteurs : publier une offre (gratuit), suivre sa validation, la modifier ou la retirer. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var A = window.CVAUTH;
  if (!A) { $("#rc-out").hidden = false; return; }
  var F = { company: "#rc-company", siret: "#rc-siret", title: "#rc-title", city: "#rc-city", contract: "#rc-contract", hours: "#rc-hours", salary: "#rc-salary", contact_name: "#rc-contact", description: "#rc-desc", apply_url: "#rc-url", apply_email: "#rc-email" };
  var msg = $("#rc-msg"), editId = null;
  var ST = { pending: "En cours de vérification", approved: "En ligne", rejected: "Refusée", closed: "Retirée" };
  function stat(e) { try { window.CVSTAT && window.CVSTAT(e); } catch (er) {} }
  function val(k) { return $(F[k]).value.trim(); }
  function reset() {
    editId = null; Object.keys(F).forEach(function (k) { if (k !== "contract") $(F[k]).value = ""; });
    $("#rc-contract").value = "CDI"; $("#rc-legal").checked = false;
    $("#rc-form-title").textContent = "Publier une offre"; $("#rc-send").textContent = "Envoyer pour vérification"; $("#rc-cancel").hidden = true;
  }
  $("#rc-cancel").addEventListener("click", function () { reset(); msg.textContent = ""; });
  $("#rc-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var d = {}; Object.keys(F).forEach(function (k) { d[k] = val(k) || null; });
    d.siret = d.siret ? d.siret.replace(/\s/g, "") : null;
    if (!d.company || !d.title || !d.city || !d.description) { msg.textContent = "Remplissez l'entreprise, l'intitulé, la ville et la description."; return; }
    if (d.description.length < 80) { msg.textContent = "La description est trop courte : décrivez les missions et le profil recherché (80 caractères minimum)."; return; }
    if (!d.apply_url && !d.apply_email) { msg.textContent = "Indiquez un lien ou un e-mail pour que les candidats puissent postuler."; return; }
    if (d.apply_url && !/^https?:\/\//.test(d.apply_url)) { msg.textContent = "Le lien pour postuler doit commencer par https://"; return; }
    if (d.siret && !/^\d{14}$/.test(d.siret)) { msg.textContent = "Le SIRET doit contenir 14 chiffres."; return; }
    if (!$("#rc-legal").checked) { msg.textContent = "Cochez la case de certification pour envoyer l'offre."; return; }
    var b = $("#rc-send"); b.disabled = true; msg.textContent = "Envoi...";
    var u = A.user(), q = editId ? A.sb.from("job_posts").update(Object.assign({ status: "pending" }, d)).eq("id", editId) : A.sb.from("job_posts").insert(Object.assign({ user_id: u.id }, d));
    q.then(function (r) {
      b.disabled = false;
      if (r.error) { msg.textContent = /trop d'offres/.test(r.error.message || "") ? "Vous avez publié beaucoup d'offres aujourd'hui. Réessayez demain." : "L'envoi a échoué. Vérifiez les champs et réessayez."; return; }
      stat(editId ? "rc_edit" : "rc_post");
      msg.textContent = "Merci ! Votre offre est en cours de vérification. Elle sera en ligne dès qu'elle aura été validée.";
      reset(); load();
    });
  });
  function load() {
    var box = $("#rc-list"); box.textContent = "";
    A.sb.from("job_posts").select("*, job_post_stats(views, clicks)").eq("user_id", A.user().id).order("created_at", { ascending: false }).then(function (r) {
      if (r.error) { box.appendChild(Object.assign(document.createElement("p"), { className: "hint", textContent: "Chargement impossible pour le moment." })); return; }
      if (!r.data.length) { box.appendChild(Object.assign(document.createElement("p"), { className: "hint", textContent: "Aucune offre pour l'instant." })); return; }
      r.data.forEach(function (o) {
        var expired = o.status === "approved" && o.expires_at && new Date(o.expires_at) < new Date();
        var d = document.createElement("div"); d.className = "sp-row";
        var t = document.createElement("div"); t.className = "sp-t";
        var a = document.createElement("strong"); a.textContent = o.title + " · " + o.city;
        var s = document.createElement("span");
        s.textContent = (expired ? "Expirée" : ST[o.status] || o.status) + (o.status === "approved" && !expired ? " jusqu'au " + new Date(o.expires_at).toLocaleDateString("fr-FR") : "") + (o.status === "rejected" && o.reject_reason ? " : " + o.reject_reason : "");
        t.appendChild(a); t.appendChild(s);
        var js = o.job_post_stats; js = Array.isArray(js) ? js[0] : js;
        if (o.approved_at || js) {
          var v = (js && js.views) || 0, k = (js && js.clicks) || 0;
          var n = document.createElement("span"); n.className = "rc-stats";
          n.textContent = "👁 Vue " + v + " fois · 👆 " + k + " clic" + (k > 1 ? "s" : "") + " sur Postuler";
          t.appendChild(n);
        }
        var acts = document.createElement("div"); acts.className = "rc-acts";
        var ed = document.createElement("button"); ed.type = "button"; ed.className = "btn btn-ghost btn-sm"; ed.textContent = o.status === "closed" || expired ? "Republier" : "Modifier";
        ed.addEventListener("click", function () {
          editId = o.id; Object.keys(F).forEach(function (k) { $(F[k]).value = o[k] || (k === "contract" ? "CDI" : ""); });
          $("#rc-legal").checked = false; $("#rc-form-title").textContent = "Modifier l'offre"; $("#rc-send").textContent = "Envoyer la modification";
          $("#rc-cancel").hidden = false; msg.textContent = "Après modification, l'offre repasse en vérification avant d'être de nouveau en ligne.";
          $("#rc-form").scrollIntoView({ behavior: "smooth", block: "start" });
        });
        acts.appendChild(ed);
        if (o.status !== "closed") {
          var cl = document.createElement("button"); cl.type = "button"; cl.className = "btn btn-ghost btn-sm"; cl.textContent = "Retirer";
          cl.addEventListener("click", function () {
            if (cl.dataset.arm !== "1") { cl.dataset.arm = "1"; cl.textContent = "Confirmer"; setTimeout(function () { cl.dataset.arm = ""; cl.textContent = "Retirer"; }, 4000); return; }
            A.sb.from("job_posts").update({ status: "closed" }).eq("id", o.id).then(function (x) { if (!x.error) load(); else cl.textContent = "Échec"; });
          });
          acts.appendChild(cl);
        }
        d.appendChild(t); d.appendChild(acts); box.appendChild(d);
      });
    });
  }
  $("#rc-login").addEventListener("click", function () { A.open(); });
  A.on(function (user) {
    $("#rc-out").hidden = !!user; $("#rc-in").hidden = !user;
    if (!user) return;
    A.close(); $("#rc-who").textContent = "Connecté : " + (user.email || "");
    if (!$("#rc-email").value && user.email) $("#rc-email").placeholder = user.email;
    load();
  });
})();
