/* Version allemande des courriers emploi : Kündigungsschreiben, Nachfass-E-Mail, Bewerbungs-E-Mail.
   Adapté de assets/en/letters.js (13 nov 2026). La page déclare son type dans <main data-type="...">. */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var main = $("main[data-type]"); if (!main) return;
  var TYPE = main.getAttribute("data-type"), LETTER = main.getAttribute("data-letter") === "1";
  var AI = "https://cvlibre-ai-production.up.railway.app";
  var KEY = "cvlibre.de.letter." + TYPE;

  var F = {
    resignation: [["job", "Ihre derzeitige Position", "Z. B. Verkäuferin"], ["company", "Unternehmen", "Z. B. Bäckerei Schmidt GmbH"], ["manager", "Name Ihrer Vorgesetzten oder Ihres Vorgesetzten (optional)", "Z. B. Frau Weber"], ["notice", "Kündigungsfrist (optional)", "Z. B. 4 Wochen zum Monatsende"], ["lastday", "Beendigungsdatum (optional)", "Z. B. 31. Dezember 2026"], ["reason", "Grund (optional, nicht nötig)", "Leer lassen, um keinen Grund zu nennen"]],
    followup: [["job", "Position", "Z. B. Kundenberater"], ["company", "Unternehmen", "Z. B. Nordbank AG"], ["contact", "Gesprächspartner (optional)", "Z. B. Herr Yilmaz"], ["date", "Datum des Gesprächs (optional)", "Z. B. Dienstag, 10. November"], ["point", "Ein Punkt aus dem Gespräch (optional)", "Z. B. die geplante neue Filiale"]],
    application: [["job", "Stelle, auf die Sie sich bewerben", "Z. B. Lagerhelfer"], ["company", "Unternehmen", "Z. B. Rhein Logistik GmbH"], ["source", "Wo haben Sie die Stelle gesehen? (optional)", "Z. B. StepStone, Website des Unternehmens"], ["contact", "Ansprechpartner (optional)", "Z. B. Frau Schulz, Personalabteilung"], ["strengths", "Ihre 2 oder 3 Stärken für diese Stelle", "Z. B. 2 Jahre Lagererfahrung, Staplerschein, sofort verfügbar"]]
  }[TYPE];
  if (!F) return;

  var S = { name: "", contact: "", rcpt: "", city: "", subject: "", body: "", f: {} };
  try { var o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o && typeof o === "object") S = Object.assign(S, o); } catch (e) {}
  try { if (!S.name) { var cv = JSON.parse(localStorage.getItem("cvlibre.de.v1") || "null"); if (cv && cv.name && cv.name !== "Laura Becker") { S.name = cv.name; S.contact = [cv.city, cv.phone, cv.email].filter(Boolean).join("\n"); } } } catch (e) {}
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
  function today() { return new Date().toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }); }
  function paint() {
    if (!sheet) return;
    sheet.textContent = "";
    var from = node("div", "lt-from"); if (S.name.trim()) from.appendChild(node("div", "lt-name", S.name.trim())); lines(S.contact).childNodes.forEach(function (c) { from.appendChild(c.cloneNode(true)); });
    sheet.appendChild(from);
    sheet.appendChild(lines(S.rcpt, "lt-to"));
    sheet.appendChild(node("div", "lt-date", today()));
    if (S.subject.trim()) { var o = node("div", "lt-obj"); o.appendChild(node("strong", "", S.subject.trim())); sheet.appendChild(o); }
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
    var n = S.name.trim() || "[Ihr Name]";
    var T = {
      resignation: function () {
        var hi = opt("manager") ? "Sehr geehrte/r " + opt("manager") + "," : "Sehr geehrte Damen und Herren,";
        var notice = opt("notice") ? "unter Einhaltung der Kündigungsfrist von " + opt("notice") + " kündige ich hiermit mein Arbeitsverhältnis als " + v("job", "Position") + " fristgerecht zum " + v("lastday", "Beendigungsdatum") + ", hilfsweise zum nächstmöglichen Zeitpunkt." : "hiermit kündige ich mein Arbeitsverhältnis als " + v("job", "Position") + " fristgerecht zum " + v("lastday", "Beendigungsdatum") + ", hilfsweise zum nächstmöglichen Zeitpunkt.";
        return ["Kündigung meines Arbeitsverhältnisses", hi + "\n\n" + notice + (opt("reason") ? " " + opt("reason") + "." : "") + "\n\nBitte bestätigen Sie mir den Erhalt dieser Kündigung und das Beendigungsdatum schriftlich. Zudem bitte ich Sie um ein qualifiziertes Arbeitszeugnis.\n\nFür die gute Zusammenarbeit und die Unterstützung bei " + v("company", "Unternehmen") + " bedanke ich mich herzlich. Selbstverständlich sorge ich bis zu meinem letzten Arbeitstag für eine reibungslose Übergabe.\n\nMit freundlichen Grüßen"];
      },
      followup: function () {
        var hi = opt("contact") ? "Sehr geehrte/r " + opt("contact") + "," : "Sehr geehrte Damen und Herren,";
        return ["Vielen Dank für das Gespräch - " + v("job", "Position"), hi + "\n\nvielen Dank für das angenehme Gespräch" + (opt("date") ? " am " + opt("date") : "") + " über die Stelle als " + v("job", "Position") + " bei " + v("company", "Unternehmen") + "." + (opt("point") ? " Besonders spannend fand ich " + opt("point") + ", und das hat mein Interesse an der Stelle noch bestärkt." : " Das Gespräch hat mein Interesse an der Stelle noch bestärkt.") + "\n\nGern würde ich erfahren, wie die nächsten Schritte im Auswahlprozess aussehen. Für weitere Fragen stehe ich Ihnen jederzeit zur Verfügung.\n\nMit freundlichen Grüßen\n" + n];
      },
      application: function () {
        var hi = opt("contact") ? "Sehr geehrte/r " + opt("contact") + "," : "Sehr geehrte Damen und Herren,";
        return ["Bewerbung als " + v("job", "Position") + " - " + n, hi + "\n\nanbei sende ich Ihnen meine Bewerbungsunterlagen für die Stelle als " + v("job", "Position") + " bei " + v("company", "Unternehmen") + (opt("source") ? ", die ich auf " + opt("source") + " gesehen habe" : "") + ".\n\n" + (opt("strengths") ? "Kurz zu mir: " + opt("strengths") + "." : "[Ihre 2 oder 3 Stärken für diese Stelle].") + " Lebenslauf und Anschreiben finden Sie im Anhang als PDF.\n\nÜber die Einladung zu einem persönlichen Gespräch freue ich mich sehr.\n\nMit freundlichen Grüßen\n" + n];
      }
    };
    var r = T[TYPE](); S.subject = r[0]; S.body = r[1]; $("#ct-subject").value = S.subject; $("#ct-body").value = S.body; save(); paint(); out();
    msg.textContent = "Die Vorlage ist mit Ihren Angaben ausgefüllt. Ergänzen Sie alles in eckigen Klammern und lesen Sie den Text durch.";
  }

  var gen = $("#ct-gen"), msg = $("#ct-msg");
  var ERR = { limit: "Sie haben Ihre 5 kostenlosen KI-Nutzungen für heute verbraucht. Nutzen Sie die kostenlose Vorlage direkt darunter oder kommen Sie morgen wieder.", busy: "Das KI-Budget von heute ist aufgebraucht. Nutzen Sie die kostenlose Vorlage oder kommen Sie morgen wieder.", net: "Verbindung fehlgeschlagen. Prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.", empty: "Füllen Sie mindestens Position und Unternehmen aus." };
  gen.addEventListener("click", function () {
    if (!(S.f.job || "").trim()) { msg.textContent = ERR.empty; return; }
    var fields = {}; Object.keys(S.f).forEach(function (k) { if (String(S.f[k] || "").trim()) fields[k] = S.f[k]; });
    if (S.name.trim()) fields.name = S.name.trim();
    gen.disabled = true; gen.textContent = "KI schreibt..."; msg.textContent = "Das dauert 5 bis 10 Sekunden.";
    fetch(AI + "/courrier", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lang: "de", type: TYPE, fields: fields }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); }, function () { return { error: "net" }; })
      .then(function (j) {
        gen.disabled = false; gen.textContent = "Mit KI schreiben";
        if (!j || j.error || !j.letter) { msg.textContent = ERR[j && j.error] || "Die KI hat es diesmal nicht geschafft. Versuchen Sie es erneut, dieser Versuch zählt nicht."; return; }
        S.subject = j.letter.subject || S.subject; S.body = j.letter.body; $("#ct-subject").value = S.subject; $("#ct-body").value = S.body; save(); paint(); out();
        msg.textContent = "Fertig. Lesen Sie den Text, ergänzen Sie alles in eckigen Klammern und korrigieren Sie ihn: die KI kann Fehler machen." + (typeof j.left === "number" ? " Sie haben heute noch " + j.left + " Nutzung" + (j.left > 1 ? "en" : "") + "." : "");
      });
  });
  $("#ct-model").addEventListener("click", model);

  function out() { var r = $("#ct-result"); if (r) { r.hidden = false; if (window.innerWidth < 960) r.scrollIntoView({ behavior: "smooth", block: "start" }); } }
  if (S.body) $("#ct-result").hidden = false;
  function mailText() { var b = S.body.trim(), n = S.name.trim(); if (!LETTER && n && b.slice(-n.length) !== n) b += "\n" + n; return b; }
  var cp = $("#ct-copy");
  if (cp) cp.addEventListener("click", function () {
    var t = LETTER ? S.body : "Betreff: " + S.subject + "\n\n" + mailText();
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { cp.textContent = "Kopiert ✓"; setTimeout(function () { cp.textContent = "Text kopieren"; }, 2500); }, function () { $("#ct-body").select(); document.execCommand && document.execCommand("copy"); cp.textContent = "Kopiert ✓"; });
  });
  var ml = $("#ct-mail");
  if (ml) ml.addEventListener("click", function () { location.href = "mailto:?subject=" + encodeURIComponent(S.subject) + "&body=" + encodeURIComponent(mailText()); });
  var pr = $("#ct-print");
  if (pr) pr.addEventListener("click", function () { paint(); window.print(); });
})();
