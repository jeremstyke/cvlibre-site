/* PDF Démarches France - modèles de documents à remplir. Tout est généré sur l'appareil, rien n'est envoyé. */
(function () {
  'use strict';
  var ASSETS = (document.currentScript && document.currentScript.src || '').replace(/forms\.js(\?.*)?$/, '');
  var HOME = ASSETS.replace(/assets\/$/, '');
  function load(src) { return new Promise(function (res, rej) { if (window.PDFLib) return res(); var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function el(t, a, h) { var e = document.createElement(t); if (a) Object.keys(a).forEach(function (k) { e.setAttribute(k, a[k]); }); if (h != null) e.innerHTML = h; return e; }
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function today() { var d = new Date(), t = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); return d.getDate() === 1 ? t.replace(/^1 /, '1er ') : t; }
  function fdate(s) { if (!s) return ''; var p = s.split('-'); if (p.length !== 3) return s; var d = new Date(+p[0], +p[1] - 1, +p[2]), t = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); return d.getDate() === 1 ? t.replace(/^1 /, '1er ') : t; }
  function v(o, k, ph) { var x = (o[k] || '').trim(); return x || ph || '[' + k + ']'; }
  var PENAL = "Je suis informé(e) qu'une fausse déclaration m'expose aux sanctions prévues par l'article 441-7 du Code pénal (un an d'emprisonnement et 15 000 euros d'amende).";

  /* ---------- les modèles ---------- */
  var F = {
    hebergement: {
      name: 'attestation-hebergement',
      fields: [
        ['h_civ', 'Hébergeant : civilité', 'select', ['Madame', 'Monsieur']], ['h_nom', 'Hébergeant : prénom et nom', 'text'], ['h_naiss', 'Hébergeant : date de naissance', 'date'], ['h_lieu', 'Hébergeant : lieu de naissance', 'text'],
        ['adresse', 'Adresse du logement', 'textarea'],
        ['p_civ', 'Personne hébergée : civilité', 'select', ['Madame', 'Monsieur']], ['p_nom', 'Personne hébergée : prénom et nom', 'text'], ['p_naiss', 'Personne hébergée : date de naissance', 'date'], ['p_lieu', 'Personne hébergée : lieu de naissance', 'text'],
        ['depuis', "Hébergée depuis le", 'date'], ['ville', 'Fait à (ville)', 'text']
      ],
      doc: function (o) {
        return {
          title: "ATTESTATION D'HÉBERGEMENT",
          body: [
            'Je soussigné(e) ' + v(o, 'h_civ') + ' ' + v(o, 'h_nom', '[prénom et nom]') + ', né(e) le ' + (fdate(o.h_naiss) || '[date]') + ' à ' + v(o, 'h_lieu', '[lieu]') + ', demeurant ' + v(o, 'adresse', '[adresse]').replace(/\n/g, ', ') + ',',
            'atteste sur l\'honneur héberger à mon domicile, à titre gratuit, ' + v(o, 'p_civ') + ' ' + v(o, 'p_nom', '[prénom et nom]') + ', né(e) le ' + (fdate(o.p_naiss) || '[date]') + ' à ' + v(o, 'p_lieu', '[lieu]') + ', depuis le ' + (fdate(o.depuis) || '[date]') + '.',
            PENAL,
            'Fait pour servir et valoir ce que de droit.'
          ],
          place: v(o, 'ville', '[ville]'),
          annex: 'Pièces jointes : copie de la pièce d\'identité de l\'hébergeant et justificatif de domicile de l\'hébergeant (selon l\'organisme).'
        };
      }
    },
    honneur: {
      name: 'attestation-sur-l-honneur',
      fields: [
        ['civ', 'Civilité', 'select', ['Madame', 'Monsieur']], ['nom', 'Prénom et nom', 'text'], ['naiss', 'Date de naissance', 'date'], ['lieu', 'Lieu de naissance', 'text'],
        ['adresse', 'Adresse', 'textarea'], ['objet', 'Ce que vous attestez (une phrase par ligne)', 'textarea', null, "Exemple : ne percevoir aucune pension alimentaire\nou : vivre seul(e) avec mes deux enfants"], ['ville', 'Fait à (ville)', 'text']
      ],
      doc: function (o) {
        var items = (o.objet || '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
        return {
          title: "ATTESTATION SUR L'HONNEUR",
          body: ['Je soussigné(e) ' + v(o, 'civ') + ' ' + v(o, 'nom', '[prénom et nom]') + ', né(e) le ' + (fdate(o.naiss) || '[date]') + ' à ' + v(o, 'lieu', '[lieu]') + ', demeurant ' + v(o, 'adresse', '[adresse]').replace(/\n/g, ', ') + ', atteste sur l\'honneur :']
            .concat(items.length ? items.map(function (s) { return '- ' + s; }) : ['- [ce que vous attestez]'])
            .concat([PENAL, 'Fait pour servir et valoir ce que de droit.']),
          place: v(o, 'ville', '[ville]')
        };
      }
    },
    procuration: {
      name: 'procuration',
      fields: [
        ['m_civ', 'Vous (mandant) : civilité', 'select', ['Madame', 'Monsieur']], ['m_nom', 'Vous : prénom et nom', 'text'], ['m_naiss', 'Vous : date de naissance', 'date'], ['m_adresse', 'Vous : adresse', 'textarea'], ['m_piece', 'Vous : pièce d\'identité (type et numéro)', 'text', null, 'Carte d\'identité n° ...'],
        ['d_civ', 'La personne désignée (mandataire) : civilité', 'select', ['Madame', 'Monsieur']], ['d_nom', 'Mandataire : prénom et nom', 'text'], ['d_naiss', 'Mandataire : date de naissance', 'date'], ['d_adresse', 'Mandataire : adresse', 'textarea'],
        ['acte', 'Ce que le mandataire pourra faire (le plus précis possible)', 'textarea', null, 'Exemple : retirer en mon nom le colis n° 6A123456789 au bureau de poste de ...'],
        ['duree', 'Validité', 'select', ['pour cette seule démarche', "jusqu'au [date à compléter]"]], ['ville', 'Fait à (ville)', 'text']
      ],
      doc: function (o) {
        return {
          title: 'PROCURATION',
          body: [
            'Je soussigné(e) ' + v(o, 'm_civ') + ' ' + v(o, 'm_nom', '[prénom et nom]') + ', né(e) le ' + (fdate(o.m_naiss) || '[date]') + ', demeurant ' + v(o, 'm_adresse', '[adresse]').replace(/\n/g, ', ') + ', titulaire de la pièce d\'identité suivante : ' + v(o, 'm_piece', '[type et numéro]') + ',',
            'donne procuration à ' + v(o, 'd_civ') + ' ' + v(o, 'd_nom', '[prénom et nom]') + ', né(e) le ' + (fdate(o.d_naiss) || '[date]') + ', demeurant ' + v(o, 'd_adresse', '[adresse]').replace(/\n/g, ', ') + ',',
            'pour : ' + v(o, 'acte', '[démarche précise]'),
            'Cette procuration est valable ' + v(o, 'duree') + '. Le mandataire présentera sa propre pièce d\'identité ainsi qu\'une copie de la mienne.'
          ],
          place: v(o, 'ville', '[ville]'),
          sig2: 'Signature du mandataire'
        };
      }
    },
    recourscaf: {
      name: 'recours-caf', letter: true,
      fields: [
        ['nom', 'Prénom et nom', 'text'], ['adresse', 'Votre adresse', 'textarea'], ['num', 'Numéro d\'allocataire', 'text'],
        ['caf', 'Adresse de votre Caf (commission de recours amiable)', 'textarea', null, 'Commission de recours amiable\nCaf de ...\nAdresse'],
        ['date_dec', 'Date de la décision contestée', 'date'], ['presta', 'Prestation concernée', 'text', null, 'APL, prime d\'activité, allocations familiales...'],
        ['motif', 'Pourquoi vous contestez (expliquez simplement)', 'textarea', null, 'Exemple : la Caf a retenu des revenus de 2025 qui ne correspondent pas à ma situation : j\'ai perdu mon emploi en mars...'],
        ['ville', 'Fait à (ville)', 'text']
      ],
      doc: function (o) {
        return {
          from: [v(o, 'nom', '[prénom et nom]')].concat(v(o, 'adresse', '[adresse]').split('\n')).concat(['N° allocataire : ' + v(o, 'num', '[numéro]')]),
          to: v(o, 'caf', 'Commission de recours amiable\nCaf de [département]').split('\n'),
          object: 'Objet : recours amiable contre la décision du ' + (fdate(o.date_dec) || '[date]') + ' (' + v(o, 'presta', '[prestation]') + ')',
          body: [
            'Madame, Monsieur les membres de la commission de recours amiable,',
            'Par la présente, je conteste la décision qui m\'a été notifiée le ' + (fdate(o.date_dec) || '[date]') + ' concernant ' + v(o, 'presta', '[prestation]') + ', et je forme un recours amiable devant votre commission, dans le délai de deux mois prévu.',
            v(o, 'motif', '[vos raisons]'),
            'Je vous demande donc de bien vouloir réexaminer mon dossier et revenir sur cette décision. Vous trouverez ci-joint une copie de la décision contestée ainsi que les justificatifs utiles.',
            'Je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.'
          ],
          place: v(o, 'ville', '[ville]'),
          annex: 'Pièces jointes : copie de la décision contestée, justificatifs.'
        };
      }
    }
  };

  /* ---------- rendu PDF (A4, Helvetica) ---------- */
  function latin(s) { return String(s).replace(/[‘’]/g, "'").replace(/[“”«»]/g, '"').replace(/[^\x20-\x7E\xA0-\xFFŒœ€]/g, ''); }
  function build(d, sig) {
    return load(ASSETS + 'vendor/pdf-lib.min.js').then(function () {
      var L = window.PDFLib;
      return L.PDFDocument.create().then(function (doc) {
        return Promise.all([doc.embedFont(L.StandardFonts.Helvetica), doc.embedFont(L.StandardFonts.HelveticaBold), sig ? sig.arrayBuffer().then(function (b) { return doc.embedPng(b); }) : null]).then(function (r) {
          var F1 = r[0], F2 = r[1], img = r[2], W = 595.28, H = 841.89, M = 64, size = 11.5, lh = 17;
          var page = doc.addPage([W, H]), y = H - M;
          function newPage() { page = doc.addPage([W, H]); y = H - M; }
          function line(t, opt) {
            opt = opt || {}; var f = opt.bold ? F2 : F1, s = opt.size || size, x = M;
            t = latin(t);
            if (opt.right) x = W - M - Math.max.apply(null, [0].concat([f.widthOfTextAtSize(t, s)]));
            if (opt.center) x = (W - f.widthOfTextAtSize(t, s)) / 2;
            if (y < M + 40) newPage();
            page.drawText(t, { x: x, y: y, size: s, font: f, color: L.rgb(.08, .1, .15) }); y -= opt.lh || lh;
          }
          function para(t, opt) {
            opt = opt || {}; var f = opt.bold ? F2 : F1, s = opt.size || size, max = W - 2 * M, words = latin(t).split(/\s+/), cur = '';
            words.forEach(function (w) { var test = cur ? cur + ' ' + w : w; if (f.widthOfTextAtSize(test, s) > max && cur) { line(cur, opt); cur = w; } else cur = test; });
            if (cur) line(cur, opt);
            y -= opt.after == null ? 8 : opt.after;
          }
          if (d.from) { d.from.forEach(function (t) { line(t); }); y -= 14; }
          if (d.to) { var bx = W / 2 + 10; d.to.forEach(function (t) { page.drawText(latin(t), { x: bx, y: y, size: size, font: F1 }); y -= lh; }); y -= 18; }
          if (d.title) { y -= 10; line(d.title, { bold: true, size: 16, center: true, lh: 34 }); }
          if (d.object) { para(d.object, { bold: true, after: 14 }); }
          d.body.forEach(function (t) { para(t, { after: 10 }); });
          y -= 10; line('Fait à ' + d.place + ', le ' + today() + '.'); y -= 8;
          line('Signature' + (d.sig2 ? ' du mandant' : '') + ' :');
          if (img) { var w = 170, h = w * img.height / img.width; if (y - h < M) newPage(); page.drawImage(img, { x: M, y: y - h + 6, width: w, height: h }); y -= h; }
          else y -= 60;
          if (d.sig2) { y -= 10; line(d.sig2 + ' :'); y -= 60; }
          if (d.annex) { y -= 10; para(d.annex, { size: 9.5 }); }
          return doc.save();
        });
      });
    });
  }

  /* ---------- formulaire ---------- */
  function mount(root) {
    var key = root.getAttribute('data-form'), M = F[key], vals = {};
    var form = el('div', { class: 'fgrid' });
    M.fields.forEach(function (f) {
      var id = 'f_' + f[0], lab = el('label', { class: 'ff', for: id }, '<span>' + esc(f[1]) + '</span>'), inp;
      if (f[2] === 'select') { inp = el('select', { id: id }); f[3].forEach(function (o) { inp.appendChild(el('option', { value: o }, esc(o))); }); vals[f[0]] = f[3][0]; }
      else if (f[2] === 'textarea') { inp = el('textarea', { id: id, rows: f[0] === 'motif' || f[0] === 'objet' || f[0] === 'acte' ? '4' : '2' }); if (f[4]) inp.placeholder = f[4]; }
      else { inp = el('input', { id: id, type: f[2] }); if (f[4]) inp.placeholder = f[4]; }
      inp.addEventListener('input', function () { vals[f[0]] = inp.value; preview(); });
      lab.appendChild(inp); form.appendChild(lab);
    });
    var padW = el('div', { class: 'ff' }, '<span>Signature (facultatif) : signez avec le doigt ou la souris, ou laissez vide pour signer à la main après impression</span>');
    var c = el('canvas', { class: 'pad', width: '600', height: '200' }); padW.appendChild(c);
    var clr = el('button', { type: 'button', class: 'pad-clear' }, 'Effacer la signature'); padW.appendChild(clr);
    var x = c.getContext('2d'), drawing = false, has = false; x.lineWidth = 3.2; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#10204a';
    function pt(e) { var r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; }
    c.addEventListener('pointerdown', function (e) { drawing = has = true; c.setPointerCapture(e.pointerId); var p = pt(e); x.beginPath(); x.moveTo(p[0], p[1]); e.preventDefault(); });
    c.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pt(e); x.lineTo(p[0], p[1]); x.stroke(); e.preventDefault(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { c.addEventListener(ev, function () { drawing = false; }); });
    clr.onclick = function () { x.clearRect(0, 0, c.width, c.height); has = false; };
    var pv = el('div', { class: 'preview', 'aria-label': 'Aperçu' });
    var go = el('button', { type: 'button', class: 'go' }, 'Créer le PDF');
    var out = el('div', { class: 'results' });
    root.innerHTML = '';
    root.appendChild(form); root.appendChild(padW); root.appendChild(el('p', { class: 'pv-h' }, '<b>Aperçu</b>')); root.appendChild(pv); root.appendChild(go); root.appendChild(out);
    root.appendChild(el('p', { class: 'privacy' }, '🔒 Rien n\'est envoyé sur Internet : le document est créé sur votre appareil.'));
    function preview() {
      var d = M.doc(vals), h = '';
      if (d.from) h += '<p>' + d.from.map(esc).join('<br>') + '</p>';
      if (d.to) h += '<p class="pv-to">' + d.to.map(esc).join('<br>') + '</p>';
      if (d.title) h += '<p class="pv-title">' + esc(d.title) + '</p>';
      if (d.object) h += '<p><b>' + esc(d.object) + '</b></p>';
      h += d.body.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('');
      h += '<p>Fait à ' + esc(d.place) + ', le ' + today() + '.</p><p>Signature :</p>';
      pv.innerHTML = h;
    }
    go.onclick = function () {
      go.disabled = true; out.innerHTML = '<p class="status">⏳ Création du PDF...</p>';
      (has ? new Promise(function (r) { c.toBlob(r, 'image/png'); }) : Promise.resolve(null)).then(function (sig) { return build(M.doc(vals), sig); }).then(function (bytes) {
        var blob = new Blob([bytes], { type: 'application/pdf' }), name = M.name + '.pdf';
        out.innerHTML = '';
        var box = el('div', { class: 'res ok' }, '<p class="badge">✅ Votre document est prêt</p>');
        var row = el('div', { class: 'row' }), a = el('a', { class: 'dl', href: URL.createObjectURL(blob), download: name }, 'Télécharger le PDF');
        row.appendChild(el('input', { type: 'text', value: name, readonly: 'readonly', 'aria-label': 'Nom du fichier' })); row.appendChild(a); box.appendChild(row);
        box.appendChild(el('p', { class: 'note' }, has ? 'Signature ajoutée. Si l\'organisme exige une signature à la main, imprimez le document et signez-le.' : 'Imprimez le document et signez-le à la main, ou revenez dessiner votre signature ci-dessus.'));
        if (window.PDFDemDocs) {
          var keep = el('button', { type: 'button', class: 'keep' }, '💾 Garder dans Mes documents');
          keep.onclick = function () { keep.disabled = true; window.PDFDemDocs.add(name, blob).then(function () { keep.outerHTML = '<p class="kept">✓ Gardé sur cet appareil, dans <a href="' + HOME + 'mes-documents/">Mes documents</a>.</p>'; }); };
          box.appendChild(keep);
        }
        box.appendChild(el('p', { class: 'note' }, 'Besoin de joindre une pièce d\'identité dans le même fichier ? Utilisez <a href="/pdf/fusionner-pdf/">Fusionner des PDF</a>.'));
        out.appendChild(box);
      }).catch(function (e) { console.error(e); out.innerHTML = '<p class="status">❌ Le PDF n\'a pas pu être créé. Réessayez.</p>'; }).then(function () { go.disabled = false; });
    };
    preview();
  }
  document.querySelectorAll('[data-form]').forEach(mount);
})();
