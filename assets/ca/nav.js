/* Généré par tools/i18n/build.py depuis assets/nav.js : ne pas modifier à la main. */
/* En-tête : « Mon compte » et « Se déconnecter » si une session existe, et reprise d'un lien de connexion arrivé sur une autre page. */
(function () {
  "use strict";
  var REF = /^sb-zltqrnflowxkycrjmhbx-auth-token/;
  function keys() { var r = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && REF.test(k)) r.push(k); } return r; }
  function show(on) {
    var nav = document.querySelector(".nav"), a = document.getElementById("nav-acc"), o = document.getElementById("nav-out");
    if (nav) nav.classList.toggle("in", !!on);
    if (a) { a.textContent = on ? "My account" : "Sign in"; a.setAttribute("href", on ? "/ca/my-account/" : "/ca/resume-builder/?connexion=1"); }
    if (o) o.hidden = !on;
    var sw = document.querySelector(".mode-sw"); if (sw) sw.hidden = !on;
  }
  window.CVNAV = { show: show };
  /* 13 nov 2026 (Jeremy) : choix du pays en haut de chaque page (France, Royaume-Uni, Allemagne, États-Unis, Canada, Australie, Nouvelle-Zélande), vers la page équivalente quand elle existe. */
  try {
    var tin = document.querySelector(".top-in"), hl = (document.documentElement.lang || "fr").toLowerCase(); hl = /^(fr|de)/.test(hl) ? hl.slice(0, 2) : hl;
    if (tin && !document.getElementById("cty")) {
      /* Pays disponibles : chaque page déclare ses équivalents dans <link rel="alternate" hreflang="..."> */
      var C = [["fr", "🇫🇷", "FR", "France", "/"], ["en-GB", "🇬🇧", "UK", "United Kingdom", "/en/"], ["en-US", "🇺🇸", "US", "United States", "/us/"], ["en-CA", "🇨🇦", "CA", "Canada", "/ca/"], ["en-AU", "🇦🇺", "AU", "Australia", "/au/"], ["en-NZ", "🇳🇿", "NZ", "New Zealand", "/nz/"], ["de", "🇩🇪", "DE", "Deutschland", "/de/"]];
      var alt = function (c) { var x = document.querySelector('link[rel="alternate"][hreflang="' + c[0] + '"]'); return x ? x.getAttribute("href").replace(/^https:\/\/cvlibre\.com/, "") : c[4]; };
      var me = C.filter(function (c) { return c[0].toLowerCase() === hl; })[0] || C[0];
      var cty = document.createElement("details"); cty.className = "cty"; cty.id = "cty";
      cty.innerHTML = '<summary aria-label="Pays / Country / Land"><span class="cty-f" aria-hidden="true">' + me[1] + '</span><span class="cty-c">' + me[2] + '</span></summary>' +
        '<div class="cty-m">' + C.map(function (c) { return '<a href="' + alt(c) + '" hreflang="' + c[0] + '" lang="' + c[0].slice(0, 2) + '"' + (c === me ? ' aria-current="true"' : "") + '>' + c[1] + " " + c[3] + "</a>"; }).join("") + "</div>";
      tin.insertBefore(cty, tin.children[1] || null);
      document.addEventListener("click", function (e) { if (cty.open && !cty.contains(e.target)) cty.open = false; });
    }
  } catch (e) {}
  try {
    /* 13 nov 2026 : le lien de connexion ramène sur la page d'où la personne s'est connectée (recruteurs, mon espace...), sinon sur le créateur de CV */
    if (/access_token=|error_code=/.test(location.hash)) {
      var back = ""; try { var b = JSON.parse(localStorage.getItem("cv_back") || "null"); if (b && b.p && Date.now() - b.t < 3 * 3600e3) back = b.p; } catch (x) {}
      var to = back || "/ca/resume-builder/";
      if (location.pathname !== to) { location.replace(to + location.hash); return; }
      try { localStorage.removeItem("cv_back"); } catch (x) {}
    }
    show(keys().some(function (k) { return !!localStorage.getItem(k); }));
    var o = document.getElementById("nav-out");
    if (o) o.addEventListener("click", function (e) {
      e.preventDefault();
      function done() { try { keys().forEach(function (k) { localStorage.removeItem(k); }); } catch (x) {} location.href = "/ca/"; }
      if (window.CVACC && window.CVACC.signOut) window.CVACC.signOut().then(done, done); else done();
    });
  } catch (e) {}
})();
