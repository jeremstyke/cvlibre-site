/* Généré par tools/i18n/build_de.py depuis assets/recruteurs.js : ne pas modifier à la main. */
/* Espace recruteurs : publier une offre (gratuit), suivre sa validation, la modifier ou la retirer. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var A = window.CVAUTH;
  if (!A) { $("#rc-out").hidden = false; return; }
  var F = { company: "#rc-company", siret: "#rc-siret", title: "#rc-title", city: "#rc-city", contract: "#rc-contract", hours: "#rc-hours", salary: "#rc-salary", contact_name: "#rc-contact", description: "#rc-desc", apply_url: "#rc-url", apply_email: "#rc-email" };
  var msg = $("#rc-msg"), editId = null;
  var ST = { pending: "In Prüfung", approved: "Online", rejected: "Abgelehnt", closed: "Entfernt" };
  function stat(e) { try { window.CVSTAT && window.CVSTAT(e); } catch (er) {} }
  function val(k) { return $(F[k]).value.trim(); }
  function reset() {
    editId = null; Object.keys(F).forEach(function (k) { if (k !== "contract") $(F[k]).value = ""; });
    $("#rc-contract").value = "Unbefristet"; $("#rc-legal").checked = false;
    $("#rc-form-title").textContent = "Stelle veröffentlichen"; $("#rc-send").textContent = "Zur Prüfung senden"; $("#rc-cancel").hidden = true;
  }
  $("#rc-cancel").addEventListener("click", function () { reset(); msg.textContent = ""; });
  $("#rc-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var d = {}; Object.keys(F).forEach(function (k) { d[k] = val(k) || null; });
    d.siret = null;
    if (!d.company || !d.title || !d.city || !d.description) { msg.textContent = "Füllen Sie Unternehmen, Position, Ort und Beschreibung aus."; return; }
    if (d.description.length < 80) { msg.textContent = "Die Beschreibung ist zu kurz: beschreiben Sie die Aufgaben und die gesuchte Person (mindestens 80 Zeichen)."; return; }
    if (!d.apply_url && !d.apply_email) { msg.textContent = "Geben Sie einen Link oder eine E-Mail-Adresse an, damit sich Bewerber melden können."; return; }
    if (d.apply_url && !/^https?:\/\//.test(d.apply_url)) { msg.textContent = "Der Bewerbungslink muss mit https:// beginnen"; return; }
    
    if (!$("#rc-legal").checked) { msg.textContent = "Haken Sie die Erklärung an, um die Stelle zu senden."; return; }
    var b = $("#rc-send"); b.disabled = true; msg.textContent = "Wird gesendet...";
    var u = A.user(), q = editId ? A.sb.from("job_posts").update(Object.assign({ status: "pending" }, d)).eq("id", editId) : A.sb.from("job_posts").insert(Object.assign({ user_id: u.id, country: "DE" }, d));
    q.then(function (r) {
      b.disabled = false;
      if (r.error) { msg.textContent = /trop d'offres/.test(r.error.message || "") ? "Sie haben heute schon viele Stellen veröffentlicht. Bitte versuchen Sie es morgen erneut." : "Senden fehlgeschlagen. Prüfen Sie die Felder und versuchen Sie es erneut."; return; }
      stat(editId ? "rc_edit" : "rc_post");
      msg.textContent = "Vielen Dank! Ihre Stelle wird geprüft. Sie geht online, sobald sie freigegeben ist.";
      reset(); load();
    });
  });
  function load() {
    var box = $("#rc-list"); box.textContent = "";
    A.sb.from("job_posts").select("*, job_post_stats(views, clicks)").eq("user_id", A.user().id).eq("country", "DE").order("created_at", { ascending: false }).then(function (r) {
      if (r.error) { box.appendChild(Object.assign(document.createElement("p"), { className: "hint", textContent: "Kann gerade nicht geladen werden." })); return; }
      if (!r.data.length) { box.appendChild(Object.assign(document.createElement("p"), { className: "hint", textContent: "Noch keine Stellen." })); return; }
      r.data.forEach(function (o) {
        var expired = o.status === "approved" && o.expires_at && new Date(o.expires_at) < new Date();
        var d = document.createElement("div"); d.className = "sp-row";
        var t = document.createElement("div"); t.className = "sp-t";
        var a = document.createElement("strong"); a.textContent = o.title + " · " + o.city;
        var s = document.createElement("span");
        s.textContent = (expired ? "Abgelaufen" : ST[o.status] || o.status) + (o.status === "approved" && !expired ? " bis " + new Date(o.expires_at).toLocaleDateString("de-DE") : "") + (o.status === "rejected" && o.reject_reason ? " : " + o.reject_reason : "");
        t.appendChild(a); t.appendChild(s);
        var js = o.job_post_stats; js = Array.isArray(js) ? js[0] : js;
        if (o.approved_at || js) {
          var v = (js && js.views) || 0, k = (js && js.clicks) || 0;
          var n = document.createElement("span"); n.className = "rc-stats";
          n.textContent = "👁 " + v + " Mal angesehen · 👆 " + k + " Klick" + (k > 1 ? "s" : "") + " auf Bewerben";
          t.appendChild(n);
        }
        var acts = document.createElement("div"); acts.className = "rc-acts";
        var ed = document.createElement("button"); ed.type = "button"; ed.className = "btn btn-ghost btn-sm"; ed.textContent = o.status === "closed" || expired ? "Erneut veröffentlichen" : "Bearbeiten";
        ed.addEventListener("click", function () {
          editId = o.id; Object.keys(F).forEach(function (k) { $(F[k]).value = o[k] || (k === "contract" ? "Unbefristet" : ""); });
          $("#rc-legal").checked = false; $("#rc-form-title").textContent = "Stelle bearbeiten"; $("#rc-send").textContent = "Änderungen senden";
          $("#rc-cancel").hidden = false; msg.textContent = "Nach der Bearbeitung wird die Stelle erneut geprüft, bevor sie wieder online geht.";
          $("#rc-form").scrollIntoView({ behavior: "smooth", block: "start" });
        });
        acts.appendChild(ed);
        if (o.status !== "closed") {
          var cl = document.createElement("button"); cl.type = "button"; cl.className = "btn btn-ghost btn-sm"; cl.textContent = "Entfernen";
          cl.addEventListener("click", function () {
            if (cl.dataset.arm !== "1") { cl.dataset.arm = "1"; cl.textContent = "Bestätigen"; setTimeout(function () { cl.dataset.arm = ""; cl.textContent = "Entfernen"; }, 4000); return; }
            A.sb.from("job_posts").update({ status: "closed" }).eq("id", o.id).then(function (x) { if (!x.error) load(); else cl.textContent = "Fehlgeschlagen"; });
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
    A.close(); $("#rc-who").textContent = "Angemeldet als " + (user.email || "");
    if (!$("#rc-email").value && user.email) $("#rc-email").placeholder = user.email;
    load();
  });
})();
