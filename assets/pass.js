/* 12 nov 2026 (Jeremy, "rends tout 100 % libre") : CVLibre est entièrement gratuit, financé par la publicité et le soutien volontaire.
   Plus de Pass ni de paiement : tout est ouvert à tout le monde (25 modèles, Personnaliser, PDF sans bandeau, lettres IA).
   Ce fichier garde l'objet CVPASS pour que les autres scripts fonctionnent sans changement : il répond toujours « tout est ouvert ». */
(function () {
  "use strict";
  try { localStorage.removeItem("cvlibre.pass"); localStorage.removeItem("cvlibre.buy"); } catch (e) {}
  var noop = function () {};
  window.CVPASS = {
    paid: function () { return true; }, key: function () { return ""; }, until: function () { return 0; }, plan: function () { return "free"; },
    activate: function () { return Promise.resolve({ ok: true }); }, forget: noop, holder: function () { return null; },
    bind: function () { return Promise.resolve({ ok: true }); }, askHolder: noop, exportPdf: function () { return Promise.resolve({ wm: false }); },
    onChange: noop, buyUrl: function () { return "/soutenir/"; }, resumeBuy: noop, setUser: noop, setLogin: noop
  };
})();
