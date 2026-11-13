/* Généré par tools/i18n/anglo_pages.py (nz) depuis la version UK, elle-même générée par tools/i18n/build.py depuis assets/render.js : ne pas modifier à la main. */
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
    var main = sec("Profile", clean(s.summary) ? '<div class="c-desc">' + fmt(s.summary) + "</div>" : "") +
      sec("Work experience", exp) + sec("Education", edu);
    var side = (contact ? '<section class="c-sec c-contact-s"><h2>Contact</h2>' + contact + "</section>" : "") +
      sec("Skills", skills.length ? '<ul class="c-tags">' + skills.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + "</ul>" : "") +
      sec("Languages", langs ? '<ul class="c-lang">' + langs + "</ul>" : "") +
      sec("Interests", hobbies ? '<div class="c-desc">' + fmt(hobbies) + "</div>" : "");
    return '<div class="cv"><header class="c-head"><div class="c-id"><h1>' + esc(s.name || "Your name") + "</h1>" +
      (clean(s.title) ? '<p class="c-title">' + esc(s.title) + "</p>" : "") + "</div>" +
      (photo ? photo.replace('class="c-photo"', 'class="c-photo c-photo-h"') : "") +
      (contact ? '<div class="c-contact-h">' + contact + "</div>" : "") + "</header>" +
      '<div class="c-cols"><div class="c-main">' + main + '</div><aside class="c-side">' +
      (photo ? photo.replace('class="c-photo"', 'class="c-photo c-photo-s"') : "") + side + "</aside></div></div>";
  }

  var sample = {
    tpl: "moderne", accent: "#1f4fd8", photo: "",
    name: "Emily Carter", title: "Digital Marketing Executive",
    email: "emily.carter@example.com", phone: "021 123 4567", city: "Auckland", link: "linkedin.com/in/emily-carter",
    summary: "Digital marketing executive with 5 years of agency and in-house experience. I help brands grow their audience with clear content and data-driven campaigns. Looking for a Marketing Manager role.",
    exp: [
      { role: "Digital Marketing Executive", company: "Northern Studio", city: "Auckland", from: "Sep 2022", to: "Present", desc: "- Managed 4 social media channels (+38% followers in one year)\n- Wrote the monthly newsletter (6,200 subscribers)\n- Ran a $15,000 yearly paid advertising budget" },
      { role: "Marketing Assistant", company: "Brightside Agency", city: "Manukau", from: "Sep 2020", to: "Aug 2022", desc: "- Created content for 12 clients\n- Tracked analytics and wrote monthly reports" }
    ],
    edu: [
      { degree: "Master of Communication", school: "University of Auckland", from: "2019", to: "2020", desc: "" },
      { degree: "Bachelor of Communication", school: "Victoria University of Wellington", from: "2016", to: "2019", desc: "" }
    ],
    skills: "Content strategy, Social media, Copywriting, Canva, Google Analytics, Mailchimp",
    langs: [{ name: "English", level: "Native" }, { name: "Spanish", level: "Fluent (C1)" }, { name: "French", level: "Intermediate" }],
    hobbies: "Photography, hiking, volunteering at a local food bank"
  };

  window.CVR = { render: render, sample: sample, esc: esc };
})();
