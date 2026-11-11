/* Statistiques anonymes : aucun cookie, aucun identifiant, pas d'adresse IP enregistrée. */
(function () {
  "use strict";
  try { if (localStorage.getItem("cvlibre.nostats") === "1") return; } catch (e) {}
  if (/[?&]nostats=1/.test(location.search)) { try { localStorage.setItem("cvlibre.nostats", "1"); } catch (e) {} return; }
  if (navigator.doNotTrack === "1" || /^(localhost|127\.)/.test(location.hostname)) return;
  var path = location.pathname;
  if (/^\/(mon-espace|stats)\//.test(path)) return;
  var URL_ = "https://zltqrnflowxkycrjmhbx.supabase.co/rest/v1/rpc/track", KEY = "sb_publishable_KVXGhm7oHvaymjzOZyfp6A_03X6EcXr";
  var of = window.fetch ? window.fetch.bind(window) : null;
  if (!of) return;
  var ref = "";
  try { if (document.referrer) { var h = new URL(document.referrer).hostname.replace(/^www\./, ""); ref = h === location.hostname.replace(/^www\./, "") ? "interne" : h; } } catch (e) {}
  var dev = window.innerWidth < 700 ? "mobile" : "desktop";
  function send(ev, x) {
    try { of(URL_, { method: "POST", keepalive: true, headers: { "content-type": "application/json", apikey: KEY }, body: JSON.stringify({ p: path, e: ev, r: ref, d: dev, x: x || null }) }).catch(function () {}); } catch (e) {}
  }
  send("view");

  // Appels à l'IA : on compte l'action (remplir, reformuler, lettre...), jamais le contenu.
  window.fetch = function (u) {
    var p = of.apply(window, arguments);
    try {
      var s = String(u && u.url ? u.url : u);
      if (s.indexOf("cvlibre-ai-production") > -1 && s.indexOf("/pass/") === -1 && !/\/health/.test(s)) {
        var rt = s.split("?")[0].split("/").pop();
        send("ai", rt);
        p.then(function (r) { if (r && r.status === 402) send("ai_402", rt); }).catch(function () {});
      }
    } catch (e) {}
    return p;
  };

  function paid() { return !!(window.CVPASS && window.CVPASS.paid()); }
  document.addEventListener("click", function (e) {
    var t = e.target && e.target.closest ? e.target : null;
    if (!t) return;
    var el;
    if ((el = t.closest("#print"))) return send("pdf", paid() ? "clean" : "wm");
    if (t.closest("#wm-remove")) return send("wm_remove");
    if (t.closest("#wm-go")) return send("wm_go");
    if (t.closest("#pass-btn")) return send("pass_open");
    if (t.closest("#pass-buy")) return send("buy_pass");
    if (t.closest('a[href*="Cvlibre-pro"]')) return send("buy_pro");
    if (t.closest("#acc-google")) return send("login_google");
    if (t.closest("#acc-mail-go")) return send("login_mail");
    if ((el = t.closest(".tpl-card"))) return send(el.getAttribute("data-locked") === "1" ? "tpl_locked" : "tpl_pick", el.getAttribute("data-tpl"));
    if ((el = t.closest("#tpls button[data-tpl]"))) return send("tpl_pick", el.getAttribute("data-tpl"));
  }, true);

  window.addEventListener("load", function () {
    if (!window.CVPASS) return;
    var was = paid();
    window.CVPASS.onChange(function () { var now = paid(); if (now && !was) send("key_ok", window.CVPASS.plan()); was = now; });
  });
})();
