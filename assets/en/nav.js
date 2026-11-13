/* Généré par tools/i18n/build.py depuis assets/nav.js : ne pas modifier à la main. */
/* En-tête : « Mon compte » et « Se déconnecter » si une session existe, et reprise d'un lien de connexion arrivé sur une autre page. */
(function () {
  "use strict";
  var REF = /^sb-zltqrnflowxkycrjmhbx-auth-token/;
  function keys() { var r = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && REF.test(k)) r.push(k); } return r; }
  function show(on) {
    var nav = document.querySelector(".nav"), a = document.getElementById("nav-acc"), o = document.getElementById("nav-out");
    if (nav) nav.classList.toggle("in", !!on);
    if (a) { a.textContent = on ? "My account" : "Sign in"; a.setAttribute("href", on ? "/en/cv-builder/?account=1" : "/en/cv-builder/?connexion=1"); }
    if (o) o.hidden = !on;
    var sw = document.querySelector(".mode-sw"); if (sw) sw.hidden = !on;
  }
  window.CVNAV = { show: show };
  try {
    /* 13 nov 2026 : le lien de connexion ramène sur la page d'où la personne s'est connectée (recruteurs, mon espace...), sinon sur le créateur de CV */
    if (/access_token=|error_code=/.test(location.hash)) {
      var back = ""; try { var b = JSON.parse(localStorage.getItem("cv_back") || "null"); if (b && b.p && Date.now() - b.t < 3 * 3600e3) back = b.p; } catch (x) {}
      var to = back || "/en/cv-builder/";
      if (location.pathname !== to) { location.replace(to + location.hash); return; }
      try { localStorage.removeItem("cv_back"); } catch (x) {}
    }
    show(keys().some(function (k) { return !!localStorage.getItem(k); }));
    var o = document.getElementById("nav-out");
    if (o) o.addEventListener("click", function (e) {
      e.preventDefault();
      function done() { try { keys().forEach(function (k) { localStorage.removeItem(k); }); } catch (x) {} location.href = "/en/"; }
      if (window.CVACC && window.CVACC.signOut) window.CVACC.signOut().then(done, done); else done();
    });
  } catch (e) {}
})();
