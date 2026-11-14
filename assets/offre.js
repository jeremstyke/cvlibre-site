/* 14 nov 2026 (Jeremy): one page per job posted by a recruiter on CVLibre, with JobPosting data so Google can show it in its jobs box.
   Only CVLibre's own verified jobs (never Careerjet / Jooble ones). URL: <jobs page>/<offre|job|stelle>/?id=<uuid> */
(function () {
  "use strict";
  var SB = "https://zltqrnflowxkycrjmhbx.supabase.co/rest/v1/", KEY = "sb_publishable_KVXGhm7oHvaymjzOZyfp6A_03X6EcXr";
  var path = location.pathname.replace(/[^/]*$/, ""), seg = path.split("/")[1] || "";
  var CC = { "offres-emploi": "FR", en: "GB", us: "US", ca: "CA", au: "AU", nz: "NZ", de: "DE" }[seg] || "FR";
  var lang = CC === "FR" ? "fr" : CC === "DE" ? "de" : "en";
  var list = path.replace(/[^/]+\/$/, "");
  var T = {
    fr: { badge: "Publiée sur CVLibre · offre vérifiée", apply: "Postuler", cv: "Adapter mon CV", lt: "Lettre de motivation", all: "← Toutes les offres d'emploi", gone: "Cette offre n'est plus disponible. Elle a peut-être été pourvue ou a expiré.", load: "Chargement de l'offre...", nc: "Entreprise non précisée", posted: "Publiée le ", until: " · jusqu'au ", subj: "Candidature : ", cvUrl: "/creer-un-cv/?offre=1", ltUrl: "/lettre-de-motivation/?offre=1", loc: "fr-FR" },
    en: { badge: "Posted on CVLibre · verified job", apply: "Apply", cv: "Tailor my CV", lt: "Cover letter", all: "← All jobs", gone: "This job is no longer available. It may have been filled or expired.", load: "Loading the job...", nc: "Company not specified", posted: "Posted on ", until: " · until ", subj: "Application: ", cvUrl: "cv-builder/?offre=1", ltUrl: "cover-letter/?offre=1", loc: "en-GB" },
    de: { badge: "Auf CVLibre veröffentlicht · geprüftes Angebot", apply: "Bewerben", cv: "Lebenslauf anpassen", lt: "Anschreiben", all: "← Alle Stellenangebote", gone: "Dieses Angebot ist nicht mehr verfügbar. Es wurde vielleicht besetzt oder ist abgelaufen.", load: "Angebot wird geladen...", nc: "Unternehmen nicht angegeben", posted: "Veröffentlicht am ", until: " · bis ", subj: "Bewerbung: ", cvUrl: "/de/lebenslauf-erstellen/?offre=1", ltUrl: "/de/anschreiben/?offre=1", loc: "de-DE" }
  }[lang];
  if (lang === "en") { var base = "/" + seg + "/"; var rb = CC === "US" || CC === "CA" || CC === "AU"; T.cvUrl = base + (rb ? "resume-builder/?offre=1" : "cv-builder/?offre=1"); T.ltUrl = base + "cover-letter/?offre=1"; if (rb) T.cv = "Tailor my resume"; }
  var root = document.getElementById("of"), id = new URLSearchParams(location.search).get("id") || "";
  function el(tag, cls, txt) { var d = document.createElement(tag); if (cls) d.className = cls; if (txt != null) d.textContent = txt; return d; }
  function meta(name, val, prop) { var m = document.querySelector('meta[' + (prop ? "property" : "name") + '="' + name + '"]'); if (!m) { m = document.createElement("meta"); m.setAttribute(prop ? "property" : "name", name); document.head.appendChild(m); } m.setAttribute("content", val); }
  function stat(e, x) { try { window.CVSTAT && window.CVSTAT(e, x); } catch (er) {} }
  function hit(k) { try { fetch(SB + "rpc/job_hit", { method: "POST", keepalive: true, headers: { apikey: KEY, "Content-Type": "application/json" }, body: JSON.stringify({ p_ids: [id], p_kind: k }) }).catch(function () {}); } catch (e) {} }
  function day(iso) { var t = Date.parse(iso); return t ? new Date(t).toLocaleDateString(T.loc, { day: "numeric", month: "long", year: "numeric" }) : ""; }
  function gone() {
    meta("robots", "noindex, follow");
    root.textContent = ""; root.appendChild(el("p", "hint", T.gone));
    var a = el("a", "btn", T.all.replace("← ", "")); a.href = list; root.appendChild(a);
  }
  if (!/^[0-9a-f-]{36}$/i.test(id)) return gone();
  root.appendChild(el("p", "hint", T.load));
  fetch(SB + "job_posts?select=id,company,title,city,contract,hours,salary,description,apply_url,apply_email,approved_at,expires_at,country&id=eq." + id + "&country=eq." + CC + "&status=eq.approved&expires_at=gt." + encodeURIComponent(new Date().toISOString()), { headers: { apikey: KEY } })
    .then(function (r) { return r.ok ? r.json() : []; }, function () { return []; })
    .then(function (l) {
      var o = l && l[0]; if (!o) return gone();
      var url = "https://cvlibre.com" + path + "?id=" + o.id;
      document.title = o.title + (o.city ? " - " + o.city : "") + " | " + (o.company || "CVLibre");
      var desc = String(o.description || "").replace(/\s+/g, " ").slice(0, 155);
      meta("description", desc); meta("og:title", document.title, true); meta("og:description", desc, true); meta("og:url", url, true);
      var c = document.querySelector('link[rel="canonical"]') || document.head.appendChild(Object.assign(document.createElement("link"), { rel: "canonical" })); c.href = url;
      root.textContent = "";
      var back = el("a", "of-back", T.all); back.href = list; root.appendChild(back);
      root.appendChild(el("p", "jb-badge", T.badge));
      root.appendChild(el("h1", "", o.title));
      root.appendChild(el("p", "jb-meta", [o.company || T.nc, o.city].filter(Boolean).join(" · ")));
      var tags = el("p", "jb-tags"); [o.contract, o.hours, o.salary].filter(Boolean).forEach(function (t) { tags.appendChild(el("span", "jb-tag", t)); }); if (tags.childNodes.length) root.appendChild(tags);
      var act = el("div", "jb-act");
      var ap = el("a", "btn", T.apply); ap.href = o.apply_url || ("mailto:" + o.apply_email + "?subject=" + encodeURIComponent(T.subj + o.title)); ap.target = "_blank"; ap.rel = "noopener";
      ap.addEventListener("click", function () { hit("click"); stat("job_open", "cvl-" + o.id); });
      var ho = function () { try { localStorage.setItem("cvlibre.offre", JSON.stringify({ titre: o.title, entreprise: o.company, lieu: o.city, ad: (o.title + (o.company ? " - " + o.company : "") + (o.city ? " - " + o.city : "") + (o.contract ? " - " + o.contract : "") + "\n\n" + o.description).slice(0, 5000), url: ap.href, at: Date.now() })); } catch (e) {} };
      var cv = el("a", "btn btn-ghost", T.cv); cv.href = T.cvUrl; cv.addEventListener("click", function () { ho(); stat("job_tailor", "cvl-" + o.id); });
      var lt = el("a", "btn btn-ghost", T.lt); lt.href = T.ltUrl; lt.addEventListener("click", function () { ho(); stat("job_letter", "cvl-" + o.id); });
      act.appendChild(ap); act.appendChild(cv); act.appendChild(lt); root.appendChild(act);
      var d = el("div", "of-desc"); d.style.whiteSpace = "pre-line"; d.textContent = o.description || ""; root.appendChild(d);
      root.appendChild(el("p", "jb-date", T.posted + day(o.approved_at) + T.until + day(o.expires_at)));
      var act2 = act.cloneNode(true); act2.querySelector("a").addEventListener("click", function () { hit("click"); });
      act2.querySelectorAll("a")[1].addEventListener("click", ho); act2.querySelectorAll("a")[2].addEventListener("click", ho); root.appendChild(act2);
      // Google Jobs (JobPosting)
      var esc = function (t) { return String(t || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
      var ct = String(o.contract || "").toLowerCase();
      var et = /cdi|permanent|unbefristet|full/.test(ct) ? "FULL_TIME" : /altern|apprenti|ausbildung|intern/.test(ct) ? "INTERN" : /cdd|intérim|interim|saison|season|temporar|contract|befristet/.test(ct) ? "TEMPORARY" : /partiel|part/.test(ct + " " + String(o.hours || "").toLowerCase()) ? "PART_TIME" : "OTHER";
      var jp = { "@context": "https://schema.org/", "@type": "JobPosting", title: o.title, description: "<p>" + esc(o.description).replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>") + "</p>",
        identifier: { "@type": "PropertyValue", name: "CVLibre", value: o.id }, datePosted: String(o.approved_at || "").slice(0, 10), validThrough: o.expires_at, employmentType: et,
        hiringOrganization: { "@type": "Organization", name: o.company || "CVLibre" },
        jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: o.city || "", addressCountry: CC === "GB" ? "GB" : CC } }, directApply: false };
      var s = document.createElement("script"); s.type = "application/ld+json"; s.textContent = JSON.stringify(jp); document.head.appendChild(s);
      hit("view"); stat("job_page", "cvl-" + o.id);
    });
})();
