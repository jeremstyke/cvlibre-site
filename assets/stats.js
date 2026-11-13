/* Statistiques anonymes : aucun cookie, aucun identifiant, pas d'adresse IP enregistrée. */
(function () {
  "use strict";
  try { if (localStorage.getItem("cvlibre.nostats") === "1") return; } catch (e) {}
  if (/[?&]nostats=1/.test(location.search)) { try { localStorage.setItem("cvlibre.nostats", "1"); } catch (e) {} return; }
  if (navigator.doNotTrack === "1" || /^(localhost|127\.)/.test(location.hostname)) return;
  /* Robots (Google, Bing, outils d'audit) : on ne les compte pas. */
  try {
    var ua = navigator.userAgent || "";
    if (navigator.webdriver || /bot|crawl|spider|slurp|mediapartners|adsbot|google-inspectiontool|googleother|storebot|lighthouse|pagespeed|headlesschrome|phantomjs|facebookexternalhit|preview|monitor|uptime|wget|curl|python-requests/i.test(ua)) return;
  } catch (e) {}
  var path = location.pathname;
  var SRC = "";
  try {
    var q = new URLSearchParams(location.search), us = q.get("utm_campaign") || q.get("utm_source") || (q.get("gclid") ? "google" : "");
    if (us) { SRC = "pub:" + us.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40); sessionStorage.setItem("cvlibre.src", SRC); }
    else SRC = sessionStorage.getItem("cvlibre.src") || "";
  } catch (e) {}
  if (/^\/(mon-espace|stats)\//.test(path)) return;
  var URL_ = "https://zltqrnflowxkycrjmhbx.supabase.co/rest/v1/rpc/track", KEY = "sb_publishable_KVXGhm7oHvaymjzOZyfp6A_03X6EcXr";
  var of = window.fetch ? window.fetch.bind(window) : null;
  if (!of) return;
  var ref = "";
  try { if (document.referrer) { var h = new URL(document.referrer).hostname.replace(/^www\./, ""); ref = h === location.hostname.replace(/^www\./, "") ? "interne" : h; } } catch (e) {}
  var dev = window.innerWidth < 700 ? "mobile" : "desktop";
  if (SRC) ref = SRC;
  function send(ev, x) {
    try { of(URL_, { method: "POST", keepalive: true, headers: { "content-type": "application/json", apikey: KEY }, body: JSON.stringify({ p: path, e: ev, r: ref, d: dev, x: x || null }) }).catch(function () {}); } catch (e) {}
  }
  send("view");
  window.CVSTAT = send;

  // Appels à l'IA : on compte l'action (remplir, reformuler, lettre...), jamais le contenu.
  window.fetch = function (u) {
    var p = of.apply(window, arguments);
    try {
      var s = String(u && u.url ? u.url : u);
      if (s.indexOf("cvlibre-ai-production") > -1 && !/\/(health|usage|jobs)/.test(s) && s.indexOf("/pass/") === -1) {
        var rt = s.split("?")[0].split("/").pop();
        send("ai", rt);
        p.then(function (r) { if (r && r.status === 402) send("ai_402", rt); }).catch(function () {});
      }
    } catch (e) {}
    return p;
  };

  var CT = (document.querySelector("main[data-type]") || { getAttribute: function () { return null; } }).getAttribute("data-type");
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    var el;
    if (t.closest("#print")) return send("pdf");
    if (t.closest("#lt-print")) return send("letter_pdf");
    if (t.closest("#ct-gen")) return send("courrier_ia", CT);
    if (t.closest("#ct-model")) return send("courrier_modele", CT);
    if ((el = t.closest("#ct-copy, #ct-mail, #ct-print"))) return send("courrier_export", CT);
    if (t.closest("#after-jobs")) return send("after_jobs");
    if (t.closest("#after-acc-go")) return send("after_account");
    if (t.closest("#after-don")) return send("after_don");
    if (t.closest("#acc-google")) return send("login_google");
    if (t.closest("#acc-mail-go")) return send("login_mail");
    if (t.closest('a[data-pass]') && !t.closest("#after-don")) return send("pass_link");
    if ((el = t.closest(".gal-card"))) return send("gal_pick", el.getAttribute("data-tpl"));
    if ((el = t.closest(".tpl-card"))) return send("tpl_pick", el.getAttribute("data-tpl"));
    if ((el = t.closest("#tpls button[data-tpl]"))) return send("tpl_pick", el.getAttribute("data-tpl"));
  }, true);

})();
