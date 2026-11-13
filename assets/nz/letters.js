/* Version anglaise (New Zealand) des courriers emploi : resignation letter, interview follow-up email, job application email.
   Écrit à la main à partir de assets/courrier.js (13 nov 2026). La page déclare son type dans <main data-type="...">. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var main = $("main[data-type]"); if (!main) return;
  var TYPE = main.getAttribute("data-type"), LETTER = main.getAttribute("data-letter") === "1";
  var AI = "https://cvlibre-ai-production.up.railway.app";
  var KEY = "cvlibre.nz.letter." + TYPE;

  var F = {
    resignation: [["job", "Job you are leaving", "E.g. Sales Assistant"], ["company", "Company", "E.g. Green & Co Bakery"], ["manager", "Your manager's name (optional)", "E.g. Ms Taylor"], ["notice", "Notice period (optional)", "E.g. one month, as in my contract"], ["lastday", "Last working day (optional)", "E.g. 15 December 2026"], ["reason", "Reason to mention (optional, not required)", "Leave blank to give no reason"]],
    followup: [["job", "Job title", "E.g. Customer Service Adviser"], ["company", "Company", "E.g. Northern Bank"], ["contact", "Person you met (optional)", "E.g. Mr Patel"], ["date", "Interview date (optional)", "E.g. Tuesday 10 November"], ["point", "Something memorable from the interview (optional)", "E.g. the plan to open a new branch"]],
    application: [["job", "Job you are applying for", "E.g. Warehouse Operative"], ["company", "Company", "E.g. Midlands Logistics"], ["source", "Where did you see the job? (optional)", "E.g. Indeed, the company website"], ["contact", "Recipient (optional)", "E.g. Ms Jones, HR Manager"], ["strengths", "Your 2 or 3 strengths for this job", "E.g. 2 years in a warehouse, forklift licence, available immediately"]]
  }[TYPE];
  if (!F) return;

  var S = { name: "", contact: "", rcpt: "", city: "", subject: "", body: "", f: {} };
  try { var o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o && typeof o === "object") S = Object.assign(S, o); } catch (e) {}
  try { if (!S.name) { var cv = JSON.parse(localStorage.getItem("cvlibre.nz.v1") || "null"); if (cv && cv.name && cv.name !== "Emily Carter") { S.name = cv.name; S.contact = [cv.city, cv.phone, cv.email].filter(Boolean).join("\n"); } } } catch (e) {}
  var saveT = 0; function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 300); }

  var box = $("#ct-fields");
  F.forEach(function (d) {
    var w = document.createElement("div"); w.className = "fld"; w.id = "w-" + d[0];
    var lab = document.createElement("label"); lab.htmlFor = "c-" + d[0]; lab.textContent = d[1]; w.appendChild(lab);
    var el;
    if (d[0] === "strengths" || d[0] === "point" || d[0] === "reason") { el = document.createElement("textarea"); el.rows = 3; }
    else { el = document.createElement("input"); el.autocomplete = "off"; }
    el.id = "c-" + d[0]; el.maxLength = 500; if (d[2]) el.placeholder = d[2];
    el.value = S.f[d[0]] || "";
    el.addEventListener("input", function () { S.f[d[0]] = el.value; save(); });
    w.appendChild(el); box.appendChild(w);
  });
  [["#ct-name", "name"], ["#ct-contact", "contact"], ["#ct-rcpt", "rcpt"], ["#ct-subject", "subject"], ["#ct-body", "body"]].forEach(function (p) {
    var el = $(p[0]); if (!el) return; el.value = S[p[1]] || "";
    el.addEventListener("input", function () { S[p[1]] = el.value; save(); paint(); });
  });

  var sheet = $("#lt-sheet"), pbox = $("#lt-box");
  function node(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function lines(txt, cls) { var d = node("div", cls); String(txt || "").split("\n").forEach(function (l) { if (l.trim()) d.appendChild(node("div", "", l.trim())); }); return d; }
  function today() { return new Date().toLocaleDateString("en-NZ", { day: "numeric", month: "long", year: "numeric" }); }
  function paint() {
    if (!sheet) return;
    sheet.textContent = "";
    var from = node("div", "lt-from"); if (S.name.trim()) from.appendChild(node("div", "lt-name", S.name.trim())); lines(S.contact).childNodes.forEach(function (c) { from.appendChild(c.cloneNode(true)); });
    sheet.appendChild(from);
    sheet.appendChild(lines(S.rcpt, "lt-to"));
    sheet.appendChild(node("div", "lt-date", today()));
    if (S.subject.trim()) { var o = node("div", "lt-obj"); o.appendChild(node("strong", "", "Re: ")); o.appendChild(document.createTextNode(S.subject.trim())); sheet.appendChild(o); }
    String(S.body || "").split(/\n\s*\n/).forEach(function (p) { if (p.trim()) sheet.appendChild(node("p", "lt-p", p.trim().replace(/\n/g, " "))); });
    if (S.name.trim()) sheet.appendChild(node("div", "lt-sign", S.name.trim()));
    fit();
  }
  function fit() { if (!pbox) return; var w = pbox.clientWidth || 360, k = Math.min(1, w / 794); sheet.style.transform = "scale(" + k + ")"; pbox.style.height = Math.ceil(Math.max(sheet.offsetHeight, 1123) * k) + "px"; }
  window.addEventListener("resize", fit);
  window.addEventListener("beforeprint", function () { if (sheet) { sheet.style.transform = "none"; pbox.style.height = "auto"; } });
  window.addEventListener("afterprint", fit);
  paint();

  /* free template without AI */
  function v(k, ph) { var x = String(S.f[k] || "").trim(); return x || "[" + ph + "]"; }
  function opt(k) { return String(S.f[k] || "").trim(); }
  function model() {
    var n = S.name.trim() || "[Your name]";
    var T = {
      resignation: function () {
        var hi = opt("manager") ? "Dear " + opt("manager") + "," : "Dear [Manager's name],";
        var notice = opt("notice") ? "In line with my notice period of " + opt("notice") + ", my last working day will be " + v("lastday", "last working day") + "." : "I will work my notice period as set out in my contract, and my last working day will be " + v("lastday", "last working day") + ".";
        return ["Resignation - " + v("job", "job title"), hi + "\n\nPlease accept this letter as formal notice of my resignation from my role as " + v("job", "job title") + " at " + v("company", "company") + "." + (opt("reason") ? " " + opt("reason") + "." : "") + "\n\n" + notice + "\n\nThank you for the support and the opportunities I have had during my time here. I will do everything I can to ensure a smooth handover before I leave.\n\nCould you please confirm my last working day and arrange for my final pay, including holiday pay?\n\nYours sincerely,"];
      },
      followup: function () {
        var hi = opt("contact") ? "Dear " + opt("contact") + "," : "Dear Hiring Manager,";
        return ["Thank you - " + v("job", "job title") + " interview", hi + "\n\nThank you again for taking the time to meet me" + (opt("date") ? " on " + opt("date") : "") + " to discuss the " + v("job", "job title") + " role at " + v("company", "company") + "." + (opt("point") ? " I particularly enjoyed hearing about " + opt("point") + ", and it confirmed how much I would like to join your team." : " Our conversation confirmed how much I would like to join your team.") + "\n\nCould you let me know about the next steps in your recruitment process? I am happy to provide any further information you may need.\n\nKind regards,\n" + n];
      },
      application: function () {
        var hi = opt("contact") ? "Dear " + opt("contact") + "," : "Dear Hiring Manager,";
        return ["Application for " + v("job", "job title") + " - " + n, hi + "\n\nPlease find attached my CV and cover letter for the " + v("job", "job title") + " role at " + v("company", "company") + (opt("source") ? ", as posted on " + opt("source") : "") + ".\n\n" + (opt("strengths") ? "In short: " + opt("strengths") + "." : "[Your 2 or 3 strengths for this role].") + "\n\nI would welcome the chance to discuss how I could contribute to your team.\n\nKind regards,\n" + n];
      }
    };
    var r = T[TYPE](); S.subject = r[0]; S.body = r[1]; $("#ct-subject").value = S.subject; $("#ct-body").value = S.body; save(); paint(); out();
    msg.textContent = "The template is filled in with your details. Complete anything in square brackets and read it through.";
  }

  var gen = $("#ct-gen"), msg = $("#ct-msg");
  var ERR = { limit: "You have used your 5 free AI uses for today. Use the free template just below, or come back tomorrow.", busy: "Today's AI budget is used up. Use the free template, or come back tomorrow.", net: "Connection failed. Check your internet connection and try again.", empty: "Fill in at least the job title and the company." };
  gen.addEventListener("click", function () {
    if (!(S.f.job || "").trim()) { msg.textContent = ERR.empty; return; }
    var fields = {}; Object.keys(S.f).forEach(function (k) { if (String(S.f[k] || "").trim()) fields[k] = S.f[k]; });
    if (S.name.trim()) fields.name = S.name.trim();
    gen.disabled = true; gen.textContent = "AI is writing..."; msg.textContent = "This takes 5 to 10 seconds.";
    fetch(AI + "/courrier", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lang: "en", type: TYPE, fields: fields, key: (window.CVP && window.CVP.tok()) || undefined }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); }, function () { return { error: "net" }; })
      .then(function (j) {
        gen.disabled = false; gen.textContent = "Write it with AI";
        if (!j || j.error || !j.letter) { msg.textContent = ERR[j && j.error] || "The AI did not manage it this time. Try again, this attempt does not count."; return; }
        S.subject = j.letter.subject || S.subject; S.body = j.letter.body; $("#ct-subject").value = S.subject; $("#ct-body").value = S.body; save(); paint(); out();
        msg.textContent = "Done. Read it, complete anything in square brackets and correct it: the AI can make mistakes." + (typeof j.left === "number" ? " You have " + j.left + " use" + (j.left > 1 ? "s" : "") + " left today." : "");
      });
  });
  $("#ct-model").addEventListener("click", model);

  function out() { var r = $("#ct-result"); if (r) { r.hidden = false; if (window.innerWidth < 960) r.scrollIntoView({ behavior: "smooth", block: "start" }); } }
  if (S.body) $("#ct-result").hidden = false;
  function mailText() { var b = S.body.trim(), n = S.name.trim(); if (!LETTER && n && b.slice(-n.length) !== n) b += "\n" + n; return b; }
  var cp = $("#ct-copy");
  if (cp) cp.addEventListener("click", function () {
    var t = LETTER ? S.body : "Subject: " + S.subject + "\n\n" + mailText();
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { cp.textContent = "Copied ✓"; setTimeout(function () { cp.textContent = "Copy the text"; }, 2500); }, function () { $("#ct-body").select(); document.execCommand && document.execCommand("copy"); cp.textContent = "Copied ✓"; });
  });
  var ml = $("#ct-mail");
  if (ml) ml.addEventListener("click", function () { location.href = "mailto:?subject=" + encodeURIComponent(S.subject) + "&body=" + encodeURIComponent(mailText()); });
  var pr = $("#ct-print");
  if (pr) pr.addEventListener("click", function () { paint(); window.print(); });
})();
