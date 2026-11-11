/* En-tête : « Mon compte » et « Se déconnecter » si une session existe, et reprise d'un lien de connexion arrivé sur une autre page. */
(function () {
  "use strict";
  var REF = /^sb-zltqrnflowxkycrjmhbx-auth-token/;
  function keys() { var r = []; for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && REF.test(k)) r.push(k); } return r; }
  function show(on) {
    var nav = document.querySelector(".nav"), a = document.querySelector('.nav a[href*="connexion=1"]'), o = document.getElementById("nav-out");
    if (nav) nav.classList.toggle("in", !!on);
    if (a) a.textContent = on ? "Mon compte" : "Se connecter";
    if (o) o.hidden = !on;
  }
  window.CVNAV = { show: show };
  try {
    if (/access_token=|error_code=/.test(location.hash) && location.pathname.indexOf("/creer-un-cv/") !== 0) { location.replace("/creer-un-cv/" + location.hash); return; }
    show(keys().some(function (k) { return !!localStorage.getItem(k); }));
    var o = document.getElementById("nav-out");
    if (o) o.addEventListener("click", function (e) {
      e.preventDefault();
      function done() { try { keys().forEach(function (k) { localStorage.removeItem(k); }); } catch (x) {} location.href = "/"; }
      if (window.CVACC && window.CVACC.signOut) window.CVACC.signOut().then(done, done); else done();
    });
  } catch (e) {}
})();
