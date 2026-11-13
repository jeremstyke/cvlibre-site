/* Généré par tools/i18n/build_de.py depuis assets/render.js : ne pas modifier à la main. */
/* Génère le HTML de la feuille de CV à partir de l'état. Partagé par l'accueil et le créateur. */
(function () {
  "use strict";
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };
  var clean = function (s) { return String(s == null ? "" : s).trim(); };

  // Texte libre : les lignes qui commencent par "-" ou "•" deviennent une liste à puces.
  function fmt(text) {
    var lines = clean(text).split(/\r?\n/), out = "", list = [];
    var flush = function () { if (list.length) { out += "<ul>" + list.join("") + "</ul>"; list = []; } };
    lines.forEach(function (l) {
      var t = l.trim();
      if (!t) { flush(); return; }
      var m = t.match(/^[-•*]\s+(.*)$/);
      if (m) list.push("<li>" + esc(m[1]) + "</li>");
      else { flush(); out += "<p>" + esc(t) + "</p>"; }
    });
    flush();
    return out;
  }
  function dates(a, b) {
    a = clean(a); b = clean(b);
    return a && b ? esc(a) + " - " + esc(b) : esc(a || b);
  }
  function sec(title, inner) { return inner ? '<section class="c-sec"><h2>' + esc(title) + "</h2>" + inner + "</section>" : ""; }
  function contactList(s) {
    var rows = [s.email, s.phone, s.city, s.link].map(clean).filter(Boolean);
    return rows.length ? '<ul class="c-list">' + rows.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + "</ul>" : "";
  }
  function items(list, fn) { return (list || []).map(fn).filter(Boolean).join(""); }

  function render(s) {
    var photo = s.photo ? '<img class="c-photo" alt="" src="' + esc(s.photo) + '">' : "";
    var contact = contactList(s);
    var exp = items(s.exp, function (e) {
      if (!clean(e.role) && !clean(e.company) && !clean(e.desc)) return "";
      var sub = [clean(e.company), clean(e.city)].filter(Boolean).map(esc).join(", ");
      return '<article class="c-item"><div class="c-line"><strong>' + esc(e.role) + '</strong><span class="c-date">' + dates(e.from, e.to) + "</span></div>" +
        (sub ? '<div class="c-sub">' + sub + "</div>" : "") + (clean(e.desc) ? '<div class="c-desc">' + fmt(e.desc) + "</div>" : "") + "</article>";
    });
    var edu = items(s.edu, function (e) {
      if (!clean(e.degree) && !clean(e.school) && !clean(e.desc)) return "";
      return '<article class="c-item"><div class="c-line"><strong>' + esc(e.degree) + '</strong><span class="c-date">' + dates(e.from, e.to) + "</span></div>" +
        (clean(e.school) ? '<div class="c-sub">' + esc(e.school) + "</div>" : "") + (clean(e.desc) ? '<div class="c-desc">' + fmt(e.desc) + "</div>" : "") + "</article>";
    });
    var skills = clean(s.skills).split(/[,\n]/).map(clean).filter(Boolean);
    var langs = items(s.langs, function (l) {
      return clean(l.name) ? "<li><b>" + esc(l.name) + "</b>" + (clean(l.level) ? "<span>" + esc(l.level) + "</span>" : "") + "</li>" : "";
    });
    var hobbies = clean(s.hobbies);
    var main = sec("Profil", clean(s.summary) ? '<div class="c-desc">' + fmt(s.summary) + "</div>" : "") +
      sec("Berufserfahrung", exp) + sec("Ausbildung", edu);
    var side = (contact ? '<section class="c-sec c-contact-s"><h2>Kontakt</h2>' + contact + "</section>" : "") +
      sec("Kenntnisse", skills.length ? '<ul class="c-tags">' + skills.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul>" : "") +
      sec("Sprachen", langs ? '<ul class="c-lang">' + langs + "</ul>" : "") +
      sec("Interessen", hobbies ? '<div class="c-desc">' + fmt(hobbies) + "</div>" : "");
    return '<div class="cv"><header class="c-head"><div class="c-id"><h1>' + esc(s.name || "Ihr Name") + "</h1>" +
      (clean(s.title) ? '<p class="c-title">' + esc(s.title) + "</p>" : "") + "</div>" +
      (photo ? photo.replace('class="c-photo"', 'class="c-photo c-photo-h"') : "") +
      (contact ? '<div class="c-contact-h">' + contact + "</div>" : "") + "</header>" +
      '<div class="c-cols"><div class="c-main">' + main + '</div><aside class="c-side">' +
      (photo ? photo.replace('class="c-photo"', 'class="c-photo c-photo-s"') : "") + side + "</aside></div></div>";
  }

  var sample = {
    tpl: "moderne", accent: "#1f4fd8", photo: "",
    name: "Laura Becker", title: "Online-Marketing-Managerin",
    email: "laura.becker@example.com", phone: "0151 23456789", city: "Köln", link: "linkedin.com/in/laura-becker",
    summary: "Online-Marketing-Managerin mit 5 Jahren Erfahrung in Agentur und Unternehmen. Ich helfe Marken, mit klaren Inhalten und datenbasierten Kampagnen ihre Reichweite zu steigern. Auf der Suche nach einer Position als Marketing-Leiterin.",
    exp: [
      { role: "Online-Marketing-Managerin", company: "Nordlicht Studio GmbH", city: "Köln", from: "09/2022", to: "heute", desc: "- Betreuung von 4 Social-Media-Kanälen (+38 % Follower in einem Jahr)\n- Verfassen des monatlichen Newsletters (6.200 Abonnenten)\n- Steuerung eines Werbebudgets von 12.000 € pro Jahr" },
      { role: "Marketing-Assistentin", company: "Brightside Agentur", city: "Düsseldorf", from: "09/2020", to: "08/2022", desc: "- Erstellung von Inhalten für 12 Kunden\n- Auswertung der Kennzahlen und monatliche Berichte" }
    ],
    edu: [
      { degree: "M.A. Medien- und Kommunikationswissenschaft", school: "Universität zu Köln", from: "2018", to: "2020", desc: "" },
      { degree: "B.A. Medienwissenschaft", school: "Universität Bonn", from: "2015", to: "2018", desc: "" }
    ],
    skills: "Content-Strategie, Social Media, Texten, Canva, Google Analytics, Mailchimp",
    langs: [{ name: "Deutsch", level: "Muttersprache" }, { name: "Englisch", level: "Verhandlungssicher (C1)" }, { name: "Französisch", level: "Gute Kenntnisse (B1)" }],
    hobbies: "Fotografie, Wandern, Ehrenamt bei der Tafel"
  };

  window.CVR = { render: render, sample: sample, esc: esc };
})();
