/* Généré par tools/i18n/anglo_pages.py (us) depuis la version UK, elle-même générée par tools/i18n/build.py depuis assets/letter.js : ne pas modifier à la main. */
/* Lettre de motivation : rédaction par l'IA, aperçu A4, PDF, enregistrement dans le compte. */
(function () {
  "use strict";
  var AI = "https://cvlibre-ai-production.up.railway.app", KEY = "cvlibre.us.letter", IDK = "cvlibre.us.letterid";
  var $ = function (s) { return document.querySelector(s); };
  var F = ["job", "company", "ad", "profile", "tone", "name", "contact", "rcpt", "city", "subject", "body", "title"];
  var S = {}, curId = null, cvs = [], user = null;
  try { S = JSON.parse(localStorage.getItem(KEY) || "{}") || {}; curId = localStorage.getItem(IDK) || null; } catch (e) { S = {}; }
  function store() { try { localStorage.setItem(KEY, JSON.stringify(S)); if (curId) localStorage.setItem(IDK, curId); else localStorage.removeItem(IDK); } catch (e) {} }
  function el(id) { return $("#lt-" + id); }
  function fillFields() { F.forEach(function (id) { var e = el(id); if (e) e.value = S[id] || (id === "tone" ? "classique" : ""); }); }
  F.forEach(function (id) { var e = el(id); if (e) e.addEventListener("input", function () { S[id] = e.value; store(); paint(); }); });
  fillFields();
  /* Arrivée depuis une offre d'emploi (/offres-emploi/) : poste, entreprise et annonce pré-remplis. */
  var FROM = null;
  if (/[?&]offre=1/.test(location.search)) {
    try { FROM = JSON.parse(localStorage.getItem("cvlibre.offre") || "null"); } catch (e) {}
    if (FROM && Date.now() - (FROM.at || 0) < 864e5) {
      S.job = String(FROM.titre || "").slice(0, 100); S.company = String(FROM.entreprise || "").slice(0, 100); S.ad = String(FROM.ad || "").slice(0, 4000);
      if (S.company && !(S.rcpt || "").trim()) S.rcpt = S.company;
      S.subject = ""; S.body = ""; curId = null; store(); fillFields();
      setTimeout(function () { var m = $("#lt-msg"); if (m) m.textContent = "The job \"" + S.job + "\" is already filled in. Describe your experience in a few lines (or pick one of your resumes), then click Write my cover letter."; var pr = $("#lt-profile"); if (pr) pr.focus(); }, 300);
    } else FROM = null;
  }

  /* aperçu */
  var sheet = $("#lt-sheet"), box = $("#lt-box");
  function node(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function lines(txt, cls) { var d = node("div", cls); String(txt || "").split("\n").forEach(function (l) { if (l.trim()) d.appendChild(node("div", "", l.trim())); }); return d; }
  function today() { return new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }); }
  function paint() {
    sheet.textContent = "";
    var from = node("div", "lt-from"); if ((S.name || "").trim()) from.appendChild(node("div", "lt-name", S.name.trim())); lines(S.contact).childNodes.forEach(function (c) { from.appendChild(c.cloneNode(true)); });
    sheet.appendChild(from);
    sheet.appendChild(lines(S.rcpt, "lt-to"));
    sheet.appendChild(node("div", "lt-date", today()));
    if ((S.subject || "").trim()) { var o = node("div", "lt-obj"); o.appendChild(node("strong", "", "Re: ")); o.appendChild(document.createTextNode(S.subject.trim())); sheet.appendChild(o); }
    String(S.body || "").split(/\n\s*\n/).forEach(function (p) { if (p.trim()) sheet.appendChild(node("p", "lt-p", p.trim().replace(/\n/g, " "))); });
    if ((S.name || "").trim()) sheet.appendChild(node("div", "lt-sign", S.name.trim()));
    fit();
  }
  function fit() {
    var w = box.clientWidth || 360, k = Math.min(1, w / 794);
    sheet.style.transform = "scale(" + k + ")"; box.style.height = Math.ceil(Math.max(sheet.offsetHeight, 1123) * k) + "px";
  }
  window.addEventListener("resize", fit);
  window.addEventListener("beforeprint", function () { sheet.style.transform = "none"; box.style.height = "auto"; });
  window.addEventListener("afterprint", fit);

  /* IA */
  var gen = $("#lt-gen"), msg = $("#lt-msg");
  var ERR = {
    pass: "The AI service is temporarily unavailable. Please try again in a moment.",
    limit: "You have used your 5 free AI uses for today. Come back tomorrow, or get the CVLibre Pass: 50 uses a day.",
    busy: "The service is very busy. Please try again in a few minutes.",
    net: "Connection failed. Check your internet connection and try again.",
    parse: "The AI did not manage it this time. Try again, this attempt does not count.",
    api: "The AI did not manage it this time. Try again, this attempt does not count."
  };
  function passKey() { try { var o = JSON.parse(localStorage.getItem("cvlibre.pass")); return o && o.key ? o.key : ""; } catch (e) { return ""; } }
  function compact(d) {
    if (!d) return null;
    var c = { name: d.name, title: d.title, summary: d.summary, skills: d.skills, exp: (d.exp || []).slice(0, 6).map(function (x) { return { role: x.role, company: x.company, from: x.from, to: x.to, desc: x.desc }; }), edu: (d.edu || []).slice(0, 4).map(function (x) { return { degree: x.degree, school: x.school }; }), langs: d.langs };
    return JSON.stringify(c).slice(0, 4000);
  }
  function selCv() { var id = $("#lt-cv").value; for (var i = 0; i < cvs.length; i++) if (cvs[i].id === id) return cvs[i]; return null; }
  var P = window.CVPASS, lock = $("#lt-lock");
  function needPass(txt) { if (P && P.paid()) return false; if (txt) { msg.textContent = txt; } lock.hidden = false; var b = $("#pass-btn"); if (b) b.focus({ preventScroll: true }); lock.scrollIntoView({ behavior: "smooth", block: "center" }); return true; }
  function syncLock() { lock.hidden = !!(P && P.paid()); }
  if (P) { P.onChange(syncLock); } syncLock();
  gen.addEventListener("click", function () {
    if (needPass("")) return;
    var job = (S.job || "").trim();
    if (!job) { msg.textContent = "Enter the job you are applying for first."; el("job").focus(); return; }
    var cv = selCv();
    if (!cv && (S.profile || "").trim().length < 20) { msg.textContent = "Describe your experience in a few lines, or start from one of your resumes."; el("profile").focus(); return; }
    gen.disabled = true; gen.textContent = "Writing..."; msg.textContent = "";
    var payload = { lang: "en", cc: "US", job: { title: job, company: (S.company || "").trim(), ad: (S.ad || "").slice(0, 4000) }, tone: S.tone || "classique", profile: (S.profile || "").slice(0, 2500), cv: cv ? compact(cv.data) : null };
    var k = (window.CVP && window.CVP.tok()) || (P && P.key()) || passKey(); if (k) payload.key = k;
    fetch(AI + "/letter", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json().catch(function () { return {}; }); }).catch(function () { return { error: "net" }; })
      .then(function (j) {
        gen.disabled = false; gen.textContent = "Write my cover letter with AI";
        if (j.error === "pass") { needPass(); }
        if (j.error || !j.letter) { msg.textContent = ERR[j.error] || ERR.api; return; }
        S.subject = j.letter.subject || S.subject || ""; S.body = j.letter.body || "";
        if (!(S.rcpt || "").trim() && (S.company || "").trim()) S.rcpt = S.company.trim();
        if (cv && cv.data) {
          if (!(S.name || "").trim()) S.name = cv.data.name || "";
          if (!(S.contact || "").trim()) S.contact = [cv.data.city, cv.data.phone, cv.data.email].filter(Boolean).join("\n");
          if (!(S.city || "").trim()) S.city = cv.data.city || "";
        }
        fillFields(); store(); paint();
        msg.textContent = "Your cover letter is ready. Read it and correct it: the AI can make mistakes." + (typeof j.left === "number" ? " You have " + j.left + " use" + (j.left > 1 ? "s" : "") + " left today." : "");
        $("#lt-result").scrollIntoView({ behavior: "smooth", block: "start" });
      });
  });

  /* compte : PDF, enregistrement, CV */
  var sm = $("#lt-save-msg"), A = window.CVAUTH;
  function say(t) { sm.textContent = t; }
  function save(asNew) {
    if (needPass("")) return;
    if (!A || !A.user()) { say("Sign in to save."); if (A) A.open(); return; }
    var title = (S.title || "").trim().slice(0, 60) || ("Letter " + ((S.company || S.job || "").trim() || "untitled")).slice(0, 60);
    S.title = title; el("title").value = title; store();
    var data = {}; F.forEach(function (id) { data[id] = S[id] || ""; });
    var u = A.user(), t = A.sb.from("letters");
    if (!curId || asNew) {
      var mx = window.CVPASS && window.CVPASS.plan() === "pro" ? 200 : 30;
      t.select("id", { count: "exact", head: true }).then(function (c) {
        if (!c.error && (c.count || 0) >= mx) { say("You have reached the limit of " + mx + " letters. Delete one first."); return; }
        write_(title, data, asNew);
      });
      return;
    }
    write_(title, data, asNew);
  }
  function write_(title, data, asNew) {
    var u = A.user(), t = A.sb.from("letters");
    var q = (curId && !asNew) ? t.update({ title: title, data: data }).eq("id", curId).select("id") : t.insert({ user_id: u.id, title: title, data: data }).select("id");
    q.then(function (r) {
      if (r.error) { say(/letter_limit/.test(r.error.message) ? "You have reached the letter limit. Delete one first." : "Could not save. Please try again."); return; }
      if (!r.data || !r.data.length) { curId = null; save(true); return; }
      curId = r.data[0].id; store(); say("Cover letter saved to your account.");
    });
  }
  $("#lt-save").addEventListener("click", function () { save(false); });
  $("#lt-new").addEventListener("click", function () {
    if (!confirm_()) return; S = { tone: "classique" }; curId = null; store(); fillFields(); paint(); say("New cover letter."); window.scrollTo({ top: 0, behavior: "smooth" });
  });
  function confirm_() { var b = $("#lt-new"); if (b.dataset.arm === "1") { b.dataset.arm = ""; b.textContent = "New cover letter"; return true; } b.dataset.arm = "1"; b.textContent = "Confirm: clear everything"; setTimeout(function () { b.dataset.arm = ""; b.textContent = "New cover letter"; }, 4000); return false; }
  $("#lt-print").addEventListener("click", function () {
    if (needPass("")) return;
    if (!(S.body || "").trim()) { say("Write your cover letter first."); return; }
    if (!A || !A.user()) { A && A.open(); return; }
    var old = document.title; document.title = "Cover letter" + ((S.name || "").trim() ? " " + S.name.trim() : "");
    window.print(); setTimeout(function () { document.title = old; }, 500);
  });
  function loadCvs() {
    A.sb.from("cvs").select("id,title,data").order("updated_at", { ascending: false }).then(function (r) {
      if (r.error || !r.data) return; cvs = r.data; var s = $("#lt-cv"); s.length = 1;
      cvs.forEach(function (c) { var o = document.createElement("option"); o.value = c.id; o.textContent = c.title || "CV"; s.appendChild(o); });
      $("#lt-cvrow").hidden = !cvs.length;
    });
  }
  function loadLetter(id) {
    A.sb.from("letters").select("title,data").eq("id", id).single().then(function (r) {
      if (r.error || !r.data) { say("This cover letter could not be found."); return; }
      S = r.data.data || {}; S.title = r.data.title || S.title || ""; curId = id; store(); fillFields(); paint(); say("Cover letter opened.");
    });
  }
  if (A) A.on(function (u) {
    var was = user; user = u; if (!u) { cvs = []; $("#lt-cvrow").hidden = true; return; }
    if (was) return;
    loadCvs();
    if (P && !P.paid()) A.sb.rpc("my_pass").then(function (r) { if (!r.error && r.data) P.activate(r.data); });
    var m = /[?&]l=([0-9a-f-]{36})/.exec(location.search);
    if (m) { loadLetter(m[1]); try { history.replaceState(null, "", location.pathname); } catch (e) {} }
  });
  paint();
})();
