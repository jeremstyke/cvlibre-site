/* Généré par tools/i18n/build_de.py depuis assets/support.js : ne pas modifier à la main. */
/* Assistant d'aide : répond aux questions courantes, renvoie vers contact@cvlibre.com sinon. */
(function () {
  "use strict";
  var API = "https://cvlibre-ai-production.up.railway.app/support", MAIL = "contact@cvlibre.com";
  var hist = [], busy = false;
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x) e.textContent = x; return e; }
  var root = el("div", "sup");
  var fab = el("button", "sup-fab", "Hilfe"); fab.type = "button"; fab.setAttribute("aria-expanded", "false"); fab.setAttribute("aria-controls", "sup-panel");
  var panel = el("section", "sup-panel"); panel.id = "sup-panel"; panel.hidden = true; panel.setAttribute("aria-label", "CVLibre-Hilfe");
  var head = el("div", "sup-head"); head.appendChild(el("strong", "", "Fragen?"));
  var x = el("button", "sup-x", "Schließen"); x.type = "button"; head.appendChild(x);
  var log = el("div", "sup-log"); log.setAttribute("role", "log"); log.setAttribute("aria-live", "polite");
  var form = el("form", "sup-form");
  var inp = el("input"); inp.type = "text"; inp.maxLength = 500; inp.placeholder = "Ihre Frage"; inp.setAttribute("aria-label", "Ihre Frage"); inp.autocomplete = "off";
  var go = el("button", "btn btn-sm", "Senden"); go.type = "submit";
  form.appendChild(inp); form.appendChild(go);
  var foot = el("p", "sup-foot"); foot.appendChild(document.createTextNode("Ein echter Mensch antwortet auch: "));
  var a = el("a", "", MAIL); a.href = "mailto:" + MAIL; foot.appendChild(a);
  panel.appendChild(head); panel.appendChild(log); panel.appendChild(form); panel.appendChild(foot);
  root.appendChild(fab); root.appendChild(panel); document.body.appendChild(root);
  function say(who, t, human) {
    var m = el("div", "sup-msg " + who); m.appendChild(document.createTextNode(t));
    if (human) { m.appendChild(document.createTextNode(" ")); var l = el("a", "", MAIL); l.href = "mailto:" + MAIL; m.appendChild(l); }
    log.appendChild(m); log.scrollTop = log.scrollHeight; return m;
  }
  function open_(v) { panel.hidden = !v; fab.setAttribute("aria-expanded", v ? "true" : "false"); fab.hidden = v;
    if (v) { if (!log.children.length) say("bot", "Hallo, stellen Sie Ihre Frage zu CVLibre (PDF, Vorlagen, Konto, KI). Wenn ich es nicht weiß, verweise ich Sie an einen echten Menschen."); inp.focus(); } else fab.focus(); }
  fab.addEventListener("click", function () { open_(true); });
  x.addEventListener("click", function () { open_(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) open_(false); });
  form.addEventListener("submit", function (e) {
    e.preventDefault(); var q = inp.value.trim(); if (!q || busy) return;
    inp.value = ""; busy = true; go.disabled = true; say("me", q); hist.push({ role: "user", content: q }); hist = hist.slice(-6);
    var wait = say("bot", "...");
    function done(t, human) { wait.remove(); say("bot", t, human); if (t) hist.push({ role: "assistant", content: t }); busy = false; go.disabled = false; inp.focus(); }
    fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ lang: "de", messages: hist }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
      .then(function (o) {
        if (o.ok && o.j.text) done(o.j.text, !!o.j.human);
        else if (o.j.error === "limit") done("Sie haben heute schon viele Fragen gestellt. Schreiben Sie uns an", true);
        else done("Ich kann gerade nicht antworten. Schreiben Sie uns an", true);
      })
      .catch(function () { done("Ich kann gerade nicht antworten. Schreiben Sie uns an", true); });
  });
})();
