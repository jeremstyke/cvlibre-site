/* 12 nov 2026 (Jeremy) : dons via Tipeee. Lien de don ici, une seule fois. */
(function () {
  var DON = "https://fr.tipeee.com/cvlibre/";
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
