/* En-tête : « Mon compte » si une session existe, et reprise d'un lien de connexion arrivé sur une autre page. */
(function () {
  "use strict";
  try {
    if (/access_token=|error_code=/.test(location.hash) && location.pathname.indexOf("/creer-un-cv/") !== 0) {
      location.replace("/creer-un-cv/" + location.hash); return;
    }
    var has = false;
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (k && /^sb-zltqrnflowxkycrjmhbx-auth-token/.test(k) && localStorage.getItem(k)) { has = true; break; }
    }
    if (has) { var a = document.querySelector('.nav a[href*="connexion=1"]'); if (a) a.textContent = "Mon compte"; }
  } catch (e) {}
})();
