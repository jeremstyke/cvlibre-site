/* Jauge du budget IA du jour : se remplit au fil des utilisations de tous les visiteurs. */
(function () {
  "use strict";
  var API = "https://cvlibre-ai-production.up.railway.app/usage";
  var boxes = [].slice.call(document.querySelectorAll(".ai-budget"));
  if (!boxes.length) return;
  boxes.forEach(function (b) {
    b.innerHTML = '<div class="aib-top"><span class="aib-t">Budget IA du jour</span><span class="aib-v">...</span></div>' +
      '<div class="aib-bar" role="progressbar" aria-label="Budget IA du jour utilisé" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div>' +
      '<p class="aib-msg">Chaque utilisation de l\'IA nous coûte de l\'argent, et notre budget est limité chaque jour. Quand la jauge est pleine, l\'IA s\'arrête jusqu\'au lendemain. <a href="/soutenir/">Aidez-nous à la garder gratuite avec un don ❤️</a></p>';
  });
  function paint(d) {
    var p = Math.max(0, Math.min(100, Number(d.pct) || 0)), shown = p > 0 && p < 1 ? 1 : Math.round(p);
    boxes.forEach(function (b) {
      b.querySelector(".aib-bar i").style.width = Math.max(p, p > 0 ? 2 : 0) + "%";
      b.querySelector(".aib-bar").setAttribute("aria-valuenow", String(shown));
      b.querySelector(".aib-v").textContent = shown + " % utilisé" + (d.uses ? " · " + d.uses + " aide" + (d.uses > 1 ? "s" : "") + " de l'IA aujourd'hui" : "");
      b.classList.toggle("hot", p >= 70); b.classList.toggle("full", p >= 100);
      if (p >= 100) b.querySelector(".aib-msg").innerHTML = "Le budget IA du jour est épuisé : l'IA revient demain. Le reste du site fonctionne normalement. <a href=\"/soutenir/\">Un don nous aide à augmenter ce budget ❤️</a>";
    });
  }
  function load() { fetch(API, { cache: "no-store" }).then(function (r) { return r.json(); }).then(paint).catch(function () { boxes.forEach(function (b) { b.querySelector(".aib-v").textContent = ""; }); }); }
  load();
  setInterval(function () { if (!document.hidden) load(); }, 30000);
  /* après chaque appel à l'IA sur la page, on rafraîchit la jauge */
  var of = window.fetch;
  window.fetch = function (u) { var p = of.apply(window, arguments); try { var s = String(u && u.url ? u.url : u); if (s.indexOf("cvlibre-ai-production") > -1 && s.indexOf("/usage") === -1 && s.indexOf("/support") === -1) p.then(function () { setTimeout(load, 300); }, function () {}); } catch (e) {} return p; };
})();
