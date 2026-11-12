/* 12 nov 2026 (Jeremy) : don en 1 clic via Stripe (lien de paiement, montant libre). Mettre le lien Stripe ici, une seule fois. */
(function () {
  var DON = "";
  var go = function () {
    document.querySelectorAll("a.don-btn").forEach(function (a) {
      if (DON) { a.href = DON; a.target = "_blank"; a.rel = "noopener"; a.hidden = false; }
      else if (a.dataset.soon !== "keep") { a.href = "/soutenir/"; }
    });
    document.querySelectorAll(".don-soon").forEach(function (p) { p.hidden = !!DON; });
    if (/[?&]merci=1/.test(location.search)) { var m = document.getElementById("don-merci"); if (m) m.hidden = false; }
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
})();
