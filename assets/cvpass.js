/* 13 nov 2026 (Jeremy) : Pass CVLibre 3 mois (Gumroad, 4,99 €). Fichier autonome, chargé par consent.js sur toutes les pages,
   avec ses propres textes FR / EN / DE (il n'est pas converti par tools/i18n).
   Le Pass : 50 IA par jour, CV adapté à chaque offre, score ATS, traduction du CV, 20 CV enregistrés, aucune pub.
   Etat lu dans la base (my_cv_pass) et gardé dans localStorage "cvlibre.cvpass" pour cacher la pub tout de suite. */
(function () {
  "use strict";
  if (window.CVP) return;
  var SB = "https://zltqrnflowxkycrjmhbx.supabase.co", PUB = "sb_publishable_KVXGhm7oHvaymjzOZyfp6A_03X6EcXr";
  var AI = "https://cvlibre-ai-production.up.railway.app";
  var K = "cvlibre.cvpass";
  var P = location.pathname, CC = (/^\/(en|us|ca|au|nz|de)\//.exec(P) || [])[1] || "fr";
  var L = CC === "fr" ? "fr" : CC === "de" ? "de" : "en";
  var DOC = CC === "us" || CC === "ca" ? "résumé" : CC === "au" ? "resume" : "CV";
  var ACC = CC === "fr" ? "/mon-espace/" : CC === "de" ? "/de/mein-konto/" : "/" + CC + "/my-account/";
  var BUY = { fr: "https://jeremstyke.gumroad.com/l/pass-cvlibre", de: "https://jeremstyke.gumroad.com/l/cvlibre-pass-de", en: "https://jeremstyke.gumroad.com/l/cvlibre-pass" }[L];
  var PRICE = L === "en" ? "$4.99" : "4,99 €";
  /* 13 nov 2026 (Jeremy) : Pass 1 an à 9,99 € TTC (9,99 $), en upsell au paiement Gumroad, et affiché sur le site à partir du 1er janvier 2027 (fin de la promo de lancement) */
  var BUY_Y = { fr: "https://jeremstyke.gumroad.com/l/pass-cvlibre-1an", de: "https://jeremstyke.gumroad.com/l/cvlibre-pass-1jahr", en: "https://jeremstyke.gumroad.com/l/cvlibre-pass-1year" }[L];
  var YEAR = { fr: "Ou 1 an pour 9,99 € : 12 mois pour le prix de 6", en: "Or 1 year for $9.99: 12 months for the price of 6", de: "Oder 1 Jahr für 9,99 €: 12 Monate zum Preis von 6" }[L];
  /* 13 nov 2026 (Jeremy) : offre de lancement -40 % jusqu'au 31 décembre 2026 (codes Gumroad LANCEMENT / LAUNCH / START, appliqués tout seuls dans le lien d'achat) */
  var PROMO_END = Date.parse("2026-12-31T23:59:00+01:00"), PROMO = Date.now() < PROMO_END;
  var PCODE = { fr: "LANCEMENT", en: "LAUNCH", de: "START" }[L], PNEW = L === "en" ? "$2.99" : "2,99 €";
  var PNOTE = { fr: "Offre de lancement jusqu'au 31 décembre", en: "Launch offer until 31 December", de: "Einführungsangebot bis 31. Dezember" }[L];
  function priceHtml() { return PROMO ? "<s class='cvp-old'>" + PRICE + "</s> <span class='cvp-price'>" + PNEW + "</span>" : "<span class='cvp-price'>" + PRICE + "</span>"; }
  /* 13 nov 2026 : article ATS de chaque pays, lié depuis l'offre et l'outil score ATS */
  var ATSU = CC === "fr" ? "/blog/cv-logiciel-recrutement-ats/" : CC === "de" ? "/de/ratgeber/ats-lebenslauf-bewerbermanagementsystem/" : "/" + CC + "/blog/ats-" + (CC === "en" || CC === "nz" ? "cv" : "resume") + "-applicant-tracking-systems/";
  var ATSL = { fr: "C'est quoi un ATS ?", en: "What is an ATS?", de: "Was ist ein ATS?" }[L];
  function atsA() { return " <a href='" + ATSU + "' target='_blank' rel='noopener'>" + ATSL + "</a>"; }
  var T = {
    fr: { name: "Pass CVLibre", per: "3 mois, paiement unique, sans abonnement", buy: "Obtenir le Pass", active: "Pass CVLibre actif jusqu'au ", f: ["Une IA plus puissante, et 50 utilisations par jour (au lieu de 5)", "CV adapté à chaque offre en un clic", "Score ATS : votre CV passe-t-il les logiciels des recruteurs ?", "Traduction de votre CV en anglais ou en allemand", "Jusqu'à 20 CV enregistrés (au lieu d'un seul)", "Aucune publicité sur le site"], free: "Le gratuit reste complet : CV, tous les modèles, PDF sans filigrane, lettres et courriers, 5 IA par jour et 1 CV enregistré.", need: "Cette fonction fait partie du Pass CVLibre.", login: "Connectez-vous d'abord (compte gratuit), puis vous pourrez prendre le Pass.", wait: "Paiement reçu ? Votre Pass s'active en quelques secondes...", done: "Merci ! Votre Pass CVLibre est actif.", close: "Fermer", ats: "Score ATS de mon CV (Pass)", atsHint: "L'IA vérifie si votre CV passe les logiciels de tri des recruteurs (ATS) et vous dit quoi corriger. Collez une offre pour un score par rapport à cette annonce (facultatif).", atsAd: "Offre d'emploi (facultatif)", atsGo: "Calculer mon score", atsWork: "L'IA analyse votre CV...", good: "Points forts", fix: "À corriger", kw: "Mots-clés à ajouter", tr: "Traduire mon CV (Pass)", trHint: "L'IA traduit tout votre CV, mise en page gardée. Gardez une copie : la traduction remplace le texte affiché (bouton Annuler juste après).", trGo: "Traduire", trWork: "Traduction en cours...", trOk: "CV traduit. Vérifiez-le avant de l'envoyer.", undo: "Annuler la traduction", to: { en: "en anglais", de: "en allemand", fr: "en français" }, err: "L'IA n'a pas réussi cette fois. Réessayez, cette utilisation n'est pas décomptée.", empty: "Remplissez d'abord votre CV.", limit: "Vous avez utilisé vos 50 utilisations de l'IA aujourd'hui. Revenez demain.", tag: "Pass" },
    en: { name: "CVLibre Pass", per: "3 months, one-time payment, no subscription", buy: "Get the Pass", active: "CVLibre Pass active until ", f: ["A more powerful AI, with 50 uses a day (instead of 5)", "Your CV tailored to each job in one click", "ATS score: does your CV get through recruiters' software?", "CV translation into another language", "Up to 20 CVs saved (instead of one)", "No ads on the site"], free: "The free version stays complete: CV, every template, PDF with no watermark, letters, 5 AI uses a day and 1 saved CV.", need: "This feature is part of the CVLibre Pass.", login: "Please sign in first (free account), then you can get the Pass.", wait: "Paid? Your Pass is activated within a few seconds...", done: "Thank you! Your CVLibre Pass is active.", close: "Close", ats: "ATS score of my CV (Pass)", atsHint: "The AI checks whether your CV gets through recruiters' screening software (ATS) and tells you what to fix. Paste a job ad to get a score for that ad (optional).", atsAd: "Job ad (optional)", atsGo: "Get my score", atsWork: "The AI is checking your CV...", good: "Strengths", fix: "To fix", kw: "Keywords to add", tr: "Translate my CV (Pass)", trHint: "The AI translates your whole CV and keeps the layout. The translation replaces the text on screen (Undo button right after).", trGo: "Translate", trWork: "Translating...", trOk: "CV translated. Check it before you send it.", undo: "Undo translation", to: { en: "into English", de: "into German", fr: "into French" }, err: "The AI did not manage this time. Try again, this use is not counted.", empty: "Fill in your CV first.", limit: "You have used your 50 AI uses for today. Come back tomorrow.", tag: "Pass" },
    de: { name: "CVLibre Pass", per: "3 Monate, Einmalzahlung, kein Abo", buy: "Pass holen", active: "CVLibre Pass aktiv bis ", f: ["Eine leistungsstärkere KI, mit 50 Nutzungen pro Tag (statt 5)", "Lebenslauf mit einem Klick an jede Stelle angepasst", "ATS-Score: Kommt Ihr Lebenslauf durch die Software der Personaler?", "Übersetzung Ihres Lebenslaufs ins Englische oder Französische", "Bis zu 20 gespeicherte Lebensläufe (statt einem)", "Keine Werbung auf der Website"], free: "Die kostenlose Version bleibt vollständig: Lebenslauf, alle Vorlagen, PDF ohne Wasserzeichen, Briefe, 5 KI-Nutzungen pro Tag und 1 gespeicherter Lebenslauf.", need: "Diese Funktion gehört zum CVLibre Pass.", login: "Bitte melden Sie sich zuerst an (kostenloses Konto), dann können Sie den Pass holen.", wait: "Bezahlt? Ihr Pass wird in wenigen Sekunden aktiviert...", done: "Vielen Dank! Ihr CVLibre Pass ist aktiv.", close: "Schließen", ats: "ATS-Score meines Lebenslaufs (Pass)", atsHint: "Die KI prüft, ob Ihr Lebenslauf die Bewerbersoftware der Personaler (ATS) besteht, und sagt Ihnen, was Sie verbessern sollten. Fügen Sie eine Stellenanzeige ein, um einen Score für diese Anzeige zu erhalten (optional).", atsAd: "Stellenanzeige (optional)", atsGo: "Score berechnen", atsWork: "Die KI prüft Ihren Lebenslauf...", good: "Stärken", fix: "Zu verbessern", kw: "Fehlende Schlüsselwörter", tr: "Lebenslauf übersetzen (Pass)", trHint: "Die KI übersetzt Ihren ganzen Lebenslauf, das Layout bleibt erhalten. Die Übersetzung ersetzt den angezeigten Text (Rückgängig-Knopf direkt danach).", trGo: "Übersetzen", trWork: "Wird übersetzt...", trOk: "Lebenslauf übersetzt. Bitte vor dem Versand prüfen.", undo: "Übersetzung rückgängig machen", to: { en: "ins Englische", de: "ins Deutsche", fr: "ins Französische" }, err: "Die KI hat es diesmal nicht geschafft. Versuchen Sie es erneut, diese Nutzung wird nicht gezählt.", empty: "Füllen Sie zuerst Ihren Lebenslauf aus.", limit: "Sie haben Ihre 50 KI-Nutzungen für heute verbraucht. Kommen Sie morgen wieder.", tag: "Pass" }
  }[L];
  var tx = function (s) { return DOC === "CV" ? s : s.replace(/\bCVs\b/g, DOC + "s").replace(/\bCV\b/g, DOC); };
  var st = null; try { st = JSON.parse(localStorage.getItem(K) || "null"); } catch (e) {}
  var sb = null, user = null, tok = "", cbs = [];
  function paid() { return !!(st && st.u && st.u > Date.now()); }
  function save(u) { st = u ? { u: u, id: user ? user.id : "" } : null; try { if (st) localStorage.setItem(K, JSON.stringify(st)); else localStorage.removeItem(K); } catch (e) {} cbs.forEach(function (f) { try { f(paid()); } catch (e) {} }); }
  function refresh() {
    if (!sb || !user) return Promise.resolve(paid());
    return sb.rpc("my_cv_pass").then(function (r) { if (!r.error) { var u = r.data ? Date.parse(r.data) : 0; save(u > Date.now() ? u : 0); } return paid(); });
  }
  function fmtD(t) { return new Date(t).toLocaleDateString(L === "fr" ? "fr-FR" : L === "de" ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric" }); }
  function buyUrl(y) {
    var u = y ? BUY_Y + "?wanted=true" : BUY + (PROMO ? "/" + PCODE : "") + "?wanted=true";
    if (user) u += "&cvl=" + encodeURIComponent(user.id) + (user.email ? "&email=" + encodeURIComponent(user.email) : "");
    return u;
  }
  function track(ev) { try { if (window.CVSTATS && window.CVSTATS.track) window.CVSTATS.track(ev); } catch (e) {} }
  function buy(ev) {
    var y = !!(ev && ev.currentTarget && ev.currentTarget.classList && ev.currentTarget.classList.contains("cvp-buy-y"));
    track(y ? "pass_buy_year" : "pass_buy");
    if (!user) { location.href = ACC + "?connexion=1&pass=1"; return; }
    try { localStorage.setItem("cvlibre.passbuy", String(Date.now())); } catch (e) {}
    window.open(buyUrl(y), "_blank", "noopener");
    watch();
  }
  var watching = 0;
  function watch() {
    if (watching) return; var n = 0;
    watching = setInterval(function () { n++; refresh().then(function (ok) { if (ok || n > 60) { clearInterval(watching); watching = 0; if (ok) toast(T.done); } }); }, 5000);
  }
  function toast(t) {
    var d = document.createElement("div"); d.textContent = t;
    d.style.cssText = "position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#14213d;color:#fff;padding:12px 18px;border-radius:12px;font:600 15px 'Source Sans 3',Arial,sans-serif;z-index:2147483647;box-shadow:0 8px 30px rgba(0,0,0,.25)";
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 5000);
  }
  function css() {
    if (document.getElementById("cvp-css")) return;
    var s = document.createElement("style"); s.id = "cvp-css";
    s.textContent = ".cvp-buy-y{display:block;margin:10px 0 2px;padding:0;background:none;border:0;color:#1f4fd8;font:inherit;font-size:14.5px;font-weight:600;text-decoration:underline;cursor:pointer;text-align:left}" + ".cvp-old{color:#8a93a8;font-weight:600;font-size:16px}.cvp-promo{display:inline-block;margin:2px 0 6px;padding:2px 8px;border-radius:999px;background:#ffe9a8;color:#5a4300;font-size:13px;font-weight:700}" + ".cvp-claim{margin-top:12px;border-top:1px solid #d6dff5;padding-top:10px}.cvp-claim summary{cursor:pointer;font-size:14px;color:#1f4fd8}.cvp-claim label{display:block;font-size:13.5px;margin:8px 0}.cvp-claim input{display:block;width:100%;box-sizing:border-box;margin-top:4px;padding:8px 10px;border:1px solid #c5cfe6;border-radius:8px;font:inherit}" + ".cvp-box{border:2px solid #1f4fd8;border-radius:16px;padding:18px;background:#f5f8ff}.cvp-box h2,.cvp-box h3{margin:0 0 4px}.cvp-price{font-size:22px;font-weight:800;color:#1f4fd8}.cvp-per{color:#55607a;font-size:14px;margin:0 0 10px}.cvp-box ul{margin:0 0 12px;padding:0;list-style:none}.cvp-box li{padding:3px 0}.cvp-box li:before{content:'✅ '}.cvp-free{font-size:13.5px;color:#55607a;margin:10px 0 0}.cvp-on{color:#137a3a;font-weight:700}.cvp-dlg{border:0;border-radius:16px;padding:0;max-width:440px;width:calc(100% - 24px)}.cvp-dlg::backdrop{background:rgba(16,24,40,.5)}.cvp-dlg .cvp-box{border:0}.cvp-x{float:right;background:none;border:0;font-size:22px;cursor:pointer;color:#55607a}.cvp-tag{display:inline-block;background:#1f4fd8;color:#fff;border-radius:6px;font-size:12px;font-weight:700;padding:1px 7px;margin-left:6px;vertical-align:2px}.cvp-score{font-size:34px;font-weight:800;color:#1f4fd8}.cvp-res h4{margin:12px 0 4px}.cvp-res ul{margin:0;padding-left:20px}";
    document.head.appendChild(s);
  }
  function boxHtml(h) {
    if (paid()) return "<" + h + ">" + T.name + "</" + h + "><p class='cvp-on'>" + T.active + fmtD(st.u) + "</p><ul>" + T.f.map(function (x, i) { return "<li>" + tx(x) + (i === 2 ? atsA() : "") + "</li>"; }).join("") + "</ul>";
    return "<" + h + ">" + T.name + " " + priceHtml() + "</" + h + ">" + (PROMO ? "<p class='cvp-promo'>" + PNOTE + "</p>" : "") + "<p class='cvp-per'>" + T.per + "</p><ul>" + T.f.map(function (x, i) { return "<li>" + tx(x) + (i === 2 ? atsA() : "") + "</li>"; }).join("") + "</ul><button type='button' class='btn cvp-buy'>" + T.buy + "</button>" + (PROMO ? "" : "<button type='button' class='link-btn cvp-buy-y'>" + YEAR + "</button>") + "<p class='cvp-free'>" + tx(T.free) + "</p>";
  }
  /* 13 nov 2026 : Pass payé avec une autre adresse e-mail (ou sans être connecté) : activation par numéro de commande Gumroad + e-mail d'achat */
  var CL = {
    fr: { q: "Déjà payé avec une autre adresse e-mail ?", hint: "Indiquez le numéro de commande de votre reçu Gumroad et l'adresse e-mail utilisée pour l'achat.", ord: "Numéro de commande", em: "E-mail de l'achat", go: "Activer mon Pass", no: "Achat introuvable. Vérifiez le numéro et l'e-mail, ou écrivez à contact@cvlibre.com.", ok: "Votre Pass est activé." },
    en: { q: "Already paid with another email address?", hint: "Enter the order number from your Gumroad receipt and the email address used for the purchase.", ord: "Order number", em: "Purchase email", go: "Activate my Pass", no: "Purchase not found. Check the number and the email, or write to contact@cvlibre.com.", ok: "Your Pass is active." },
    de: { q: "Schon mit einer anderen E-Mail-Adresse bezahlt?", hint: "Geben Sie die Bestellnummer aus Ihrem Gumroad-Beleg und die beim Kauf verwendete E-Mail-Adresse ein.", ord: "Bestellnummer", em: "E-Mail des Kaufs", go: "Pass aktivieren", no: "Kauf nicht gefunden. Prüfen Sie Nummer und E-Mail oder schreiben Sie an contact@cvlibre.com.", ok: "Ihr Pass ist aktiv." }
  }[L];
  function claimHtml() {
    return "<details class='cvp-claim'><summary>" + CL.q + "</summary><p class='cvp-free'>" + CL.hint + "</p>"
      + "<label>" + CL.ord + "<input type='text' class='cvp-ord' inputmode='numeric' autocomplete='off' maxlength='40'></label>"
      + "<label>" + CL.em + "<input type='email' class='cvp-em' autocomplete='email' maxlength='160'></label>"
      + "<button type='button' class='btn btn-ghost btn-sm cvp-claim-go'>" + CL.go + "</button><p class='cvp-free cvp-claim-msg' role='status'></p></details>";
  }
  function wireClaim(el) {
    var b = el.querySelector(".cvp-claim-go"); if (!b) return;
    b.addEventListener("click", function () {
      var o = el.querySelector(".cvp-ord").value.trim(), e = el.querySelector(".cvp-em").value.trim(), m = el.querySelector(".cvp-claim-msg");
      if (!o || !e || !sb) { m.textContent = CL.no; return; }
      b.disabled = true;
      sb.rpc("claim_cv_pass", { sid: o, em: e }).then(function (r) {
        b.disabled = false;
        var u = r && !r.error && r.data ? Date.parse(r.data) : 0;
        if (u > Date.now()) { save(u); track("pass_claim"); m.textContent = CL.ok; setTimeout(ui, 900); } else m.textContent = CL.no;
      }, function () { b.disabled = false; m.textContent = CL.no; });
    });
  }
  function wire(el) { var b = el.querySelector(".cvp-buy"); if (b) b.addEventListener("click", buy); var y = el.querySelector(".cvp-buy-y"); if (y) y.addEventListener("click", buy); }
  function offer(msg) {
    css(); var d = document.createElement("dialog"); d.className = "cvp-dlg";
    d.innerHTML = "<div class='cvp-box'><button type='button' class='cvp-x' aria-label='" + T.close + "'>×</button>" + (msg ? "<p><b>" + tx(msg) + "</b></p>" : "") + boxHtml("h3") + "</div>";
    document.body.appendChild(d); wire(d);
    d.querySelector(".cvp-x").onclick = function () { d.close(); d.remove(); };
    if (d.showModal) d.showModal(); else d.setAttribute("open", "");
  }
  /* Mon espace : encadré du Pass à la place de "CVLibre est gratuit" */
  function space() {
    var s = document.getElementById("sp-offer"); if (!s) return;
    css(); s.classList.add("cvp-box"); s.innerHTML = boxHtml("h2") + (user && !paid() ? claimHtml() : ""); wire(s); wireClaim(s);
    if (/[?&]pass=1/.test(location.search) && user && !paid()) { var b = s.querySelector(".cvp-buy"); if (b) { b.focus(); s.scrollIntoView({ block: "center" }); } }
  }
  /* Créateur de CV : adaptation à une offre réservée au Pass, score ATS et traduction en plus */
  function cvData() { try { return window.CVB ? window.CVB.get() : null; } catch (e) { return null; } }
  function post(path, body) {
    body.key = tok; body.lang = L; body.cc = CC.toUpperCase();
    return fetch(AI + path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().catch(function () { return {}; }); }).catch(function () { return { error: "net" }; });
  }
  function builder() {
    var tl = document.getElementById("tailor"); if (!tl || document.getElementById("cvp-ats")) return;
    css();
    var sm = tl.querySelector("summary"); if (sm && !sm.querySelector(".cvp-tag")) { sm.textContent = sm.textContent.replace(/\s*\((IA gratuite|free AI|kostenlose KI)\)\s*$/i, ""); sm.insertAdjacentHTML("beforeend", "<span class='cvp-tag'>" + T.tag + "</span>"); }
    var go = document.getElementById("tl-go");
    if (go) go.addEventListener("click", function (e) { if (!paid()) { e.stopImmediatePropagation(); e.preventDefault(); offer(T.need); } }, true);
    var hint = document.getElementById("tl-msg"); if (hint && !paid()) hint.textContent = T.need;
    var opts = L === "en" ? ["fr", "de"] : L === "de" ? ["en", "fr"] : ["en", "de"];
    var html = "<details class='fs' id='cvp-ats'><summary>" + tx(T.ats).replace(" (Pass)", "") + "<span class='cvp-tag'>" + T.tag + "</span></summary><div class='fs-body'><p class='hint'>" + tx(T.atsHint) + atsA() + "</p><div class='fld'><label for='cvp-ad'>" + T.atsAd + "</label><textarea id='cvp-ad' maxlength='5000'></textarea></div><div class='ai-actions'><button type='button' class='btn btn-sm' id='cvp-ats-go'>" + T.atsGo + "</button></div><p class='hint' id='cvp-ats-msg' role='status' aria-live='polite'></p><div class='cvp-res' id='cvp-ats-res' hidden></div></div></details>"
      + "<details class='fs' id='cvp-tr'><summary>" + tx(T.tr).replace(" (Pass)", "") + "<span class='cvp-tag'>" + T.tag + "</span></summary><div class='fs-body'><p class='hint'>" + tx(T.trHint) + "</p><div class='ai-actions'>" + opts.map(function (o) { return "<button type='button' class='btn btn-sm btn-ghost cvp-tr-go' data-to='" + o + "'>" + T.trGo + " " + T.to[o] + "</button>"; }).join(" ") + "<button type='button' class='link-btn' id='cvp-tr-undo' hidden>" + T.undo + "</button></div><p class='hint' id='cvp-tr-msg' role='status' aria-live='polite'></p></div></details>";
    tl.insertAdjacentHTML("afterend", html);
    var $ = function (id) { return document.getElementById(id); };
    $("cvp-ats-go").addEventListener("click", function () {
      if (!paid()) { offer(T.need); return; }
      var cv = cvData(); if (!cv || !(cv.title || cv.summary || (cv.exp || []).length)) { $("cvp-ats-msg").textContent = tx(T.empty); return; }
      var b = this; b.disabled = true; $("cvp-ats-msg").textContent = tx(T.atsWork); $("cvp-ats-res").hidden = true;
      post("/ats", { cv: JSON.stringify(cv), ad: $("cvp-ad").value.trim() }).then(function (j) {
        b.disabled = false;
        if (j.error || !j.ats) { $("cvp-ats-msg").textContent = j.error === "limit" ? T.limit : j.error === "pass" ? T.need : T.err; return; }
        var a = j.ats, li = function (x) { return (x || []).map(function (t) { var d = document.createElement("li"); d.textContent = t; return d.outerHTML; }).join(""); };
        $("cvp-ats-msg").textContent = "";
        $("cvp-ats-res").innerHTML = "<div class='cvp-score'>" + Math.max(0, Math.min(100, Number(a.score) || 0)) + " / 100</div>" + (a.good && a.good.length ? "<h4>" + T.good + "</h4><ul>" + li(a.good) + "</ul>" : "") + (a.fix && a.fix.length ? "<h4>" + T.fix + "</h4><ul>" + li(a.fix) + "</ul>" : "") + (a.keywords && a.keywords.length ? "<h4>" + T.kw + "</h4><ul>" + li(a.keywords) + "</ul>" : "");
        $("cvp-ats-res").hidden = false;
      });
    });
    var prev = null;
    Array.prototype.forEach.call(document.querySelectorAll(".cvp-tr-go"), function (b) {
      b.addEventListener("click", function () {
        if (!paid()) { offer(T.need); return; }
        var cv = cvData(); if (!cv || !(cv.title || cv.summary || (cv.exp || []).length)) { $("cvp-tr-msg").textContent = tx(T.empty); return; }
        var all = document.querySelectorAll(".cvp-tr-go"); Array.prototype.forEach.call(all, function (x) { x.disabled = true; });
        $("cvp-tr-msg").textContent = T.trWork;
        post("/translate", { cv: JSON.stringify(cv), to: b.getAttribute("data-to") }).then(function (j) {
          Array.prototype.forEach.call(all, function (x) { x.disabled = false; });
          if (j.error || !j.cv) { $("cvp-tr-msg").textContent = j.error === "limit" ? T.limit : j.error === "pass" ? T.need : T.err; return; }
          prev = cv; window.CVB.set(Object.assign({}, cv, j.cv)); $("cvp-tr-msg").textContent = tx(T.trOk); $("cvp-tr-undo").hidden = false;
        });
      });
    });
    $("cvp-tr-undo").addEventListener("click", function () { if (prev) { window.CVB.set(prev); prev = null; } this.hidden = true; $("cvp-tr-msg").textContent = ""; });
  }
  function ui() { try { space(); builder(); } catch (e) {} }
  function start() {
    var go = function () {
      sb = window.supabase.createClient(SB, PUB, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false } });
      sb.auth.onAuthStateChange(function (ev, s) {
        user = s && s.user ? s.user : null; tok = s && s.access_token ? s.access_token : "";
        if (ev === "SIGNED_OUT") save(0);
        refresh().then(ui);
      });
      sb.auth.getSession().then(function (r) {
        var s = r.data && r.data.session; user = s ? s.user : null; tok = s ? s.access_token : "";
        if (st && st.id && user && st.id !== user.id) save(0);
        refresh().then(function () { ui(); var t = 0; try { t = +localStorage.getItem("cvlibre.passbuy") || 0; } catch (e) {} if (t && Date.now() - t < 3600e3 && !paid()) watch(); });
      });
      document.addEventListener("visibilitychange", function () { if (!document.hidden) refresh().then(ui); });
    };
    ui();
    if (/[?&]pass=1/.test(location.search) && !/connexion=1/.test(location.search) && !paid()) offer();
    if (window.supabase) return go();
    if (!document.getElementById("sp-offer") && !document.getElementById("tailor") && !(st && st.u)) return; /* pages sans Pass : rien à charger */
    var s = document.createElement("script"); s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"; s.onload = go; document.head.appendChild(s);
  }
  window.CVP = { paid: paid, until: function () { return st ? st.u : 0; }, tok: function () { return paid() ? tok : ""; }, buy: buy, offer: offer, refresh: refresh, on: function (f) { cbs.push(f); } };
  /* 13 nov 2026 : les liens "Pass CVLibre" du site (data-pass) ouvrent l'offre sur place */
  document.addEventListener("click", function (ev) {
    var a = ev.target && ev.target.closest && ev.target.closest("a[data-pass]");
    if (!a || ev.defaultPrevented || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
    ev.preventDefault(); var d = document.querySelector("dialog[open]"); if (d && d.close && !d.classList.contains("cvp-dlg")) d.close(); offer();
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { setTimeout(start, 0); }); else setTimeout(start, 0);
})();
