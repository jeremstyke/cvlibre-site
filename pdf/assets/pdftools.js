/* CVLibre PDF - outils PDF dans le navigateur. Aucun fichier n'est envoyé sur un serveur. */
(function () {
  'use strict';
  var ASSETS = (document.currentScript && document.currentScript.src || '').replace(/pdftools\.js(\?.*)?$/, '');
  var V = ASSETS + 'vendor/';
  var T = (window.PDFT && window.PDFT.t) || {};
  function t(k, a) { var s = T[k] || k; if (a) Object.keys(a).forEach(function (x) { s = s.split('{' + x + '}').join(a[x]); }); return s; }

  /* ---------- chargement des bibliothèques ---------- */
  var loading = {};
  function load(src) {
    if (!loading[src]) {
      loading[src] = new Promise(function (res, rej) {
        var s = document.createElement('script'); s.src = src; s.onload = res;
        s.onerror = function () { delete loading[src]; rej(new Error('LOAD')); };
        document.head.appendChild(s);
      });
    }
    return loading[src];
  }
  function pdfjs() { return load(V + 'pdf.min.js').then(function () { window.pdfjsLib.GlobalWorkerOptions.workerSrc = V + 'pdf.worker.min.js'; return window.pdfjsLib; }); }
  function pdflib() { return load(V + 'pdf-lib.min.js').then(function () { return window.PDFLib; }); }
  function heic() { return load(V + 'heic2any.min.js').then(function () { return window.heic2any; }); }
  function jszip() { return load(V + 'jszip.min.js').then(function () { return window.JSZip; }); }

  /* ---------- utilitaires ---------- */
  var MAX_SIDE = 2400;
  var DEC = (T._dec || ',');
  function fmt(b) {
    if (b < 1000) return b + ' ' + t('B');
    if (b < 1e6) return (b / 1000).toFixed(b < 1e4 ? 1 : 0).replace('.', DEC) + ' ' + t('KB');
    return (b / 1e6).toFixed(2).replace('.', DEC) + ' ' + t('MB');
  }
  function cleanName(name, ext, suffix) {
    var base = String(name || 'document').replace(/\.[a-z0-9]{2,5}$/i, '');
    base = base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'document';
    if (base.length > 40) base = base.slice(0, 40).replace(/-+$/, '');
    return base + (suffix ? '-' + suffix : '') + '.' + ext;
  }
  function isPdf(f) { return /pdf$/i.test(f.type) || /\.pdf$/i.test(f.name); }
  function isHeic(f) { return /hei[cf]/i.test(f.type) || /\.hei[cf]$/i.test(f.name); }
  function isImage(f) { return /^image\//i.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|hei[cf])$/i.test(f.name); }
  function buf(b) { return b.arrayBuffer ? b.arrayBuffer() : new Response(b).arrayBuffer(); }
  function jpeg(c, q) { return new Promise(function (r) { c.toBlob(function (b) { r(b); }, 'image/jpeg', q); }); }
  function png(c) { return new Promise(function (r) { c.toBlob(function (b) { r(b); }, 'image/png'); }); }
  function scaled(src, f) {
    var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(src.width * f)); c.height = Math.max(1, Math.round(src.height * f));
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, c.width, c.height);
    return c;
  }
  function seq(arr, fn) { var i = 0, out = []; function n() { if (i >= arr.length) return Promise.resolve(out); var k = i++; return Promise.resolve(fn(arr[k], k)).then(function (r) { out.push(r); return n(); }); } return n(); }
  function el(tag, attrs, html) { var e = document.createElement(tag); if (attrs) Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function latin(s) { return String(s).replace(/[^\x20-\x7E\xA0-\xFF]/g, ''); } // polices PDF standard : Latin-1 uniquement

  /* ---------- lecture ---------- */
  function imgCanvas(file) {
    var p = isHeic(file) ? heic().then(function (h) { return h({ blob: file, toType: 'image/jpeg', quality: 0.92 }); }).then(function (r) { return Array.isArray(r) ? r[0] : r; }) : Promise.resolve(file);
    return p.then(function (b) {
      return (window.createImageBitmap ? createImageBitmap(b, { imageOrientation: 'from-image' }).catch(function () { return createImageBitmap(b); }) : Promise.reject())
        .catch(function () { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = rej; i.src = URL.createObjectURL(b); }); });
    }).then(function (img) { return scaled(img, Math.min(1, MAX_SIDE / Math.max(img.width, img.height))); });
  }
  function openPdf(file) { return buf(file).then(function (b) { return pdfjs().then(function (L) { return L.getDocument({ data: new Uint8Array(b) }).promise; }); }); }
  function render(doc, n, maxSide, step) {
    return doc.getPage(n).then(function (pg) {
      var v1 = pg.getViewport({ scale: 1 }), s = Math.min(3, maxSide / Math.max(v1.width, v1.height)), v = pg.getViewport({ scale: s });
      var c = document.createElement('canvas'); c.width = Math.round(v.width); c.height = Math.round(v.height);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      return pg.render({ canvasContext: x, viewport: v }).promise.then(function () { if (step) step(t('reading', { n: n, total: doc.numPages })); return { canvas: c, w: v1.width, h: v1.height }; });
    });
  }
  function pdfPages(file, step) { return openPdf(file).then(function (doc) { var a = []; for (var i = 1; i <= doc.numPages; i++) a.push(i); return seq(a, function (n) { return render(doc, n, MAX_SIDE, step); }); }); }
  function imgPage(c) { var r = 842 / Math.max(c.width, c.height); return { canvas: c, w: c.width * r, h: c.height * r }; }
  function allPages(files, step) { return seq(files, function (f) { return isPdf(f) ? pdfPages(f, step) : imgCanvas(f).then(function (c) { return [imgPage(c)]; }); }).then(function (a) { return [].concat.apply([], a); }); }
  function loadLib(file) { return Promise.all([pdflib(), buf(file)]).then(function (r) { return r[0].PDFDocument.load(r[1], { ignoreEncryption: true }); }); }

  /* ---------- compression ---------- */
  var LADDER = [[1, .85], [1, .75], [.85, .7], [.75, .62], [.65, .56], [.56, .5], [.48, .45], [.4, .4], [.33, .36], [.27, .32], [.22, .28]];
  function buildJpgPdf(pages, f, q) {
    return pdflib().then(function (L) {
      return L.PDFDocument.create().then(function (doc) {
        return seq(pages, function (p) {
          return jpeg(scaled(p.canvas, f), q).then(buf).then(function (b) { return doc.embedJpg(b); }).then(function (img) { doc.addPage([p.w, p.h]).drawImage(img, { x: 0, y: 0, width: p.w, height: p.h }); });
        }).then(function () { return doc.save({ useObjectStreams: true }); });
      });
    });
  }
  function toTarget(pages, target, start, step) {
    var k = start || 0, last = null;
    function n() {
      if (k >= LADDER.length) return Promise.resolve({ bytes: last, ok: false });
      var s = LADDER[k++]; if (step) step(t('compressing', { n: k, total: LADDER.length }));
      return buildJpgPdf(pages, s[0], s[1]).then(function (b) { last = b; if (!target || b.length <= target) return { bytes: b, ok: true }; return n(); });
    }
    return n();
  }
  function sizeOf(code) { if (!code) return 0; var n = parseFloat(code); return Math.floor(n * (/m$/.test(code) ? 1e6 : 1e3) * .97); }

  /* ---------- actions ---------- */
  var ACT = {
    compress: function (files, o, step) {
      return seq(files, function (f) {
        return buf(f).then(function (b) {
          var level = o.level || 'reco', target = sizeOf(/^\d/.test(level) ? level : '');
          if (target && b.byteLength <= target) return { blob: f, name: cleanName(f.name, 'pdf'), note: t('kept'), ok: true };
          return pdflib().then(function (L) { return L.PDFDocument.load(b, { ignoreEncryption: true }).then(function (d) { return d.save({ useObjectStreams: true }); }).catch(function () { return null; }); })
            .then(function (ll) {
              if (ll && target && ll.length <= target) return { blob: ll, name: cleanName(f.name, 'pdf'), note: t('kept'), ok: true };
              return pdfPages(f, step).then(function (pages) {
                var start = level === 'low' ? 1 : level === 'strong' ? 6 : level === 'reco' ? 3 : 0;
                var tgt = target || 0;
                return toTarget(pages, tgt, start, step).then(function (r) {
                  var res = r.bytes;
                  if (!target && res.length >= b.byteLength) return { blob: f, name: cleanName(f.name, 'pdf'), note: t('alreadySmall'), ok: true };
                  return { blob: res, name: cleanName(f.name, 'pdf'), ok: r.ok, note: r.ok ? t('rasterized', { pct: Math.max(0, Math.round(100 - res.length / b.byteLength * 100)) }) : t('cannotReach') };
                });
              });
            });
        });
      });
    },
    merge: function (files, o, step) {
      return pdflib().then(function (L) {
        return L.PDFDocument.create().then(function (doc) {
          return seq(files, function (f) {
            if (step) step(t('adding', { name: f.name }));
            if (isPdf(f)) return buf(f).then(function (b) { return L.PDFDocument.load(b, { ignoreEncryption: true }); }).then(function (s) { return doc.copyPages(s, s.getPageIndices()); }).then(function (ps) { ps.forEach(function (p) { doc.addPage(p); }); });
            return imgCanvas(f).then(function (c) { var p = imgPage(c); return jpeg(c, .88).then(buf).then(function (b) { return doc.embedJpg(b); }).then(function (img) { doc.addPage([p.w, p.h]).drawImage(img, { x: 0, y: 0, width: p.w, height: p.h }); }); });
          }).then(function () { return doc.save({ useObjectStreams: true }); });
        });
      }).then(function (bytes) {
        var target = sizeOf(o.level || '');
        var name = cleanName(files.length === 1 ? files[0].name : (o.outName || 'merged'), 'pdf');
        if (!target || bytes.length <= target) return [{ blob: bytes, name: name, ok: true, note: t('mergedN', { n: files.length }) }];
        return allPages(files, step).then(function (p) { return toTarget(p, target, 0, step); }).then(function (r) { return [{ blob: r.bytes, name: name, ok: r.ok, note: r.ok ? t('mergedN', { n: files.length }) : t('cannotReach') }]; });
      });
    },
    split: function (files, o, step) {
      var f = files[0];
      return loadLib(f).then(function (src) {
        var L = window.PDFLib, n = src.getPageCount(), a = [];
        for (var i = 0; i < n; i++) a.push(i);
        return seq(a, function (i) {
          if (step) step(t('pageOf', { n: i + 1, total: n }));
          return L.PDFDocument.create().then(function (d) { return d.copyPages(src, [i]).then(function (p) { d.addPage(p[0]); return d.save(); }); })
            .then(function (b) { return { blob: b, name: cleanName(f.name, 'pdf', 'p' + (i + 1)), ok: true }; });
        });
      });
    },
    rotate: function (files, o, step) {
      var ang = parseInt(o.angle || '90', 10);
      return seq(files, function (f) {
        return loadLib(f).then(function (d) {
          var L = window.PDFLib;
          d.getPages().forEach(function (p) { p.setRotation(L.degrees(((p.getRotation().angle || 0) + ang) % 360)); });
          return d.save({ useObjectStreams: true });
        }).then(function (b) { return { blob: b, name: cleanName(f.name, 'pdf'), ok: true }; });
      });
    },
    topdf: function (files, o, step) { return ACT.merge(files, o, step); },
    tojpg: function (files, o, step) {
      var side = o.quality === 'high' ? 3300 : 1800;
      return seq(files, function (f) {
        return openPdf(f).then(function (doc) {
          var a = []; for (var i = 1; i <= doc.numPages; i++) a.push(i);
          return seq(a, function (n) { return render(doc, n, side, step).then(function (p) { return jpeg(p.canvas, .9); }).then(function (b) { return { blob: b, name: cleanName(f.name, 'jpg', doc.numPages > 1 ? 'p' + n : ''), ok: true }; }); });
        });
      }).then(function (a) { return [].concat.apply([], a); });
    },
    numbers: function (files, o, step) {
      return seq(files, function (f) {
        return loadLib(f).then(function (d) {
          var L = window.PDFLib;
          return d.embedFont(L.StandardFonts.Helvetica).then(function (font) {
            var pages = d.getPages(), n = pages.length;
            pages.forEach(function (p, i) {
              var txt = latin(o.format === 'of' ? (i + 1) + ' / ' + n : o.format === 'page' ? t('pageWord') + ' ' + (i + 1) : String(i + 1));
              var s = p.getSize(), size = Math.max(8, Math.min(12, s.width / 50)), w = font.widthOfTextAtSize(txt, size), m = 28;
              var x = o.pos === 'left' ? m : o.pos === 'right' ? s.width - m - w : (s.width - w) / 2;
              var y = /^top/.test(o.vpos) ? s.height - m - size : m;
              p.drawText(txt, { x: x, y: y, size: size, font: font, color: L.rgb(.2, .2, .2) });
            });
            return d.save({ useObjectStreams: true });
          });
        }).then(function (b) { return { blob: b, name: cleanName(f.name, 'pdf'), ok: true }; });
      });
    },
    watermark: function (files, o, step) {
      var txt = latin(o.text || '').trim() || latin(t('wmDefault'));
      var op = parseFloat(o.opacity || '0.25');
      return seq(files, function (f) {
        return loadLib(f).then(function (d) {
          var L = window.PDFLib;
          return d.embedFont(L.StandardFonts.HelveticaBold).then(function (font) {
            d.getPages().forEach(function (p) {
              var s = p.getSize(), diag = Math.sqrt(s.width * s.width + s.height * s.height);
              var size = Math.min(90, diag * .7 / Math.max(1, font.widthOfTextAtSize(txt, 1)));
              var w = font.widthOfTextAtSize(txt, size), ang = Math.atan2(s.height, s.width);
              var cx = s.width / 2, cy = s.height / 2;
              var x = cx - Math.cos(ang) * w / 2 + Math.sin(ang) * size / 3, y = cy - Math.sin(ang) * w / 2 - Math.cos(ang) * size / 3;
              p.drawText(txt, { x: x, y: y, size: size, font: font, color: L.rgb(.75, .1, .1), opacity: op, rotate: L.degrees(ang * 180 / Math.PI) });
            });
            return d.save({ useObjectStreams: true });
          });
        }).then(function (b) { return { blob: b, name: cleanName(f.name, 'pdf'), ok: true }; });
      });
    },
    sign: function (files, o, step) {
      var f = files[0];
      if (!o.signature) return Promise.reject(new Error('NOSIG'));
      return Promise.all([loadLib(f), buf(o.signature)]).then(function (r) {
        var d = r[0], L = window.PDFLib;
        return d.embedPng(r[1]).then(function (img) {
          var pages = d.getPages(), list = o.where === 'first' ? [pages[0]] : o.where === 'all' ? pages : [pages[pages.length - 1]];
          list.forEach(function (p) {
            var s = p.getSize(), w = Math.min(200, s.width * .3), h = w * img.height / img.width, m = 40;
            var x = o.pos === 'left' ? m : o.pos === 'center' ? (s.width - w) / 2 : s.width - m - w;
            p.drawImage(img, { x: x, y: m, width: w, height: h });
          });
          return d.save({ useObjectStreams: true });
        });
      }).then(function (b) { return [{ blob: b, name: cleanName(f.name, 'pdf', t('signedSuffix')), ok: true }]; });
    },
    organize: function (files, o, step) {
      var f = files[0], order = o.order || [];
      return loadLib(f).then(function (src) {
        var L = window.PDFLib;
        return L.PDFDocument.create().then(function (d) {
          return d.copyPages(src, order.map(function (x) { return x.i; })).then(function (ps) {
            ps.forEach(function (p, k) { if (order[k].rot) p.setRotation(L.degrees(((p.getRotation().angle || 0) + order[k].rot) % 360)); d.addPage(p); });
            return d.save({ useObjectStreams: true });
          });
        });
      }).then(function (b) { return [{ blob: b, name: cleanName(f.name, 'pdf'), ok: true, note: t('pagesN', { n: order.length }) }]; });
    },
    image: function (files, o, step) {
      var target = sizeOf(o.level || '500k');
      return seq(files, function (f) {
        return imgCanvas(f).then(function (c) {
          var steps = [[1, .92]].concat(LADDER), k = 0, last;
          function n() {
            if (k >= steps.length) return { blob: last, name: cleanName(f.name, 'jpg'), ok: false, note: t('cannotReach') };
            var s = steps[k++];
            return jpeg(scaled(c, s[0]), s[1]).then(function (b) { last = b; if (!target || b.size <= target) return { blob: b, name: cleanName(f.name, 'jpg'), ok: true }; return n(); });
          }
          return n();
        });
      });
    }
  };

  /* ---------- configuration des outils ---------- */
  var PDF = 'application/pdf,.pdf', IMG = 'image/*,.heic,.heif', BOTH = PDF + ',' + IMG;
  var MODES = {
    compress: { accept: PDF, multi: true, filter: isPdf, opts: ['level'] },
    merge: { accept: BOTH, multi: true, filter: function (f) { return isPdf(f) || isImage(f); }, reorder: true, opts: ['limit'], min: 1 },
    split: { accept: PDF, multi: false, filter: isPdf, opts: [] },
    rotate: { accept: PDF, multi: true, filter: isPdf, opts: ['angle'] },
    topdf: { accept: IMG, multi: true, filter: isImage, reorder: true, opts: ['limit'] },
    tojpg: { accept: PDF, multi: true, filter: isPdf, opts: ['quality'] },
    numbers: { accept: PDF, multi: true, filter: isPdf, opts: ['format', 'pos', 'vpos'] },
    watermark: { accept: PDF, multi: true, filter: isPdf, opts: ['text', 'opacity'] },
    sign: { accept: PDF, multi: false, filter: isPdf, opts: ['pad', 'where', 'pos'] },
    organize: { accept: PDF, multi: false, filter: isPdf, opts: ['thumbs'] },
    image: { accept: IMG, multi: true, filter: isImage, opts: ['imgsize'] }
  };
  var SIZES = ['100k', '200k', '300k', '500k', '1m', '2m', '3m', '4m', '5m', '10m'];
  function sizeLabel(c) { return parseFloat(c) + ' ' + (/m$/.test(c) ? t('MB') : t('KB')); }
  function select(name, options, val) {
    var s = el('select', { name: name });
    options.forEach(function (o) { var op = el('option', { value: o[0] }, esc(o[1])); if (o[0] === val) op.selected = true; s.appendChild(op); });
    return s;
  }
  function field(label, input) { var l = el('label', { class: 'opt' }); l.appendChild(el('span', null, esc(label))); l.appendChild(input); return l; }

  function mount(root) {
    var mode = root.getAttribute('data-mode'), M = MODES[mode], files = [], state = { order: [] };
    var preset = root.getAttribute('data-level');
    root.innerHTML = '';
    var drop = el('label', { class: 'drop' }), input = el('input', { type: 'file', class: 'sr', accept: M.accept });
    if (M.multi) input.multiple = true;
    drop.appendChild(input);
    drop.appendChild(el('span', { class: 'drop-text' }, '<b>' + esc(t(M.multi ? 'chooseFiles' : 'chooseFile')) + '</b> ' + esc(t('orDrop')) + '<small>' + esc(t('hint_' + mode)) + '</small>'));
    var list = el('ul', { class: 'files' }), opts = el('div', { class: 'opts' }), thumbs = el('div', { class: 'thumbs' });
    var go = el('button', { type: 'button', class: 'go' }, esc(t('run_' + mode)));
    var status = el('p', { class: 'status', 'aria-live': 'polite' }), results = el('div', { class: 'results' });
    var priv = el('p', { class: 'privacy' }, '🔒 ' + esc(t('privacy')));
    var ctl = {};

    M.opts.forEach(function (k) {
      if (k === 'level') {
        var o = [['reco', t('lvl_reco')], ['strong', t('lvl_strong')], ['low', t('lvl_low')]].concat(SIZES.map(function (s) { return [s, t('maxSize', { size: sizeLabel(s) })]; }));
        ctl.level = select('level', o, preset || 'reco'); opts.appendChild(field(t('compression'), ctl.level));
      } else if (k === 'limit') {
        ctl.level = select('level', [['', t('noLimit')]].concat(SIZES.map(function (s) { return [s, t('maxSize', { size: sizeLabel(s) })]; })), preset || ''); opts.appendChild(field(t('sizeLimit'), ctl.level));
      } else if (k === 'imgsize') {
        ctl.level = select('level', SIZES.map(function (s) { return [s, t('maxSize', { size: sizeLabel(s) })]; }), preset || '500k'); opts.appendChild(field(t('sizeLimit'), ctl.level));
      } else if (k === 'angle') {
        ctl.angle = select('angle', [['90', t('rot_90')], ['180', t('rot_180')], ['270', t('rot_270')]], '90'); opts.appendChild(field(t('rotation'), ctl.angle));
      } else if (k === 'quality') {
        ctl.quality = select('quality', [['normal', t('q_normal')], ['high', t('q_high')]], 'normal'); opts.appendChild(field(t('quality'), ctl.quality));
      } else if (k === 'format') {
        ctl.format = select('format', [['n', '1, 2, 3'], ['of', '1 / 10'], ['page', t('pageWord') + ' 1']], 'n'); opts.appendChild(field(t('format'), ctl.format));
      } else if (k === 'pos') {
        ctl.pos = select('pos', [['center', t('center')], ['right', t('right')], ['left', t('left')]], mode === 'sign' ? 'right' : 'center'); opts.appendChild(field(t('position'), ctl.pos));
      } else if (k === 'vpos') {
        ctl.vpos = select('vpos', [['bottom', t('bottom')], ['top', t('top')]], 'bottom'); opts.appendChild(field(t('vertical'), ctl.vpos));
      } else if (k === 'text') {
        ctl.text = el('input', { type: 'text', value: t('wmDefault'), maxlength: '60' }); opts.appendChild(field(t('wmText'), ctl.text));
      } else if (k === 'opacity') {
        ctl.opacity = select('opacity', [['0.15', t('op_light')], ['0.25', t('op_medium')], ['0.45', t('op_strong')]], '0.25'); opts.appendChild(field(t('opacity'), ctl.opacity));
      } else if (k === 'where') {
        ctl.where = select('where', [['last', t('lastPage')], ['first', t('firstPage')], ['all', t('allPages')]], 'last'); opts.appendChild(field(t('signWhere'), ctl.where));
      } else if (k === 'pad') {
        var wrap = el('div', { class: 'pad-wrap' });
        wrap.appendChild(el('span', { class: 'pad-label' }, esc(t('signHere'))));
        var c = el('canvas', { class: 'pad', width: '600', height: '200' }); wrap.appendChild(c);
        var clr = el('button', { type: 'button', class: 'pad-clear' }, esc(t('clear'))); wrap.appendChild(clr);
        opts.appendChild(wrap);
        var x = c.getContext('2d'), drawing = false, has = false;
        x.lineWidth = 3.2; x.lineCap = 'round'; x.lineJoin = 'round'; x.strokeStyle = '#10204a';
        function pt(e) { var r = c.getBoundingClientRect(); return [(e.clientX - r.left) * c.width / r.width, (e.clientY - r.top) * c.height / r.height]; }
        c.addEventListener('pointerdown', function (e) { drawing = true; has = true; c.setPointerCapture(e.pointerId); var p = pt(e); x.beginPath(); x.moveTo(p[0], p[1]); e.preventDefault(); });
        c.addEventListener('pointermove', function (e) { if (!drawing) return; var p = pt(e); x.lineTo(p[0], p[1]); x.stroke(); e.preventDefault(); });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (ev) { c.addEventListener(ev, function () { drawing = false; }); });
        clr.onclick = function () { x.clearRect(0, 0, c.width, c.height); has = false; };
        ctl.pad = { get: function () { return has ? png(c) : Promise.resolve(null); } };
      }
    });

    [drop, list, thumbs, opts, go, status, results, priv].forEach(function (n) { root.appendChild(n); });

    function draw() {
      list.innerHTML = '';
      files.forEach(function (f, i) {
        var li = el('li', null, '<span>' + esc(f.name) + '</span><em>' + fmt(f.size) + '</em>');
        if (M.reorder && files.length > 1) { var up = el('button', { type: 'button', 'aria-label': t('moveUp'), title: t('moveUp') }, '↑'); up.onclick = function () { if (i > 0) { var tmp = files[i - 1]; files[i - 1] = files[i]; files[i] = tmp; draw(); } }; li.appendChild(up); }
        var x = el('button', { type: 'button', 'aria-label': t('remove'), title: t('remove') }, '✕'); x.onclick = function () { files.splice(i, 1); thumbs.innerHTML = ''; draw(); }; li.appendChild(x);
        list.appendChild(li);
      });
      go.disabled = !files.length;
    }
    function drawThumbs() {
      thumbs.innerHTML = '<p class="status">⏳ ' + esc(t('loadingPages')) + '</p>';
      openPdf(files[0]).then(function (doc) {
        var a = []; for (var i = 1; i <= doc.numPages; i++) a.push(i);
        return seq(a, function (n) { return render(doc, n, 260).then(function (p) { return p.canvas.toDataURL('image/jpeg', .7); }); });
      }).then(function (imgs) {
        state.order = imgs.map(function (src, i) { return { i: i, rot: 0, src: src }; });
        paint();
      }).catch(function () { thumbs.innerHTML = '<p class="status">❌ ' + esc(t('error')) + '</p>'; });
    }
    function paint() {
      thumbs.innerHTML = '';
      var g = el('div', { class: 'tgrid' });
      state.order.forEach(function (o, k) {
        var c = el('div', { class: 'tcard' });
        var im = el('img', { src: o.src, alt: t('pageWord') + ' ' + (o.i + 1) }); im.style.transform = 'rotate(' + o.rot + 'deg)';
        c.appendChild(im); c.appendChild(el('span', { class: 'tnum' }, String(o.i + 1)));
        var bar = el('div', { class: 'tbar' });
        [['←', t('moveUp'), function () { if (k > 0) { var tmp = state.order[k - 1]; state.order[k - 1] = o; state.order[k] = tmp; paint(); } }],
         ['⟳', t('rotation'), function () { o.rot = (o.rot + 90) % 360; paint(); }],
         ['✕', t('remove'), function () { if (state.order.length > 1) { state.order.splice(k, 1); paint(); } }],
         ['→', t('moveDown'), function () { if (k < state.order.length - 1) { var tmp = state.order[k + 1]; state.order[k + 1] = o; state.order[k] = tmp; paint(); } }]]
          .forEach(function (b) { var bt = el('button', { type: 'button', title: b[1], 'aria-label': b[1] }, b[0]); bt.onclick = b[2]; bar.appendChild(bt); });
        c.appendChild(bar); g.appendChild(c);
      });
      thumbs.appendChild(g);
    }
    function add(fl) {
      var arr = Array.prototype.slice.call(fl || []), ok = arr.filter(M.filter);
      status.textContent = ok.length < arr.length ? t('ignored') : '';
      files = M.multi ? files.concat(ok) : ok.slice(0, 1);
      results.innerHTML = ''; input.value = '';
      draw();
      if (mode === 'organize' && files.length) drawThumbs();
    }
    input.onchange = function () { add(input.files); };
    ['dragenter', 'dragover'].forEach(function (e) { drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.add('over'); }); });
    ['dragleave', 'drop'].forEach(function (e) { drop.addEventListener(e, function (ev) { ev.preventDefault(); drop.classList.remove('over'); }); });
    drop.addEventListener('drop', function (e) { add(e.dataTransfer.files); });

    function show(items) {
      results.innerHTML = '';
      items.forEach(function (r) {
        var blob = r.blob instanceof Blob ? r.blob : new Blob([r.blob], { type: /\.jpg$/.test(r.name) ? 'image/jpeg' : 'application/pdf' });
        r._blob = blob;
        var box = el('div', { class: 'res ' + (r.ok ? 'ok' : 'warn') });
        box.appendChild(el('p', { class: 'badge' }, (r.ok ? '✅ ' : '⚠️ ') + fmt(blob.size) + (r.ok ? '' : ' · ' + esc(t('tooBig')))));
        var nameIn = el('input', { type: 'text', value: r.name, 'aria-label': t('fileName'), spellcheck: 'false' });
        var a = el('a', { class: 'dl', href: URL.createObjectURL(blob), download: r.name }, esc(t('download')));
        nameIn.oninput = function () { a.setAttribute('download', nameIn.value || r.name); };
        var row = el('div', { class: 'row' }); row.appendChild(nameIn); row.appendChild(a); box.appendChild(row);
        if (r.note) box.appendChild(el('p', { class: 'note' }, esc(r.note)));
        results.appendChild(box);
      });
      if (items.length > 1) {
        var all = el('button', { type: 'button', class: 'dl zip' }, esc(t('downloadAll')));
        all.onclick = function () {
          all.disabled = true;
          jszip().then(function (Z) { var z = new Z(); items.forEach(function (r) { z.file(r.name, r._blob); }); return z.generateAsync({ type: 'blob' }); })
            .then(function (zb) { var a = el('a', { href: URL.createObjectURL(zb), download: cleanName(files[0].name, 'zip') }); document.body.appendChild(a); a.click(); a.remove(); all.disabled = false; });
        };
        results.insertBefore(all, results.firstChild);
      }
    }

    go.onclick = function () {
      if (!files.length) return;
      var o = { outName: t('mergedName') };
      Object.keys(ctl).forEach(function (k) { if (ctl[k].value != null) o[k] = ctl[k].value; });
      go.disabled = true; results.innerHTML = '';
      var step = function (s) { status.textContent = '⏳ ' + s + '...'; };
      step(t('working'));
      var pre = ctl.pad ? ctl.pad.get().then(function (b) { o.signature = b; }) : Promise.resolve();
      if (mode === 'organize') o.order = state.order;
      pre.then(function () { return ACT[mode](files, o, step); }).then(function (r) {
        show(Array.isArray(r) ? r : [r]);
        status.textContent = '✔️ ' + t('done');
      }).catch(function (e) {
        console.error(e);
        status.textContent = '❌ ' + (e && e.message === 'NOSIG' ? t('noSignature') : e && e.message === 'LOAD' ? t('loadError') : t('error'));
      }).then(function () { go.disabled = false; });
    };
    draw();
  }
  document.querySelectorAll('[data-pdftool]').forEach(mount);
})();
