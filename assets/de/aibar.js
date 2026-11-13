/* Généré par tools/i18n/build_de.py depuis assets/aibar.js : ne pas modifier à la main. */
/* Jauge du budget IA du jour : se remplit au fil des utilisations de tous les visiteurs. */
(function () {
  "use strict";
  var API = "https://cvlibre-ai-production.up.railway.app/usage";
  var boxes = [].slice.call(document.querySelectorAll(".ai-budget"));
  if (!boxes.length) return;
  boxes.forEach(function (b) {
    b.innerHTML = '<div class="aib-top"><span class="aib-t">KI-Budget von heute</span><span class="aib-v">...</span></div>' +
      '<div class="aib-bar" role="progressbar" aria-label="Verbrauchtes KI-Budget von heute" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
      '<p class="aib-msg">Jede KI-Nutzung kostet uns Geld, und unser Budget ist pro Tag begrenzt. Ist der Balken voll, pausiert die KI bis zum nächsten Tag. <a href="/de/mein-konto/?pass=1" data-pass>Der CVLibre Pass bietet 50 Nutzungen pro Tag</a></p>';
  });
  function paint(d) {
    var p = Math.max(0, Math.min(100, Number(d.pct) || 0)), shown = p > 0 && p < 1 ? 1 : Math.round(p);
    boxes.forEach(function (b) {
      b.querySelector(".aib-bar i").style.width = Math.max(p, p > 0 ? 2 : 0) + "%";
      b.querySelector(".aib-bar").setAttribute("aria-valuenow", String(shown));
      b.querySelector(".aib-v").textContent = shown + " % verbraucht" + (d.uses ? " · " + d.uses + " KI-Nutzung" + (d.uses > 1 ? "en" : "") + " heute" : "");
      b.classList.toggle("hot", p >= 70); b.classList.toggle("full", p >= 100);
      if (p >= 100) b.querySelector(".aib-msg").innerHTML = "Das KI-Budget von heute ist aufgebraucht: die KI ist morgen wieder da. Der Rest der Seite funktioniert normal. <a href=\"/de/mein-konto/?pass=1\" data-pass>Mit dem CVLibre Pass bleibt die KI verfügbar</a>";
    });
  }
  function load() { fetch(API, { cache: "no-store" }).then(function (r) { return r.json(); }).then(paint).catch(function () { boxes.forEach(function (b) { b.querySelector(".aib-v").textContent = ""; }); }); }
  load();
  setInterval(function () { if (!document.hidden) load(); }, 30000);
  /* après chaque appel à l'IA sur la page, on rafraîchit la jauge */
  var of = window.fetch;
  window.fetch = function (u) { var p = of.apply(window, arguments); try { var s = String(u && u.url ? u.url : u); if (s.indexOf("cvlibre-ai-production") > -1 && s.indexOf("/usage") === -1 && s.indexOf("/support") === -1) p.then(function () { setTimeout(load, 300); }, function () {}); } catch (e) {} return p; };
})();
