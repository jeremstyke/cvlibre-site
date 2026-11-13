/* Généré par tools/i18n/anglo_pages.py (ca) depuis la version UK, elle-même générée par tools/i18n/build.py depuis assets/recruteurs.js : ne pas modifier à la main. */
/* Espace recruteurs : publier une offre (gratuit), suivre sa validation, la modifier ou la retirer. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var A = window.CVAUTH;
  if (!A) { $("#rc-out").hidden = false; return; }
  var F = { company: "#rc-company", siret: "#rc-siret", title: "#rc-title", city: "#rc-city", contract: "#rc-contract", hours: "#rc-hours", salary: "#rc-salary", contact_name: "#rc-contact", description: "#rc-desc", apply_url: "#rc-url", apply_email: "#rc-email" };
  var msg = $("#rc-msg"), editId = null;
  var ST = { pending: "Being checked", approved: "Live", rejected: "Rejected", closed: "Removed" };
  function stat(e) { try { window.CVSTAT && window.CVSTAT(e); } catch (er) {} }
  function val(k) { return $(F[k]).value.trim(); }
  function reset() {
    editId = null; Object.keys(F).forEach(function (k) { if (k !== "contract") $(F[k]).value = ""; });
    $("#rc-contract").value = "Permanent"; $("#rc-legal").checked = false;
    $("#rc-form-title").textContent = "Post a job"; $("#rc-send").textContent = "Send for review"; $("#rc-cancel").hidden = true;
  }
  $("#rc-cancel").addEventListener("click", function () { reset(); msg.textContent = ""; });
  $("#rc-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var d = {}; Object.keys(F).forEach(function (k) { d[k] = val(k) || null; });
    d.siret = null;
    if (!d.company || !d.title || !d.city || !d.description) { msg.textContent = "Fill in the company, job title, town and description."; return; }
    if (d.description.length < 80) { msg.textContent = "The description is too short: describe the duties and the person you are looking for (80 characters minimum)."; return; }
    if (!d.apply_url && !d.apply_email) { msg.textContent = "Add a link or an email so candidates can apply."; return; }
    if (d.apply_url && !/^https?:\/\//.test(d.apply_url)) { msg.textContent = "The application link must start with https://"; return; }
    
    if (!$("#rc-legal").checked) { msg.textContent = "Tick the declaration box to send the job."; return; }
    var b = $("#rc-send"); b.disabled = true; msg.textContent = "Sending...";
    var u = A.user(), q = editId ? A.sb.from("job_posts").update(Object.assign({ status: "pending" }, d)).eq("id", editId) : A.sb.from("job_posts").insert(Object.assign({ user_id: u.id, country: "CA" }, d));
    q.then(function (r) {
      b.disabled = false;
      if (r.error) { msg.textContent = /trop d'offres/.test(r.error.message || "") ? "You have posted a lot of jobs today. Please try again tomorrow." : "Sending failed. Check the fields and try again."; return; }
      stat(editId ? "rc_edit" : "rc_post");
      msg.textContent = "Thank you! Your job is being checked. It will go live as soon as it is approved.";
      reset(); load();
    });
  });
  function load() {
    var box = $("#rc-list"); box.textContent = "";
    A.sb.from("job_posts").select("*, job_post_stats(views, clicks)").eq("user_id", A.user().id).eq("country", "CA").order("created_at", { ascending: false }).then(function (r) {
      if (r.error) { box.appendChild(Object.assign(document.createElement("p"), { className: "hint", textContent: "Could not load right now." })); return; }
      if (!r.data.length) { box.appendChild(Object.assign(document.createElement("p"), { className: "hint", textContent: "No jobs yet." })); return; }
      r.data.forEach(function (o) {
        var expired = o.status === "approved" && o.expires_at && new Date(o.expires_at) < new Date();
        var d = document.createElement("div"); d.className = "sp-row";
        var t = document.createElement("div"); t.className = "sp-t";
        var a = document.createElement("strong"); a.textContent = o.title + " · " + o.city;
        var s = document.createElement("span");
        s.textContent = (expired ? "Expired" : ST[o.status] || o.status) + (o.status === "approved" && !expired ? " until " + new Date(o.expires_at).toLocaleDateString("en-CA") : "") + (o.status === "rejected" && o.reject_reason ? " : " + o.reject_reason : "");
        t.appendChild(a); t.appendChild(s);
        var js = o.job_post_stats; js = Array.isArray(js) ? js[0] : js;
        if (o.approved_at || js) {
          var v = (js && js.views) || 0, k = (js && js.clicks) || 0;
          var n = document.createElement("span"); n.className = "rc-stats";
          n.textContent = "👁 Seen " + v + " time" + (v > 1 ? "s" : "") + " · 👆 " + k + " click" + (k > 1 ? "s" : "") + " on Apply";
          t.appendChild(n);
        }
        var acts = document.createElement("div"); acts.className = "rc-acts";
        var ed = document.createElement("button"); ed.type = "button"; ed.className = "btn btn-ghost btn-sm"; ed.textContent = o.status === "closed" || expired ? "Repost" : "Edit";
        ed.addEventListener("click", function () {
          editId = o.id; Object.keys(F).forEach(function (k) { $(F[k]).value = o[k] || (k === "contract" ? "Permanent" : ""); });
          $("#rc-legal").checked = false; $("#rc-form-title").textContent = "Edit the job"; $("#rc-send").textContent = "Send the changes";
          $("#rc-cancel").hidden = false; msg.textContent = "After editing, the job is checked again before it goes back live.";
          $("#rc-form").scrollIntoView({ behavior: "smooth", block: "start" });
        });
        acts.appendChild(ed);
        if (o.status !== "closed") {
          var cl = document.createElement("button"); cl.type = "button"; cl.className = "btn btn-ghost btn-sm"; cl.textContent = "Remove";
          cl.addEventListener("click", function () {
            if (cl.dataset.arm !== "1") { cl.dataset.arm = "1"; cl.textContent = "Confirm"; setTimeout(function () { cl.dataset.arm = ""; cl.textContent = "Remove"; }, 4000); return; }
            A.sb.from("job_posts").update({ status: "closed" }).eq("id", o.id).then(function (x) { if (!x.error) load(); else cl.textContent = "Failed"; });
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
    A.close(); $("#rc-who").textContent = "Signed in as " + (user.email || "");
    if (!$("#rc-email").value && user.email) $("#rc-email").placeholder = user.email;
    load();
  });
})();
