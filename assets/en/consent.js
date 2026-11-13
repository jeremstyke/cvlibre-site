/* Généré par tools/i18n/build.py depuis assets/consent.js : ne pas modifier à la main. */
/* 12 nov 2026 (Jeremy) : consentement aux cookies publicitaires (Google AdSense). Aucune pub n'est demandée avant le choix.
   Refus : annonces non personnalisées. Choix gardé 6 mois. Le lien « Cookies » en bas de page rouvre la fenêtre. */
(function () {
  try {
    /* 13 nov 2026 (Jeremy) : Pass CVLibre = aucune pub. Le Pass est gardé dans localStorage par assets/cvpass.js (chargé ici sur toutes les pages). */
    var PASS = false; try { var pv = JSON.parse(localStorage.getItem("cvlibre.cvpass") || "null"); PASS = !!(pv && pv.u > Date.now()); } catch (e) {}
    try { var cs = document.createElement("script"); cs.src = "/assets/cvpass.js?v=20261113q"; cs.defer = true; document.head.appendChild(cs); } catch (e) {}
    if (PASS) {
      document.documentElement.classList.add("cvl-pass");
      var hs = document.createElement("style"); hs.textContent = ".ad-in,ins.adsbygoogle,.adsbygoogle{display:none!important}"; document.head.appendChild(hs);
      return;
    }
    var K = "cvlibre.consent", c = null;
    try { var v = JSON.parse(localStorage.getItem(K) || "null"); if (v && v.t && Date.now() - v.t < 15552000000) c = v.v; } catch (e) {}
    var A = window.adsbygoogle = window.adsbygoogle || [];
    function apply(v) { try { A.requestNonPersonalizedAds = v === "yes" ? 0 : 1; A.pauseAdRequests = 0; } catch (e) {} }
    function hide() { var b = document.getElementById("cvl-ck"); if (b) b.parentNode.removeChild(b); }
    function show() {
      hide();
      var b = document.createElement("div"); b.id = "cvl-ck"; b.setAttribute("role", "dialog"); b.setAttribute("aria-label", "Cookies");
      b.innerHTML = '<style>#cvl-ck{position:fixed;left:12px;right:12px;bottom:12px;z-index:2147483646;max-width:620px;margin:0 auto;background:#fff;color:#1b1f27;border:1px solid #d5dbe6;border-radius:14px;padding:16px 18px;font:15px/1.5 "Source Sans 3",Arial,sans-serif;box-shadow:0 10px 40px rgba(16,24,40,.18)}#cvl-ck p{margin:0 0 12px}#cvl-ck a{color:#1f4fd8}#cvl-ck .r{display:flex;gap:10px;flex-wrap:wrap}#cvl-ck button{flex:1;min-width:130px;cursor:pointer;font:700 15px "Source Sans 3",Arial,sans-serif;padding:10px 14px;border-radius:10px;border:2px solid #1f4fd8;background:#fff;color:#1f4fd8}#cvl-ck button:focus-visible{outline:3px solid #1f4fd8;outline-offset:2px}@media print{#cvl-ck{display:none!important}}</style>'
        + '<p>CVLibre is 100% free thanks to advertising (Google AdSense). Do you accept advertising cookies for personalised ads? If you decline, you will see non-personalised ads. <a href="/en/privacy/">Learn more</a></p>'
        + '<div class="r"><button type="button" data-v="no">Decline all</button><button type="button" data-v="yes">Accept all</button></div>';
      b.addEventListener("click", function (e) {
        var v = e.target && e.target.getAttribute ? e.target.getAttribute("data-v") : null; if (!v) return;
        try { localStorage.setItem(K, JSON.stringify({ v: v, t: Date.now() })); } catch (x) {}
        hide();
        if (c && c !== v) { location.reload(); return; }
        c = v; apply(v);
      });
      document.body.appendChild(b);
    }
    window.cvlCookies = show;
    function foot() {
      var n = document.querySelector('.foot nav'); if (!n || document.getElementById("cvl-ckl")) return;
      var a = document.createElement("a"); a.href = "#"; a.id = "cvl-ckl"; a.textContent = "Cookies";
      a.onclick = function (e) { e.preventDefault(); show(); }; n.appendChild(a);
    }
    function init() { try { foot(); } catch (e) {} if (c) apply(c); else show(); }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
  } catch (e) {}
})();
