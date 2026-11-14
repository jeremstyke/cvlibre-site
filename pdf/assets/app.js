/* PDF Démarches - outils PDF 100 % dans le navigateur. Aucun fichier n'est envoyé sur un serveur. */
(function () {
  'use strict';

  var ASSETS = (document.currentScript && document.currentScript.src || '').replace(/app\.js(\?.*)?$/, '');
  var V = ASSETS + 'vendor/';
  var LIBS = {
    pdfjs: V + 'pdf.min.js',
    worker: V + 'pdf.worker.min.js',
    pdflib: V + 'pdf-lib.min.js',
    heic: V + 'heic2any.min.js',
    jszip: V + 'jszip.min.js'
  };

  var loading = {};
  function load(src) {
    if (!loading[src]) {
      loading[src] = new Promise(function (res, rej) {
        var s = document.createElement('script');
        s.src = src;
        s.onload = res;
        s.onerror = function () { delete loading[src]; rej(new Error('Impossible de charger un composant. Vérifiez votre connexion et réessayez.')); };
        document.head.appendChild(s);
      });
    }
    return loading[src];
  }
  function getPdfjs() { return load(LIBS.pdfjs).then(function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = LIBS.worker; return window.pdfjsLib; }); }
  function getPdfLib() { return load(LIBS.pdflib).then(function () { return window.PDFLib; }); }
  function getHeic() { return load(LIBS.heic).then(function () { return window.heic2any; }); }
  function getZip() { return load(LIBS.jszip).then(function () { return window.JSZip; }); }

  /* ---------- utilitaires ---------- */
  var MAX_SIDE = 2400; // px, résolution max de rendu (environ 200 dpi en A4)

  function fmt(bytes) {
    if (bytes < 1000) return bytes + ' o';
    if (bytes < 1000 * 1000) return (bytes / 1000).toFixed(bytes < 10000 ? 1 : 0).replace('.', ',') + ' Ko';
    return (bytes / 1000 / 1000).toFixed(2).replace('.', ',') + ' Mo';
  }
  function cleanName(name, ext) {
    var base = String(name || 'document').replace(/\.[a-z0-9]{2,5}$/i, '');
    base = base.normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
    if (!base) base = 'document';
    if (base.length > 40) base = base.slice(0, 40).replace(/-+$/, '');
    return base + '.' + ext;
  }
  function isPdf(f) { return /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name); }
  function isHeic(f) { return /hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name); }
  function isImage(f) { return /^image\//i.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|hei[cf])$/i.test(f.name); }
  function readBuf(blob) { return blob.arrayBuffer ? blob.arrayBuffer() : new Response(blob).arrayBuffer(); }
  function toBlob(canvas, q) {
    return new Promise(function (res) { canvas.toBlob(function (b) { res(b); }, 'image/jpeg', q); });
  }
  function scaled(src, f) {
    var w = Math.max(1, Math.round(src.width * f)), h = Math.max(1, Math.round(src.height * f));
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d');
    x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);
    x.imageSmoothingQuality = 'high';
    x.drawImage(src, 0, 0, w, h);
    return c;
  }

  /* ---------- lecture des sources en images de page ---------- */
  function imageFileToCanvas(file) {
    var p = isHeic(file)
      ? getHeic().then(function (h) { return h({ blob: file, toType: 'image/jpeg', quality: 0.92 }); }).then(function (r) { return Array.isArray(r) ? r[0] : r; })
      : Promise.resolve(file);
    return p.then(function (blob) {
      var bm = window.createImageBitmap
        ? createImageBitmap(blob, { imageOrientation: 'from-image' }).catch(function () { return createImageBitmap(blob); })
        : Promise.reject();
      return bm.catch(function () {
        return new Promise(function (res, rej) {
          var img = new Image();
          img.onload = function () { res(img); };
          img.onerror = function () { rej(new Error('Image illisible : ' + file.name)); };
          img.src = URL.createObjectURL(blob);
        });
      });
    }).then(function (img) {
      var w = img.width, h = img.height, f = Math.min(1, MAX_SIDE / Math.max(w, h));
      return scaled(img, f);
    });
  }

  function pdfToPages(buf, onStep) {
    return getPdfjs().then(function (lib) {
      return lib.getDocument({ data: new Uint8Array(buf.slice(0)) }).promise;
    }).then(function (doc) {
      var out = [], i = 1;
      function next() {
        if (i > doc.numPages) return Promise.resolve(out);
        return doc.getPage(i).then(function (page) {
          var vp1 = page.getViewport({ scale: 1 });
          var s = Math.min(3, MAX_SIDE / Math.max(vp1.width, vp1.height));
          var vp = page.getViewport({ scale: s });
          var c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
          var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
          return page.render({ canvasContext: x, viewport: vp }).promise.then(function () {
            out.push({ canvas: c, w: vp1.width, h: vp1.height });
            if (onStep) onStep('Lecture de la page ' + i + ' sur ' + doc.numPages);
            i++; return next();
          });
        });
      }
      return next();
    });
  }

  function imagePage(canvas) {
    // page au format "scan" : grand côté = hauteur A4 (842 pt)
    var r = 842 / Math.max(canvas.width, canvas.height);
    return { canvas: canvas, w: canvas.width * r, h: canvas.height * r };
  }

  function filesToPages(files, onStep) {
    var pages = [], i = 0;
    function next() {
      if (i >= files.length) return Promise.resolve(pages);
      var f = files[i++];
      if (onStep) onStep('Préparation de ' + f.name);
      var p = isPdf(f)
        ? readBuf(f).then(function (b) { return pdfToPages(b, onStep); })
        : imageFileToCanvas(f).then(function (c) { return [imagePage(c)]; });
      return p.then(function (arr) { pages = pages.concat(arr); return next(); });
    }
    return next();
  }

  /* ---------- reconstruction compressée ---------- */
  var LADDER = [[1, 0.85], [1, 0.75], [0.85, 0.7], [0.75, 0.62], [0.65, 0.56], [0.56, 0.5], [0.48, 0.45], [0.4, 0.4], [0.33, 0.36], [0.27, 0.32], [0.22, 0.28]];

  function buildPdf(pages, f, q) {
    return getPdfLib().then(function (L) {
      return L.PDFDocument.create().then(function (doc) {
        var i = 0;
        function next() {
          if (i >= pages.length) return doc.save({ useObjectStreams: true });
          var p = pages[i++];
          return toBlob(scaled(p.canvas, f), q).then(readBuf).then(function (buf) {
            return doc.embedJpg(buf);
          }).then(function (img) {
            var page = doc.addPage([p.w, p.h]);
            page.drawImage(img, { x: 0, y: 0, width: p.w, height: p.h });
            return next();
          });
        }
        return next();
      });
    });
  }

  function rasterToTarget(pages, target, onStep) {
    var k = 0, last = null;
    function next() {
      if (k >= LADDER.length) return Promise.resolve({ bytes: last, ok: false });
      var st = LADDER[k++];
      if (onStep) onStep('Compression, essai ' + k + ' sur ' + LADDER.length);
      return buildPdf(pages, st[0], st[1]).then(function (bytes) {
        last = bytes;
        if (!target || bytes.length <= target) return { bytes: bytes, ok: true };
        return next();
      });
    }
    return next();
  }

  /* ---------- actions ---------- */
  function compressPdf(file, target, onStep) {
    return readBuf(file).then(function (buf) {
      if (target && buf.byteLength <= target) return { bytes: new Uint8Array(buf), ok: true, kept: true };
      // 1) essai sans perte (garde le texte sélectionnable)
      return getPdfLib().then(function (L) {
        return L.PDFDocument.load(buf, { ignoreEncryption: true }).then(function (d) { return d.save({ useObjectStreams: true }); })
          .catch(function () { return null; });
      }).then(function (lossless) {
        if (lossless && target && lossless.length <= target) return { bytes: lossless, ok: true, kept: true };
        // 2) reconstruction en images compressées
        return pdfToPages(buf, onStep).then(function (pages) { return rasterToTarget(pages, target, onStep); });
      });
    });
  }

  function mergeFiles(files, target, onStep) {
    return getPdfLib().then(function (L) {
      return L.PDFDocument.create().then(function (doc) {
        var i = 0;
        function next() {
          if (i >= files.length) return doc.save({ useObjectStreams: true });
          var f = files[i++];
          if (onStep) onStep('Ajout de ' + f.name);
          if (isPdf(f)) {
            return readBuf(f).then(function (b) { return L.PDFDocument.load(b, { ignoreEncryption: true }); })
              .then(function (src) { return doc.copyPages(src, src.getPageIndices()); })
              .then(function (ps) { ps.forEach(function (p) { doc.addPage(p); }); return next(); });
          }
          return imageFileToCanvas(f).then(function (c) {
            var pg = imagePage(c);
            return toBlob(c, 0.85).then(readBuf).then(function (buf) { return doc.embedJpg(buf); }).then(function (img) {
              var page = doc.addPage([pg.w, pg.h]);
              page.drawImage(img, { x: 0, y: 0, width: pg.w, height: pg.h });
              return next();
            });
          });
        }
        return next();
      });
    }).then(function (bytes) {
      if (!target || bytes.length <= target) return { bytes: bytes, ok: true };
      return filesToPages(files, onStep).then(function (pages) { return rasterToTarget(pages, target, onStep); });
    });
  }

  function splitPdf(file, onStep) {
    return readBuf(file).then(function (buf) {
      return getPdfLib().then(function (L) {
        return L.PDFDocument.load(buf, { ignoreEncryption: true }).then(function (src) {
          var n = src.getPageCount(), outs = [], i = 0;
          function next() {
            if (i >= n) return outs;
            var idx = i++;
            if (onStep) onStep('Page ' + (idx + 1) + ' sur ' + n);
            return L.PDFDocument.create().then(function (d) {
              return d.copyPages(src, [idx]).then(function (ps) { d.addPage(ps[0]); return d.save(); });
            }).then(function (b) { outs.push(b); return next(); });
          }
          return next();
        });
      });
    });
  }

  function imageToJpg(file, target, min, onStep) {
    return imageFileToCanvas(file).then(function (c) {
      var k = 0, last = null, firstOk = null;
      var steps = [[1, 0.92]].concat(LADDER);
      function next() {
        if (k >= steps.length) return { blob: firstOk || last, ok: !!firstOk };
        var st = steps[k++];
        if (onStep) onStep('Compression, essai ' + k);
        return toBlob(scaled(c, st[0]), st[1]).then(function (b) {
          last = b;
          if ((!target || b.size <= target) && (!min || b.size >= min)) return { blob: b, ok: true };
          if (target && b.size <= target && min && b.size < min) return { blob: b, ok: false, tooSmall: true };
          return next();
        });
      }
      return next();
    });
  }

  /* ---------- interface ---------- */
  var MODES = {
    compress: { label: 'Réduire un PDF', accept: 'application/pdf,.pdf', multi: true, hint: 'Déposez un ou plusieurs PDF.' },
    topdf: { label: 'Photos en PDF', accept: 'image/*,.heic,.heif', multi: true, hint: 'Déposez vos photos (JPG, PNG, HEIC d\'iPhone). Elles seront réunies dans un seul PDF, dans l\'ordre.' },
    merge: { label: 'Fusionner', accept: 'application/pdf,.pdf,image/*,.heic,.heif', multi: true, hint: 'Déposez plusieurs PDF ou photos (recto puis verso, par exemple). Vous obtenez un seul PDF.' },
    image: { label: 'Réduire une photo', accept: 'image/*,.heic,.heif', multi: true, hint: 'Déposez une ou plusieurs photos. Vous obtenez des JPG légers, HEIC compris.' },
    split: { label: 'Séparer les pages', accept: 'application/pdf,.pdf', multi: false, hint: 'Déposez un PDF : chaque page devient un fichier séparé.' }
  };
  var SIZES = [['', 'Le plus léger possible'], ['100k', '100 Ko'], ['200k', '200 Ko'], ['300k', '300 Ko'], ['500k', '500 Ko'], ['1m', '1 Mo'], ['2m', '2 Mo'], ['3m', '3 Mo'], ['4m', '4 Mo'], ['5m', '5 Mo'], ['10m', '10 Mo']];
  function sizeBytes(code) {
    if (!code) return 0;
    var n = parseFloat(code), u = code.slice(-1);
    // marge de 3 % pour passer sous la limite quelle que soit la façon de compter
    return Math.floor(n * (u === 'm' ? 1000000 : 1000) * 0.97);
  }
  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    if (html != null) e.innerHTML = html;
    return e;
  }

  function mount(root) {
    var mode = root.getAttribute('data-mode') || 'compress';
    var size = root.getAttribute('data-size') || '1m';
    var min = parseInt(root.getAttribute('data-min') || '0', 10) || 0;
    var label = root.getAttribute('data-label') || '';
    var files = [];

    root.innerHTML = '';
    var tabs = el('div', { class: 'tool-tabs', role: 'tablist' });
    Object.keys(MODES).forEach(function (m) {
      var b = el('button', { type: 'button', role: 'tab', 'data-m': m, class: 'tab' + (m === mode ? ' on' : '') }, MODES[m].label);
      b.onclick = function () { mode = m; files = []; render(); };
      tabs.appendChild(b);
    });
    var drop = el('label', { class: 'drop' });
    var input = el('input', { type: 'file', class: 'sr' });
    var dropText = el('span', { class: 'drop-text' });
    drop.appendChild(input); drop.appendChild(dropText);
    var list = el('ul', { class: 'files' });
    var opts = el('div', { class: 'opts' });
    var sel = el('select', { 'aria-label': 'Taille maximale' });
    SIZES.forEach(function (s) { var o = el('option', { value: s[0] }, s[1]); if (s[0] === size) o.selected = true; sel.appendChild(o); });
    var optLabel = el('label', { class: 'opt' }, '<span>Taille maximale par fichier</span>');
    optLabel.appendChild(sel);
    opts.appendChild(optLabel);
    if (label) opts.appendChild(el('p', { class: 'preset' }, 'Réglage conseillé pour ' + label + ' : <b>' + sel.options[sel.selectedIndex].text + '</b>' + (min ? ' (minimum ' + fmt(min) + ')' : '')));
    var go = el('button', { type: 'button', class: 'go' }, 'Lancer');
    var status = el('p', { class: 'status', 'aria-live': 'polite' });
    var results = el('div', { class: 'results' });
    var priv = el('p', { class: 'privacy' }, '🔒 Vos fichiers restent sur votre appareil : rien n\'est envoyé sur Internet.');
    [tabs, drop, list, opts, go, status, results, priv].forEach(function (n) { root.appendChild(n); });

    function render() {
      tabs.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-m') === mode); });
      input.accept = MODES[mode].accept; input.multiple = MODES[mode].multi; input.value = '';
      dropText.innerHTML = '<b>Choisir des fichiers</b> ou les glisser ici<small>' + MODES[mode].hint + '</small>';
      opts.style.display = mode === 'split' ? 'none' : '';
      go.textContent = { compress: 'Réduire la taille', topdf: 'Créer le PDF', merge: 'Fusionner en un PDF', image: 'Réduire les photos', split: 'Séparer les pages' }[mode];
      list.innerHTML = ''; results.innerHTML = ''; status.textContent = '';
      files.forEach(function (f, i) {
        var li = el('li', null, '<span>' + f.name.replace(/</g, '&lt;') + '</span><em>' + fmt(f.size) + '</em>');
        if (files.length > 1 && (mode === 'merge' || mode === 'topdf')) {
          var up = el('button', { type: 'button', title: 'Monter', 'aria-label': 'Monter' }, '↑');
          up.onclick = function () { if (i > 0) { var t = files[i - 1]; files[i - 1] = files[i]; files[i] = t; render(); } };
          li.appendChild(up);
        }
        var x = el('button', { type: 'button', title: 'Retirer', 'aria-label': 'Retirer' }, '✕');
        x.onclick = function () { files.splice(i, 1); render(); };
        li.appendChild(x);
        list.appendChild(li);
      });
      go.disabled = !files.length;
    }

    function add(fl) {
      var arr = Array.prototype.slice.call(fl || []);
      var okType = arr.filter(function (f) { return mode === 'compress' || mode === 'split' ? isPdf(f) : (mode === 'merge' ? (isPdf(f) || isImage(f)) : isImage(f)); });
      if (okType.length < arr.length) status.textContent = 'Certains fichiers ont été ignorés (format non adapté à cet outil).';
      files = MODES[mode].multi ? files.concat(okType) : okType.slice(0, 1);
      var msg = status.textContent; render(); status.textContent = msg;
    }
    input.onchange = function () { add(input.files); };
    ['dragenter', 'dragover'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { add(e.dataTransfer.files); });

    function result(blobOrBytes, name, ok, target, note) {
      var blob = blobOrBytes instanceof Blob ? blobOrBytes : new Blob([blobOrBytes], { type: 'application/pdf' });
      var url = URL.createObjectURL(blob);
      var box = el('div', { class: 'res ' + (ok ? 'ok' : 'warn') });
      var badge = ok ? (target ? '✅ ' + fmt(blob.size) + ', sous la limite' : '✅ ' + fmt(blob.size)) : '⚠️ ' + fmt(blob.size) + ', encore trop lourd';
      box.innerHTML = '<p class="badge">' + badge + '</p>';
      var nameIn = el('input', { type: 'text', value: name, 'aria-label': 'Nom du fichier', spellcheck: 'false' });
      var a = el('a', { class: 'dl', href: url, download: name }, 'Télécharger');
      nameIn.oninput = function () { a.setAttribute('download', nameIn.value || name); };
      var row = el('div', { class: 'row' }); row.appendChild(nameIn); row.appendChild(a); box.appendChild(row);
      if (note) box.appendChild(el('p', { class: 'note' }, note));
      results.appendChild(box);
    }

    go.onclick = function () {
      if (!files.length) return;
      var target = mode === 'split' ? 0 : sizeBytes(sel.value);
      results.innerHTML = ''; go.disabled = true;
      var step = function (t) { status.textContent = '⏳ ' + t + '...'; };
      var job;
      if (mode === 'compress') {
        var i = 0;
        job = (function next() {
          if (i >= files.length) return Promise.resolve();
          var f = files[i++];
          return compressPdf(f, target, step).then(function (r) {
            var note = r.kept ? 'Le texte reste sélectionnable.' : 'Le PDF a été reconstruit en images compressées : il reste lisible, mais le texte n\'est plus sélectionnable.';
            if (!r.ok) note = 'Impossible de descendre sous la limite sans rendre le document illisible. Essayez de séparer les pages, puis d\'envoyer plusieurs fichiers.';
            result(r.bytes, cleanName(f.name, 'pdf'), r.ok, target, note);
            return next();
          });
        })();
      } else if (mode === 'merge' || mode === 'topdf') {
        job = mergeFiles(files, target, step).then(function (r) {
          result(r.bytes, cleanName(files.length === 1 ? files[0].name : 'documents-fusionnes', 'pdf'), r.ok, target,
            r.ok ? files.length + ' fichier(s) réunis, ' + 'dans l\'ordre de la liste.' : 'Trop de pages pour cette limite. Séparez le dossier en plusieurs fichiers.');
        });
      } else if (mode === 'image') {
        var j = 0;
        job = (function next() {
          if (j >= files.length) return Promise.resolve();
          var f = files[j++];
          return imageToJpg(f, target, min, step).then(function (r) {
            result(r.blob, cleanName(f.name, 'jpg'), r.ok, target, r.tooSmall ? 'La photo est sous le minimum demandé : utilisez une photo de meilleure qualité.' : (r.ok ? '' : 'Impossible d\'atteindre cette taille.'));
            return next();
          });
        })();
      } else {
        var f = files[0];
        job = splitPdf(f, step).then(function (outs) {
          outs.forEach(function (b, k) { result(b, cleanName(f.name, 'pdf').replace(/\.pdf$/, '-page-' + (k + 1) + '.pdf'), true, 0, ''); });
          if (outs.length > 1) {
            return getZip().then(function (Z) {
              var z = new Z();
              outs.forEach(function (b, k) { z.file(cleanName(f.name, 'pdf').replace(/\.pdf$/, '-page-' + (k + 1) + '.pdf'), b); });
              return z.generateAsync({ type: 'blob' });
            }).then(function (zb) {
              var a = el('a', { class: 'dl zip', href: URL.createObjectURL(zb), download: cleanName(f.name, 'zip') }, 'Tout télécharger (.zip)');
              results.insertBefore(a, results.firstChild);
            });
          }
        });
      }
      job.then(function () {
        status.textContent = '✔️ Terminé. Le nom du fichier est déjà nettoyé (sans accents ni espaces), vous pouvez le modifier avant de télécharger.';
      }).catch(function (e) {
        console.error(e);
        status.textContent = '❌ ' + (e && e.message && /charger/.test(e.message) ? e.message : 'Ce fichier n\'a pas pu être traité (fichier protégé ou endommagé ?).');
      }).then(function () { go.disabled = false; });
    };

    render();
  }

  document.querySelectorAll('[data-tool]').forEach(mount);
})();
