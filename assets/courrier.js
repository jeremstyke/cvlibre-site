/* Courriers emploi avec l'IA : lettre de démission, rupture conventionnelle, relance après entretien, e-mail de candidature.
   La page déclare son type dans <main data-type="...">. Sans compte, rien n'est envoyé sauf à l'IA quand on clique sur « Rédiger ». */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var main = $("main[data-type]"); if (!main) return;
  var TYPE = main.getAttribute("data-type"), LETTER = main.getAttribute("data-letter") === "1";
  var AI = "https://cvlibre-ai-production.up.railway.app";
  var KEY = "cvlibre.courrier." + TYPE;

  /* champs propres à chaque courrier (le nom, les coordonnées et le destinataire sont communs) */
  var F = {
    demission: [["poste", "Poste que vous quittez", "Ex. Vendeur"], ["entreprise", "Entreprise", "Ex. Boulangerie Martin"], ["entree", "Date d'entrée dans l'entreprise (facultatif)", "Ex. 3 mars 2022"], ["preavis", "Préavis", "", [["", "Je ferai le préavis prévu (convention collective ou contrat)"], ["dispense", "Je demande à être dispensé(e) de préavis"], ["duree", "J'indique la durée moi-même"]]], ["duree", "Durée du préavis (si vous la connaissez)", "Ex. 1 mois"], ["motif", "Motif à indiquer (facultatif, ce n'est pas obligatoire)", "Laissez vide pour ne rien préciser"]],
    rupture: [["poste", "Votre poste", "Ex. Assistante administrative"], ["entreprise", "Entreprise", "Ex. Société Durand"], ["entree", "Date d'entrée (facultatif)", "Ex. septembre 2019"], ["motif", "Raison à évoquer brièvement (facultatif)", "Ex. Projet de reconversion professionnelle"]],
    relance: [["poste", "Poste", "Ex. Chargé de clientèle"], ["entreprise", "Entreprise", "Ex. Banque Exemple"], ["interlocuteur", "Personne rencontrée (facultatif)", "Ex. Mme Leroy"], ["date_entretien", "Date de l'entretien (facultatif)", "Ex. mardi 10 novembre"], ["point", "Un point marquant de l'entretien (facultatif)", "Ex. le projet d'ouverture d'une nouvelle agence"]],
    candidature: [["poste", "Poste visé", "Ex. Préparateur de commandes"], ["entreprise", "Entreprise", "Ex. Entrepôt Logistique Sud"], ["source", "Où avez-vous vu l'offre ? (facultatif)", "Ex. Indeed, France Travail, site de l'entreprise"], ["interlocuteur", "Destinataire (facultatif)", "Ex. M. Dupont, responsable RH"], ["atouts", "Vos 2 ou 3 atouts pour ce poste", "Ex. 2 ans en entrepôt, CACES 1 et 3, disponible tout de suite"]]
  }[TYPE];
  if (!F) return;

  var S = { name: "", contact: "", rcpt: "", city: "", subject: "", body: "", f: {} };
  try { var o = JSON.parse(localStorage.getItem(KEY) || "null"); if (o && typeof o === "object") S = Object.assign(S, o); } catch (e) {}
  try { if (!S.name) { var cv = JSON.parse(localStorage.getItem("cvlibre.v1") || "null"); if (cv && cv.name && cv.name !== "Camille Martin") { S.name = cv.name; S.contact = [cv.city, cv.phone, cv.email].filter(Boolean).join("\n"); } } } catch (e) {}
  var saveT = 0; function save() { clearTimeout(saveT); saveT = setTimeout(function () { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }, 300); }

  /* formulaire */
  var box = $("#ct-fields");
  F.forEach(function (d) {
    var w = document.createElement("div"); w.className = "fld"; w.id = "w-" + d[0];
    var lab = document.createElement("label"); lab.htmlFor = "c-" + d[0]; lab.textContent = d[1]; w.appendChild(lab);
    var el;
    if (d[3]) { el = document.createElement("select"); d[3].forEach(function (op) { var x = document.createElement("option"); x.value = op[0]; x.textContent = op[1]; el.appendChild(x); }); }
    else if (d[0] === "atouts" || d[0] === "point" || d[0] === "motif") { el = document.createElement("textarea"); el.rows = 3; }
    else { el = document.createElement("input"); el.autocomplete = "off"; }
    el.id = "c-" + d[0]; el.maxLength = 500; if (d[2]) el.placeholder = d[2];
    el.value = S.f[d[0]] || "";
    el.addEventListener("input", function () { S.f[d[0]] = el.value; save(); vis(); });
    w.appendChild(el); box.appendChild(w);
  });
  function vis() { var w = $("#w-duree"); if (w) w.hidden = (S.f.preavis || "") !== "duree"; }
  vis();
  [["#ct-name", "name"], ["#ct-contact", "contact"], ["#ct-rcpt", "rcpt"], ["#ct-city", "city"], ["#ct-subject", "subject"], ["#ct-body", "body"]].forEach(function (p) {
    var el = $(p[0]); if (!el) return; el.value = S[p[1]] || "";
    el.addEventListener("input", function () { S[p[1]] = el.value; save(); paint(); });
  });

  /* aperçu (lettre) */
  var sheet = $("#lt-sheet"), pbox = $("#lt-box");
  function node(tag, cls, txt) { var n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }
  function lines(txt, cls) { var d = node("div", cls); String(txt || "").split("\n").forEach(function (l) { if (l.trim()) d.appendChild(node("div", "", l.trim())); }); return d; }
  function today() { return new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }); }
  function paint() {
    if (!sheet) return;
    sheet.textContent = "";
    var from = node("div", "lt-from"); if (S.name.trim()) from.appendChild(node("div", "lt-name", S.name.trim())); lines(S.contact).childNodes.forEach(function (c) { from.appendChild(c.cloneNode(true)); });
    sheet.appendChild(from);
    sheet.appendChild(lines(S.rcpt, "lt-to"));
    sheet.appendChild(node("div", "lt-date", (S.city.trim() ? "Fait à " + S.city.trim() + ", le " : "Le ") + today()));
    var mode = $("#ct-mode") ? $("#ct-mode").value : "";
    if (mode) sheet.appendChild(node("div", "lt-mode", mode));
    if (S.subject.trim()) { var o = node("div", "lt-obj"); o.appendChild(node("strong", "", "Objet : ")); o.appendChild(document.createTextNode(S.subject.trim())); sheet.appendChild(o); }
    String(S.body || "").split(/\n\s*\n/).forEach(function (p) { if (p.trim()) sheet.appendChild(node("p", "lt-p", p.trim().replace(/\n/g, " "))); });
    if (S.name.trim()) sheet.appendChild(node("div", "lt-sign", S.name.trim()));
    fit();
  }
  function fit() { if (!pbox) return; var w = pbox.clientWidth || 360, k = Math.min(1, w / 794); sheet.style.transform = "scale(" + k + ")"; pbox.style.height = Math.ceil(Math.max(sheet.offsetHeight, 1123) * k) + "px"; }
  window.addEventListener("resize", fit);
  window.addEventListener("beforeprint", function () { if (sheet) { sheet.style.transform = "none"; pbox.style.height = "auto"; } });
  window.addEventListener("afterprint", fit);
  if ($("#ct-mode")) $("#ct-mode").addEventListener("change", paint);
  paint();

  /* modèle sans IA (aucun coût, toujours disponible) */
  function v(k, ph) { var x = String(S.f[k] || "").trim(); return x || "[" + ph + "]"; }
  function model() {
    var n = S.name.trim() || "[Prénom Nom]";
    var T = {
      demission: function () {
        var pre = S.f.preavis === "dispense" ? "Je souhaiterais, si vous en êtes d'accord, être dispensé(e) de l'exécution de mon préavis." : S.f.preavis === "duree" ? "Conformément à mon contrat, j'effectuerai un préavis de " + v("duree", "durée du préavis") + ", à compter de la réception de ce courrier." : "J'effectuerai le préavis prévu par ma convention collective ou mon contrat de travail, à compter de la réception de ce courrier.";
        return ["Démission de mon poste de " + v("poste", "poste"), "Madame, Monsieur,\n\nPar la présente, je vous informe de ma décision de démissionner du poste de " + v("poste", "poste") + " que j'occupe au sein de " + v("entreprise", "entreprise") + (S.f.entree ? " depuis le " + S.f.entree.trim() : "") + "." + (S.f.motif && S.f.motif.trim() ? " " + S.f.motif.trim() + "." : "") + "\n\n" + pre + "\n\nJe vous remercie de bien vouloir me remettre, à la fin de mon contrat, mon solde de tout compte, mon certificat de travail et mon attestation France Travail.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."];
      },
      rupture: function () {
        return ["Demande de rupture conventionnelle", "Madame, Monsieur,\n\nSalarié(e) de " + v("entreprise", "entreprise") + (S.f.entree ? " depuis " + S.f.entree.trim() : "") + " en tant que " + v("poste", "poste") + ", je souhaite engager avec vous une discussion en vue d'une rupture conventionnelle de mon contrat de travail." + (S.f.motif && S.f.motif.trim() ? " Cette demande s'inscrit dans le cadre suivant : " + S.f.motif.trim() + "." : "") + "\n\nJe suis convaincu(e) qu'une séparation d'un commun accord serait la solution la plus adaptée, et je reste bien sûr disponible pour organiser la transmission de mes dossiers dans de bonnes conditions.\n\nJe vous propose de nous rencontrer lors d'un entretien, à la date qui vous conviendra, afin d'en discuter.\n\nJe vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées."];
      },
      relance: function () {
        var hi = S.f.interlocuteur && S.f.interlocuteur.trim() ? "Bonjour " + S.f.interlocuteur.trim() + "," : "Bonjour,";
        return ["Suite à notre entretien pour le poste de " + v("poste", "poste"), hi + "\n\nJe vous remercie encore pour notre entretien" + (S.f.date_entretien ? " du " + S.f.date_entretien.trim() : "") + " concernant le poste de " + v("poste", "poste") + " chez " + v("entreprise", "entreprise") + "." + (S.f.point && S.f.point.trim() ? " Notre échange sur " + S.f.point.trim() + " m'a confirmé mon envie de rejoindre votre équipe." : " Notre échange m'a confirmé mon envie de rejoindre votre équipe.") + "\n\nPourriez-vous me dire où en est votre processus de recrutement ? Je reste à votre disposition pour toute information complémentaire.\n\nBien cordialement,\n" + n];
      },
      candidature: function () {
        var hi = S.f.interlocuteur && S.f.interlocuteur.trim() ? "Bonjour " + S.f.interlocuteur.trim() + "," : "Madame, Monsieur,";
        return ["Candidature au poste de " + v("poste", "poste") + " - " + n, hi + "\n\nJe vous adresse ma candidature au poste de " + v("poste", "poste") + " chez " + v("entreprise", "entreprise") + (S.f.source ? ", vu sur " + S.f.source.trim() : "") + ".\n\n" + (S.f.atouts && S.f.atouts.trim() ? "En quelques mots : " + S.f.atouts.trim() + "." : "[Vos 2 ou 3 atouts pour ce poste].") + " Vous trouverez en pièces jointes mon CV et ma lettre de motivation.\n\nJe serais ravi(e) de vous rencontrer pour en parler.\n\nBien cordialement,\n" + n];
      }
    };
    var r = T[TYPE](); S.subject = r[0]; S.body = r[1]; $("#ct-subject").value = S.subject; $("#ct-body").value = S.body; save(); paint(); out();
    msg.textContent = "Le modèle est rempli avec vos informations. Complétez ce qui est entre crochets et relisez.";
  }

  /* IA */
  var gen = $("#ct-gen"), msg = $("#ct-msg");
  var ERR = { limit: "Vous avez utilisé vos 5 utilisations gratuites de l'IA pour aujourd'hui. Utilisez le modèle sans IA juste en dessous, ou revenez demain.", busy: "Le budget IA du jour est épuisé. Utilisez le modèle sans IA, ou revenez demain.", net: "Connexion impossible. Vérifiez votre connexion et réessayez.", empty: "Remplissez au moins le poste et l'entreprise." };
  gen.addEventListener("click", function () {
    if (!(S.f.poste || "").trim()) { msg.textContent = ERR.empty; return; }
    var fields = {}; Object.keys(S.f).forEach(function (k) { if (String(S.f[k] || "").trim()) fields[k] = S.f[k]; });
    if (S.name.trim()) fields.nom = S.name.trim();
    gen.disabled = true; gen.textContent = "L'IA rédige..."; msg.textContent = "Cela prend 5 à 10 secondes.";
    fetch(AI + "/courrier", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: TYPE, fields: fields, key: (window.CVP && window.CVP.tok()) || undefined }) })
      .then(function (r) { return r.json().catch(function () { return {}; }); }, function () { return { error: "net" }; })
      .then(function (j) {
        gen.disabled = false; gen.textContent = "Rédiger avec l'IA";
        if (!j || j.error || !j.letter) { msg.textContent = ERR[j && j.error] || "L'IA n'a pas réussi cette fois. Réessayez, cette utilisation n'est pas décomptée."; return; }
        S.subject = j.letter.subject || S.subject; S.body = j.letter.body; $("#ct-subject").value = S.subject; $("#ct-body").value = S.body; save(); paint(); out();
        msg.textContent = "C'est rédigé. Relisez, complétez ce qui est entre crochets et corrigez : l'IA peut se tromper." + (typeof j.left === "number" ? " Il vous reste " + j.left + " utilisation" + (j.left > 1 ? "s" : "") + " aujourd'hui." : "");
      });
  });
  $("#ct-model").addEventListener("click", model);

  /* résultat et actions */
  function out() { var r = $("#ct-result"); if (r) { r.hidden = false; if (window.innerWidth < 960) r.scrollIntoView({ behavior: "smooth", block: "start" }); } }
  if (S.body) $("#ct-result").hidden = false;
  function mailText() { var b = S.body.trim(), n = S.name.trim(); if (!LETTER && n && b.slice(-n.length) !== n) b += "\n" + n; return b; }
  var cp = $("#ct-copy");
  if (cp) cp.addEventListener("click", function () {
    var t = LETTER ? S.body : "Objet : " + S.subject + "\n\n" + mailText();
    (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(function () { cp.textContent = "Copié ✓"; setTimeout(function () { cp.textContent = "Copier le texte"; }, 2500); }, function () { $("#ct-body").select(); document.execCommand && document.execCommand("copy"); cp.textContent = "Copié ✓"; });
  });
  var ml = $("#ct-mail");
  if (ml) ml.addEventListener("click", function () { location.href = "mailto:?subject=" + encodeURIComponent(S.subject) + "&body=" + encodeURIComponent(mailText()); });
  var pr = $("#ct-print");
  if (pr) pr.addEventListener("click", function () { paint(); window.print(); });
})();
