"""Pages allemandes de CVLibre (cvlibre.com/de/). Lancer : python3 tools/i18n/de_pages.py"""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from alt import links
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
V = "20261113m"
PAYPAL = "https://ko-fi.com/cvlibrecom"  # page Ko-fi de CVLibre (13 nov 2026, remplace PayPal)
DON_BOX = '''    <div class="after-box">
      <h3>CVLibre unterstützen</h3>
      <p>CVLibre ist 100 % kostenlos, aber jede KI-Nutzung kostet uns Geld. Eine kleine Spende, schon ab 1 €, hilft, es für alle kostenlos zu halten.</p>
      <a class="btn btn-sm btn-ghost" href="%s" target="_blank" rel="noopener" id="after-don">Auf Ko-fi spenden ❤️</a>
    </div>
'''.replace("%s", PAYPAL)
DON_BTN = '''  <p><a class="btn" href="%s" target="_blank" rel="noopener">Auf Ko-fi spenden ❤️</a></p>
  <p class="hint">Die Zahlung läuft vollständig über Ko-fi: CVLibre sieht Ihre Bankdaten nie.</p>'''.replace("%s", PAYPAL)

def head(title, desc, path, extra="", ld=None, robots="index, follow"):
    url = "https://cvlibre.com" + path
    return f'''<!doctype html>
<html lang="de-DE">
<head>
<meta charset="utf-8"><script>(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8638687738606649" crossorigin="anonymous"></script><script src="/assets/de/consent.js?v={V}" defer></script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
{links(path)}<meta name="robots" content="{robots}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:locale" content="de_DE">
<meta property="og:image" content="https://cvlibre.com/assets/og-de.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://cvlibre.com/assets/og-de.png">
<meta name="theme-color" content="#f3f5f8">
<link rel="stylesheet" href="/assets/style.css?v={V}">
<link rel="stylesheet" href="/assets/cv.css?v=20261113b">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/source-sans-3-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
{extra}{('<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>') if ld else ''}
</head>
'''

HEADER = '''<a class="skip" href="#main">Zum Inhalt springen</a>
<header class="top">
  <div class="wrap top-in">
    <a class="brand" href="/de/" aria-label="CVLibre, Startseite"><span class="b1">CV</span><span class="b2">libre</span></a>
    <nav class="nav" aria-label="Hauptnavigation">
      <a href="/de/anschreiben/">Anschreiben</a>
      <a href="/de/briefe/">Briefe</a>
      <a href="/de/jobs/">Jobs</a>
      <a href="/de/ratgeber/">Ratgeber</a>
      <a href="/de/#faq">FAQ</a>
      <a class="btn btn-ghost btn-sm" id="nav-acc" href="/de/lebenslauf-erstellen/?connexion=1" rel="nofollow">Anmelden</a>
      <a class="btn btn-ghost btn-sm" id="nav-out" href="#" hidden>Abmelden</a>
      <a class="btn btn-sm" href="/de/lebenslauf-erstellen/">Lebenslauf erstellen</a>
    </nav>
  </div>
</header>
'''

FOOTER = f'''<footer class="foot">
  <div class="wrap foot-in">
    <p class="foot-brand"><strong>CVLibre</strong> ist 100 % kostenlos. Die Seite wird durch Werbung und freiwillige Unterstützung ihrer Nutzer finanziert. <a href="/de/unterstuetzen/">Danke für Ihre Unterstützung ❤️</a></p>
    <p class="foot-ai">CVLibre nutzt künstliche Intelligenz, um einen Lebenslauf auszufüllen, zu verbessern und an eine Stellenanzeige anzupassen und um Anschreiben zu verfassen. Sie lesen und korrigieren das Ergebnis immer selbst.</p>
    <nav aria-label="Rechtliches">
      <a href="/de/ratgeber/">Bewerbungsratgeber</a>
      <a href="/de/briefe/">Briefe</a>
      <a href="/de/jobs/">Jobs</a>
      <a href="/de/arbeitgeber/">Arbeitgeber: Stelle veröffentlichen</a>
      <a href="/de/impressum/">Impressum</a>
      <a href="/de/datenschutz/">Datenschutz</a>
      <a href="/de/nutzungsbedingungen/">Nutzungsbedingungen</a>
      <a href="/de/unterstuetzen/">CVLibre unterstützen</a>
    </nav>
  </div>
</footer>
<script src="/assets/de/nav.js?v={V}" defer></script>
<script src="/assets/de/support.js?v={V}" defer></script>
<script src="/assets/stats.js?v=20261113b" defer></script>
'''

def acc_dlg(perk1, with_in):
    out_end = "  </div>\n" if with_in else '    <p class="pass-note" id="acc-note" role="status"></p>\n  </div>\n'
    inn = '''  <div id="acc-in" hidden>
    <h2 id="acc-title-in-h" class="acc-h2">Mein Konto</h2>
    <p>Angemeldet als <strong id="acc-mail"></strong></p>
    <div class="fld"><label for="acc-title-in">Name dieses Lebenslaufs (nur für Sie sichtbar)</label><input type="text" id="acc-title-in" maxlength="60" placeholder="Z. B. Lebenslauf für Bosch, Lebenslauf Marketing" autocomplete="off"></div>
    <p class="pass-row"><button type="button" class="btn btn-sm" id="acc-save">Diesen Lebenslauf speichern</button><button type="button" class="btn btn-ghost btn-sm" id="acc-new">Als neuen Lebenslauf speichern</button></p>
    <div id="acc-list"></div>
    <p class="pass-row"><button type="button" class="btn btn-ghost btn-sm" id="acc-out-btn">Abmelden</button><button type="button" class="btn btn-ghost btn-sm" id="acc-del">Mein Konto löschen</button></p>
  </div>
  <p class="pass-note" id="acc-note" role="status"></p>
''' if with_in else ""
    return f'''<dialog class="pass-dlg" id="acc-dlg" aria-labelledby="acc-title">
  <button type="button" class="dlg-x" id="acc-close" aria-label="Schließen">&times;</button>
  <div id="acc-out">
    <p class="acc-brand" aria-hidden="true"><span class="b1">CV</span><span class="b2">libre</span></p>
    <h2 id="acc-title">Kostenloses Konto erstellen</h2>
    <ul class="acc-perks" id="acc-intro">
      <li>{perk1}</li>
      <li>Kostenlos, ohne Passwort: eine E-Mail-Adresse genügt</li>
      <li>Schon registriert? Melden Sie sich genauso an</li>
    </ul>
    <div id="acc-step1">
      <button type="button" class="btn btn-ghost acc-big" id="acc-google">Weiter mit Google</button>
      <button type="button" class="btn acc-big" id="acc-mail-open">Weiter mit meiner E-Mail</button>
    </div>
    <div id="acc-step2" hidden>
      <label for="acc-email" class="acc-lab">E-Mail-Adresse</label>
      <input type="email" id="acc-email" autocomplete="email" inputmode="email" placeholder="sie@beispiel.de">
      <button type="button" class="btn acc-big" id="acc-mail-go">Anmeldelink senden</button>
      <button type="button" class="link-btn" id="acc-back">Zurück</button>
    </div>
    <p class="acc-legal">Mit dem Fortfahren akzeptieren Sie die <a href="/de/nutzungsbedingungen/">Nutzungsbedingungen</a> und die <a href="/de/datenschutz/">Datenschutzerklärung</a>.</p>
{out_end}{inn}</dialog>
'''

def write(path, html):
    p = os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(html)
    print("écrit", p)

APP = lambda name, desc, url: {"@context": "https://schema.org", "@type": "WebApplication", "name": name, "description": desc, "url": "https://cvlibre.com" + url, "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "inLanguage": "de-DE", "offers": [{"@type": "Offer", "name": "Kostenlos", "price": "0", "priceCurrency": "EUR"}]}
OPTS = ''.join(f'<option value="{v}">{n}</option>' for v, n in [("inter", "Inter"), ("nunito", "Nunito (abgerundet)"), ("montserrat", "Montserrat"), ("sourcesans", "Source Sans"), ("bricolage", "Bricolage"), ("lora", "Lora (Serifen)"), ("playfair", "Playfair (elegante Serifen)"), ("sourceserif", "Source Serif")])
def fmt_row(lab, k): return f'      <label class="fmt-row"><span>{lab}</span><select data-f="{k}"><option value="">Standard der Vorlage</option>{OPTS}</select></label>\n'

# ---------------- Lebenslauf erstellen ----------------
builder = head("Lebenslauf erstellen kostenlos mit KI, als PDF | CVLibre",
    "Kostenloser Lebenslauf-Generator mit KI: ausfüllen, Formulierungen verbessern, an die Stellenanzeige anpassen. 33 Vorlagen, PDF, ohne Anmeldung.",
    "/de/lebenslauf-erstellen/",
    extra='''<style>
@media print {
  @page { size: A4; margin: 0; }
  html, body { background: #fff !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .skip, .top, .foot, .app-bar, .panel, .mobile-tabs, .notice, .help, .pass-dlg, .sup { display: none !important; }
  .wrap { max-width: none; padding: 0; }
  .app { display: block; padding: 0; }
  body .preview-col { display: block !important; position: static; }
  body .panel { display: none !important; }
  .preview-outer { border: 0; padding: 0; background: #fff; border-radius: 0; overflow: visible; }
  .preview-box { height: auto !important; }
  .preview-box .sheet { transform: none !important; position: relative !important; min-height: 296mm; }
}
</style>
''', ld=APP("CVLibre Lebenslauf-Generator", "Lebenslauf kostenlos online erstellen und als PDF herunterladen, ohne Konto.", "/de/lebenslauf-erstellen/")) + '<body data-tab="edit">\n' + HEADER + f'''
<div class="app-bar" role="region" aria-label="Einstellungen des Lebenslaufs">
  <div class="wrap app-bar-in">
    <div class="grp grp-tpl" role="group" aria-label="Vorlage"><span>Vorlage</span>
      <button type="button" class="btn btn-ghost btn-sm tpl-cur" id="tpl-cur" aria-haspopup="dialog">Modern ▾</button>
      <div class="seg" id="tpls">
        <button type="button" data-tpl="classique" aria-pressed="false">Klassisch</button>
        <button type="button" data-tpl="moderne" aria-pressed="false">Modern</button>
        <button type="button" data-tpl="sobre" aria-pressed="false">Schlicht</button>
        <button type="button" id="tpl-more" aria-haspopup="dialog">Weitere Vorlagen</button>
      </div>
    </div>
    <div class="grp" role="group" aria-label="Gestaltung"><button type="button" class="btn btn-ghost btn-sm" id="fmt-btn" aria-haspopup="dialog">Anpassen</button></div>
    <div class="grp" role="group" aria-label="Farbe"><span>Farbe</span>
      <div class="swatches" id="swatches"></div>
    </div>
    <div class="app-actions">
      <details class="tbm" id="more">
        <summary class="btn btn-ghost btn-sm">Mehr<span class="tbm-dots" aria-hidden="true"> ⋯</span></summary>
        <div class="tbm-menu" role="group" aria-label="Weitere Aktionen">
          <button type="button" class="tbm-item" id="tailor-open">An Stellenanzeige anpassen (KI)</button>
          <button type="button" class="tbm-item" id="acc-btn">Online speichern (kostenloses Konto)</button>
          <button type="button" class="tbm-item" id="export">Exportieren (Datei)</button>
          <button type="button" class="tbm-item" id="import">Datei importieren</button><input type="file" id="import-file" accept=".json,application/json" hidden>
          <button type="button" class="tbm-item danger" id="reset">Neu beginnen</button>
        </div>
      </details>
      <button type="button" class="btn btn-sm" id="print">PDF herunterladen</button>
    </div>
  </div>
</div>

<main id="main" class="wrap">
  <h1 class="sr-only" style="position:absolute;left:-9999px">Lebenslauf erstellen</h1>
  <div class="mobile-tabs"><div class="seg" role="group" aria-label="Ansicht">
    <button type="button" id="tab-edit" aria-pressed="true" data-tab="edit">Bearbeiten</button>
    <button type="button" id="tab-view" aria-pressed="false" data-tab="view">Vorschau</button>
  </div></div>

  <div class="app">
    <div class="panel" id="panel">
      <details class="fs" open>
        <summary>Mit KI ausfüllen (kostenlos)</summary>
        <div class="fs-body">
          <div class="ai-budget" aria-live="polite"></div>
          <div class="fld"><label for="ai-text">Beschreiben Sie Ihren Werdegang in ein paar Zeilen</label>
            <textarea id="ai-text" maxlength="8000" placeholder="Z. B. 3 Jahre Servicekraft im Restaurant Zum Hafen in Hamburg, ein Jahr Kasse bei REWE, Ausbildung zur Kauffrau im Einzelhandel 2019. Englisch fließend. Suche eine Stelle als Restaurantleiterin."></textarea>
            <span class="hint">Oder fügen Sie unten Ihren alten Lebenslauf hinzu: die KI liest ihn und füllt das Formular aus.</span>
          </div>
          <div class="fld"><label for="ai-file">Alter Lebenslauf (PDF oder Foto, optional)</label><input type="file" id="ai-file" accept="application/pdf,image/jpeg,image/png,image/webp"></div>
          <div class="ai-actions"><button type="button" class="btn btn-sm" id="ai-go">Lebenslauf ausfüllen</button><button type="button" class="link-btn" id="ai-undo" hidden>Rückgängig</button></div>
          <p class="hint" id="ai-msg" role="status" aria-live="polite">Kostenlos, ohne Anmeldung: 5 Nutzungen pro Tag. Die KI erfindet nichts hinzu: prüfen Sie das Ergebnis, bevor Sie Ihren Lebenslauf verschicken. Was Sie senden, wird von einer KI verarbeitet (siehe <a href="/de/datenschutz/">Datenschutz</a>).</p>
        </div>
      </details>
      <details class="fs" id="tailor">
        <summary>Lebenslauf an eine Stellenanzeige anpassen (kostenlose KI)</summary>
        <div class="fs-body">
          <p class="hint">Fügen Sie eine Stellenanzeige ein: die KI passt Titel, Profil, Kenntnisse und Aufgaben an und zeigt fehlende Stichwörter. Sie formuliert nur um, was schon in Ihrem Lebenslauf steht, und Sie entscheiden, was Sie übernehmen.</p>
          <div class="fld"><label for="tl-ad">Die Stellenanzeige</label>
            <textarea id="tl-ad" maxlength="5000" placeholder="Fügen Sie die Anzeige hier ein (Position, Aufgaben, Anforderungen)."></textarea>
          </div>
          <div class="ai-actions"><button type="button" class="btn btn-sm" id="tl-go">Lebenslauf anpassen</button><button type="button" class="link-btn" id="tl-undo" hidden>Anpassung rückgängig</button></div>
          <p class="hint" id="tl-msg" role="status" aria-live="polite">Zählt als 1 Ihrer 5 kostenlosen Nutzungen pro Tag. Füllen Sie zuerst Ihren Lebenslauf aus.</p>
          <div class="tl-res" id="tl-res" hidden></div>
        </div>
      </details>
      <details class="fs" open>
        <summary>Persönliche Daten</summary>
        <div class="fs-body">
          <div class="fld"><span class="lab">Foto (optional)</span>
            <div class="photo-row">
              <div class="photo-prev" id="photo-prev" aria-hidden="true"></div>
              <input type="file" id="photo-file" accept="image/*" aria-label="Foto auswählen">
              <button type="button" class="link-btn" id="photo-del" hidden>Foto entfernen</button>
            </div>
            <span class="hint">In Deutschland verbreitet, aber freiwillig: ein Bewerbungsfoto darf nicht verlangt werden.</span>
          </div>
          <div class="fld"><label for="f-name">Vor- und Nachname</label><input id="f-name" data-k="name" autocomplete="name"></div>
          <p class="hint" id="name-lock" hidden></p>
          <div class="fld"><label for="f-title">Berufsbezeichnung oder Wunschposition</label><input id="f-title" data-k="title" placeholder="Z. B. Buchhalterin, Webentwickler"></div>
          <div class="row2">
            <div class="fld"><label for="f-email">E-Mail</label><input id="f-email" data-k="email" type="email" autocomplete="email"></div>
            <div class="fld"><label for="f-phone">Telefon</label><input id="f-phone" data-k="phone" type="tel" autocomplete="tel"></div>
          </div>
          <div class="row2">
            <div class="fld"><label for="f-city">Wohnort</label><input id="f-city" data-k="city" autocomplete="address-level2"><span class="hint">Die vollständige Adresse ist nicht nötig.</span></div>
            <div class="fld"><label for="f-link">Link (LinkedIn, Xing, Portfolio)</label><input id="f-link" data-k="link"></div>
          </div>
        </div>
      </details>

      <details class="fs" open>
        <summary>Kurzprofil</summary>
        <div class="fs-body">
          <div class="fld"><label for="f-summary">2 oder 3 Sätze über Sie</label><textarea id="f-summary" data-k="summary"></textarea><span class="hint">Wer Sie sind, was Sie gut können, was Sie suchen.</span><button type="button" class="link-btn rw" data-rw="summary">Mit KI verbessern</button></div>
        </div>
      </details>

      <details class="fs" open>
        <summary>Berufserfahrung</summary>
        <div class="fs-body"><div id="exp-list" style="display:grid;gap:14px"></div><button type="button" class="add" data-add="exp">Station hinzufügen</button></div>
      </details>

      <details class="fs">
        <summary>Ausbildung</summary>
        <div class="fs-body"><div id="edu-list" style="display:grid;gap:14px"></div><button type="button" class="add" data-add="edu">Abschluss hinzufügen</button></div>
      </details>

      <details class="fs">
        <summary>Kenntnisse</summary>
        <div class="fs-body">
          <div class="fld"><label for="f-skills">Ihre Kenntnisse</label><textarea id="f-skills" data-k="skills"></textarea><span class="hint">Trennen Sie sie mit Kommas.</span></div>
        </div>
      </details>

      <details class="fs">
        <summary>Sprachen</summary>
        <div class="fs-body"><div id="langs-list" style="display:grid;gap:14px"></div><button type="button" class="add" data-add="langs">Sprache hinzufügen</button></div>
      </details>

      <details class="fs">
        <summary>Interessen</summary>
        <div class="fs-body">
          <div class="fld"><label for="f-hobbies">Ihre Hobbys und Interessen</label><textarea id="f-hobbies" data-k="hobbies" style="min-height:70px"></textarea></div>
        </div>
      </details>
    </div>

    <div class="preview-col">
      <div class="preview-outer"><div class="preview-box" id="pbox"><div class="sheet t-moderne" id="sheet" aria-label="Vorschau des Lebenslaufs"></div></div></div>
      <p class="notice warn" id="pages-warn" hidden></p>
      <p class="notice warn" id="pass-msg" role="status" hidden></p>
      <div class="notice" id="acc-promo"><strong>Erstellen Sie ein kostenloses Konto, um Ihren Lebenslauf zu behalten und jederzeit zu bearbeiten.</strong> Freiwillig: das PDF lässt sich auch ohne Konto herunterladen. <button type="button" class="btn btn-sm" id="acc-promo-btn">Kostenloses Konto erstellen</button></div>
      <p class="help">So speichern Sie als PDF: klicken Sie auf "PDF herunterladen", wählen Sie "Als PDF speichern" als Drucker und deaktivieren Sie "Kopf- und Fußzeilen". Der Text im PDF bleibt markierbar, sodass Bewerbermanagementsysteme (ATS) ihn lesen können.</p>
      <p class="help">Ihr Entwurf bleibt in diesem Browser gespeichert, und in Ihrem Konto, wenn Sie ihn dort speichern. Nur was Sie an die KI senden ("Mit KI ausfüllen" oder "Mit KI verbessern"), wird zur Verarbeitung übertragen.</p>
    </div>
  </div>
</main>

''' + acc_dlg("Behalten Sie Ihren Lebenslauf und finden Sie ihn auf all Ihren Geräten", True) + f'''<dialog class="pass-dlg after-dlg" id="after-dlg" aria-labelledby="after-title">
  <form method="dialog">
    <h2 id="after-title">Ihr Lebenslauf ist fertig ✅</h2>
    <p>Viel Erfolg bei Ihrer Bewerbung!</p>
    <div class="after-box">
      <h3>Anschreiben verfassen</h3>
      <p>Die KI schreibt in wenigen Sekunden einen ersten Entwurf Ihres Anschreibens aus Ihrem Lebenslauf und der Stellenanzeige.</p>
      <a class="btn btn-sm" href="/de/anschreiben/" id="after-jobs">Anschreiben erstellen</a>
    </div>
    <div class="after-box" id="after-acc">
      <h3>Lebenslauf online behalten</h3>
      <p>Mit einem kostenlosen Konto finden und bearbeiten Sie Ihre Lebensläufe und Anschreiben auf all Ihren Geräten. Ohne Passwort: ein Anmeldelink kommt per E-Mail.</p>
      <button type="button" class="btn btn-sm btn-ghost" id="after-acc-go">Kostenloses Konto erstellen</button>
    </div>
{DON_BOX}    <div class="pass-end"><button type="submit" class="btn btn-ghost btn-sm">Nein danke</button></div>
  </form>
</dialog>

<dialog class="pass-dlg" id="fmt-dlg" aria-labelledby="fmt-title">
  <form method="dialog">
    <h2 id="fmt-title">Lebenslauf anpassen</h2>
    <p class="hint">Jedes Element hat seine eigene Schrift. Lassen Sie "Standard der Vorlage", um die Schrift der gewählten Vorlage zu behalten.</p>
    <div class="fmt-list">
{fmt_row("Name", "n")}{fmt_row("Berufsbezeichnung", "i")}{fmt_row("Überschriften", "r")}{fmt_row("Stationen und Abschlüsse", "p")}{fmt_row("Text", "t")}    </div>
    <div class="fmt-row"><span>Größe</span><div class="seg"><button type="button" data-size="s" aria-pressed="false">Klein</button><button type="button" data-size="" aria-pressed="true">Normal</button><button type="button" data-size="l" aria-pressed="false">Groß</button></div></div>
    <div class="fmt-row"><span>Abstand</span><div class="seg"><button type="button" data-space="t" aria-pressed="false">Eng</button><button type="button" data-space="" aria-pressed="true">Normal</button><button type="button" data-space="a" aria-pressed="false">Luftig</button></div></div>
    <div class="pass-end"><button type="button" class="btn btn-ghost btn-sm" id="fmt-reset">Alles zurücksetzen</button><button type="submit" class="btn btn-sm">Fertig</button></div>
  </form>
</dialog>
<dialog class="pass-dlg tpl-dlg" id="tpl-dlg" aria-labelledby="tpl-title">
  <form method="dialog">
    <h2 id="tpl-title">Alle Vorlagen</h2>
    <p class="hint">33 Vorlagen, alle kostenlos.</p>
    <div class="tpl-grid" id="tpl-grid"></div>
    <div class="pass-end"><button type="submit" class="btn btn-ghost btn-sm">Schließen</button></div>
  </form>
</dialog>

''' + FOOTER + f'''
<script src="/assets/de/render.js?v={V}"></script>
<script src="/assets/pass.js?v=20261113b"></script>
<script src="/assets/de/builder.js?v={V}"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="/assets/de/account.js?v={V}"></script>
<script src="/assets/de/aibar.js?v={V}" defer></script>
</body>
</html>
'''
write("/de/lebenslauf-erstellen/", builder)

# ---------------- Anschreiben ----------------
letter = head("Anschreiben mit KI kostenlos erstellen | CVLibre",
    "Bewerbungsanschreiben kostenlos mit KI: Stellenanzeige einfügen, Werdegang ergänzen, ersten Entwurf in Sekunden erhalten. Bearbeiten und als PDF herunterladen.",
    "/de/anschreiben/", ld=APP("CVLibre Anschreiben mit KI", "Die KI schreibt einen ersten Entwurf Ihres Anschreibens aus der Stellenanzeige.", "/de/anschreiben/"),
    extra='<link rel="stylesheet" href="/assets/letter.css?v=20261113b">\n<style>@media print { .sup { display: none !important; } }</style>\n') + "<body>\n" + HEADER + f'''
<main id="main" class="wrap lt">
  <h1>Anschreiben mit KI</h1>
  <p class="lead lt-lead">Geben Sie die Stelle ein und fügen Sie die Anzeige ein. Die KI schreibt einen ersten Entwurf auf Basis Ihres Werdegangs. Lesen und korrigieren Sie ihn und laden Sie ihn als PDF herunter. Der Text wird von künstlicher Intelligenz geschrieben: Sie bleiben für das verantwortlich, was Sie versenden.</p>
  <div class="ai-budget" aria-live="polite"></div>
  <div class="lt-lock" id="lt-lock" hidden></div>
  <div class="lt-grid">
    <div class="lt-form">
      <section class="lt-card">
        <h2>Die Stelle</h2>
        <div class="fld"><label for="lt-job">Stelle, auf die Sie sich bewerben</label><input id="lt-job" maxlength="100" placeholder="Z. B. Kaufmann im Einzelhandel" autocomplete="off"></div>
        <div class="fld"><label for="lt-company">Unternehmen</label><input id="lt-company" maxlength="100" placeholder="Z. B. dm-drogerie markt" autocomplete="off"></div>
        <div class="fld"><label for="lt-ad">Stellenanzeige (optional)</label><textarea id="lt-ad" rows="5" maxlength="4000" placeholder="Fügen Sie die Anzeige hier ein: die KI nutzt die geforderten Kenntnisse."></textarea></div>
      </section>
      <section class="lt-card">
        <h2>Ihr Werdegang</h2>
        <div class="fld" id="lt-cvrow" hidden><label for="lt-cv">Von einem meiner Lebensläufe ausgehen</label><select id="lt-cv"><option value="">Keiner, ich beschreibe meinen Werdegang</option></select></div>
        <div class="fld"><label for="lt-profile">In ein paar Zeilen</label><textarea id="lt-profile" rows="5" maxlength="2500" placeholder="Z. B. 3 Jahre Servicekraft in Hamburg, ein Jahr Kasse im Supermarkt, Ausbildung zur Kauffrau im Einzelhandel. Ich arbeite gern mit Kunden und im Team."></textarea></div>
        <div class="fld"><label for="lt-tone">Ton</label><select id="lt-tone"><option value="classique">Professionell</option><option value="dynamique">Engagiert</option><option value="sobre">Schlicht und direkt</option></select></div>
        <button type="button" class="btn acc-big" id="lt-gen">Anschreiben mit KI erstellen</button>
        <p class="hint" id="lt-msg" role="status" aria-live="polite">Die KI kann Fehler machen: lesen Sie alles, bevor Sie es versenden. Kostenlos: 5 KI-Nutzungen pro Tag, gemeinsam mit dem Lebenslauf-Generator.</p>
      </section>
      <section class="lt-card" id="lt-result">
        <h2>Ihr Anschreiben</h2>
        <div class="fld"><label for="lt-name">Ihr Name</label><input id="lt-name" maxlength="80" autocomplete="name"></div>
        <div class="fld"><label for="lt-contact">Ihre Kontaktdaten</label><textarea id="lt-contact" rows="3" maxlength="300" placeholder="Adresse&#10;Telefon&#10;E-Mail"></textarea></div>
        <div class="fld"><label for="lt-rcpt">Empfänger</label><textarea id="lt-rcpt" rows="3" maxlength="300" placeholder="Unternehmen&#10;Ansprechpartner&#10;Adresse"></textarea></div>
        <input type="hidden" id="lt-city">
        <div class="fld"><label for="lt-subject">Betreff</label><input id="lt-subject" maxlength="150" placeholder="Bewerbung als ..."></div>
        <div class="fld"><label for="lt-body">Text des Anschreibens</label><textarea id="lt-body" rows="14" maxlength="6000"></textarea></div>
      </section>
      <section class="lt-card">
        <h2>Speichern</h2>
        <div class="fld"><label for="lt-title">Name dieses Anschreibens (nur für Sie sichtbar)</label><input id="lt-title" maxlength="60" placeholder="Z. B. Anschreiben für Bosch"></div>
        <div class="lt-actions">
          <button type="button" class="btn" id="lt-print">PDF herunterladen</button>
          <button type="button" class="btn btn-ghost" id="lt-save">In meinem Konto speichern</button>
          <button type="button" class="btn btn-ghost" id="lt-new">Neues Anschreiben</button>
        </div>
        <p class="hint" id="lt-save-msg" role="status" aria-live="polite">Um das PDF herunterzuladen oder das Anschreiben zu speichern, brauchen Sie nur ein kostenloses Konto.</p>
      </section>
    </div>
    <div class="lt-prev"><div class="lt-box" id="lt-box"><div class="lt-sheet" id="lt-sheet" aria-label="Vorschau des Anschreibens"></div></div></div>
  </div>
  <div class="free-note"><p><strong>CVLibre ist 100 % kostenlos.</strong> Die Seite wird durch Werbung und freiwillige Spenden finanziert. Jede KI-Nutzung (Lebenslauf ausfüllen, umformulieren, Anschreiben schreiben) kostet uns wirklich Geld: Spenden helfen, es für alle kostenlos zu halten. Danke ❤️</p><p><a class="btn btn-sm" href="/de/unterstuetzen/">CVLibre unterstützen</a></p></div>
</main>
''' + FOOTER + "\n" + acc_dlg("Behalten Sie Ihre Dokumente und finden Sie sie auf all Ihren Geräten", False) + f'''
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="/assets/pass.js?v=20261113b"></script>
<script src="/assets/de/auth.js?v={V}"></script>
<script src="/assets/de/letter.js?v={V}"></script>
<script src="/assets/de/aibar.js?v={V}" defer></script>
</body>
</html>
'''
write("/de/anschreiben/", letter)

# ---------------- Startseite ----------------
FAQ = [
    ("Ist es wirklich kostenlos?", "Ja, zu 100 %. Alle Vorlagen, PDFs ohne Wasserzeichen und die KI-Werkzeuge sind kostenlos, ohne Kreditkarte. Ein kostenloses Konto (eine E-Mail-Adresse, kein Passwort) ist freiwillig: es speichert Ihre Lebensläufe und Anschreiben online. CVLibre wird durch Werbung und freiwillige Spenden finanziert."),
    ("Werden meine Daten irgendwohin gesendet?", "Nein, außer Sie nutzen die KI. Ihr Lebenslauf entsteht auf Ihrem Gerät. Nur der Text oder die Datei, die Sie bewusst an die KI senden, wird zur Verarbeitung übertragen, und wir speichern sie nicht."),
    ("Gehört ein Foto in den Lebenslauf?", "In Deutschland ist ein Bewerbungsfoto verbreitet, aber freiwillig: nach dem Allgemeinen Gleichbehandlungsgesetz darf es nicht verlangt werden. Bei CVLibre ist das Foto optional, und die Vorlagen sehen auch ohne Foto gut aus."),
    ("Wie lang sollte ein Lebenslauf sein?", "In Deutschland sind ein bis zwei Seiten üblich. Für Berufseinsteiger reicht oft eine Seite. CVLibre warnt Sie, wenn Ihr Lebenslauf länger als zwei Seiten wird."),
    ("Was ist ein ATS-freundlicher Lebenslauf?", "Ein ATS (Bewerbermanagementsystem) ist eine Software, die Bewerbungen sortiert. Ein ATS-freundlicher Lebenslauf enthält echten Text, klare Überschriften und keine Bilder anstelle von Text. Alle Vorlagen von CVLibre sind so aufgebaut."),
    ("Wie speichere ich das PDF?", "Klicken Sie auf \"PDF herunterladen\", wählen Sie \"Als PDF speichern\" statt eines Druckers und deaktivieren Sie \"Kopf- und Fußzeilen\" für ein sauberes Ergebnis."),
]
TPL = [("moderne", "Modern"), ("classique", "Klassisch"), ("duo", "Duo"), ("affiche", "Plakat"), ("editorial", "Editorial"), ("sobre", "Schlicht"), ("vertical", "Vertikal"), ("monogramme", "Monogramm"), ("geometrie", "Geometrisch"), ("sombre", "Dunkel"), ("retro", "Retro"), ("elegant", "Elegant")]
home = head("Lebenslauf kostenlos mit KI erstellen, ohne Anmeldung | CVLibre",
    "Lebenslauf kostenlos mit KI erstellen: die KI füllt ihn aus, verbessert Formulierungen und passt ihn an jede Stelle an. 33 Vorlagen, PDF, ohne Anmeldung.",
    "/de/",
    ld={"@context": "https://schema.org", "@graph": [
        {"@type": "WebApplication", "name": "CVLibre", "url": "https://cvlibre.com/de/", "applicationCategory": "BusinessApplication", "operatingSystem": "All", "inLanguage": "de-DE", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"}, "description": "Kostenloser Online-Lebenslauf-Generator mit KI: ATS-freundliche Vorlagen, PDF-Download, Daten bleiben im Browser."},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}) + "<body>\n" + HEADER + '''
<main id="main">
  <section class="hero">
    <div class="wrap hero-in">
      <div>
        <p class="hero-kicker">✨ 100 % kostenlos, mit künstlicher Intelligenz</p>
        <h1>Lebenslauf mit KI erstellen, kostenlos.</h1>
        <p class="lead">Laden Sie Ihren alten Lebenslauf hoch oder beschreiben Sie Ihren Werdegang in ein paar Zeilen: die KI füllt Ihren Lebenslauf aus, verbessert Ihre Formulierungen und passt ihn an jede Stellenanzeige an. Sie prüfen alles, wählen eine von 33 Vorlagen und laden das PDF herunter.</p>
        <div class="hero-cta">
          <a class="btn" href="/de/lebenslauf-erstellen/">Lebenslauf kostenlos erstellen</a>
          <a class="btn btn-ghost" href="#ai">Was die KI macht</a>
        </div>
        <p class="hero-note"><strong>Wirklich kostenlos:</strong> keine Anmeldung, kein Abo, keine Kreditkarte, kein Wasserzeichen. Die KI ist kostenlos, 5 Mal pro Tag.</p>
      </div>
      <div class="hero-shot"><div class="shot-frame" id="shot" aria-label="Beispiel eines mit CVLibre erstellten Lebenslaufs" role="img"><div class="sheet-scale"><div class="sheet t-moderne" id="shot-sheet"></div></div></div></div>
    </div>
  </section>

  <section class="section ai-sec" id="ai">
    <div class="wrap">
      <h2>Kostenlose KI, die Ihnen die Arbeit abnimmt</h2>
      <p class="lead-s">Vier KI-Werkzeuge, kostenlos und ohne Anmeldung, direkt im Lebenslauf-Generator. Auf vielen anderen Seiten gibt es KI nur im Bezahl-Abo.</p>
      <div class="ai-grid">
        <div class="ai-card"><span class="ai-ico" aria-hidden="true">📄</span><h3>Lebenslauf mit einem Klick ausfüllen</h3><p>Fügen Sie Ihren alten Lebenslauf hinzu (PDF oder Foto) oder schreiben Sie ein paar Zeilen. Die KI sortiert alles an die richtige Stelle: Berufserfahrung, Ausbildung, Kenntnisse, Sprachen.</p></div>
        <div class="ai-card"><span class="ai-ico" aria-hidden="true">✍️</span><h3>Formulierungen verbessern</h3><p>Ein Knopf neben jedem Text macht aus Ihren Sätzen klare Erfolge mit starken Verben, ohne etwas zu erfinden.</p></div>
        <div class="ai-card"><span class="ai-ico" aria-hidden="true">🎯</span><h3>An eine Stelle anpassen</h3><p>Fügen Sie eine Stellenanzeige ein: die KI passt Titel, Profil und Kenntnisse an und zeigt fehlende Stichwörter. Sie haken an, was Sie übernehmen.</p></div>
        <div class="ai-card"><span class="ai-ico" aria-hidden="true">💌</span><h3>Anschreiben verfassen</h3><p>Aus Ihrem Lebenslauf und der Anzeige schreibt die KI in Sekunden ein persönliches Anschreiben, im Ton Ihrer Wahl.</p></div>
      </div>
      <div class="ai-budget" aria-live="polite"></div>
      <p class="ai-note">Die KI fügt nie Stationen oder Abschlüsse hinzu: sie arbeitet nur mit dem, was Sie angeben. Lesen Sie das Ergebnis immer, bevor Sie sich bewerben.</p>
      <p><a class="btn" href="/de/lebenslauf-erstellen/">KI kostenlos nutzen, ohne Anmeldung</a></p>
    </div>
  </section>

  <section class="section gal-sec" id="templates">
    <div class="wrap">
      <h2>33 Lebenslauf-Vorlagen, alle kostenlos</h2>
      <p class="lead-s">Klassisch, modern oder kreativ. Klicken Sie auf eine Vorlage, um damit zu beginnen: Sie können sie jederzeit wechseln.</p>
      <div class="gal" id="gal">
''' + "".join(f'        <a class="gal-card" href="/de/lebenslauf-erstellen/?modele={k}" data-tpl="{k}"><span class="gal-thumb"></span><span class="gal-name">{n}</span></a>\n' for k, n in TPL) + '''      </div>
      <p><a class="btn btn-ghost" href="/de/lebenslauf-erstellen/?modeles=1">Alle 33 Vorlagen ansehen</a></p>
    </div>
  </section>

  <section class="section" id="how">
    <div class="wrap">
      <h2>Drei Schritte, zehn Minuten</h2>
      <ol class="steps">
        <li><h3>Die KI füllt Ihren Lebenslauf aus</h3><p>Laden Sie Ihren alten Lebenslauf hoch oder beschreiben Sie Ihren Werdegang: die KI füllt das Formular aus. Sie können auch alles selbst eintippen, mit einem Beispiel als Hilfe.</p></li>
        <li><h3>Vorlage und Farbe wählen</h3><p>33 Vorlagen, von klassisch bis kreativ. Der Wechsel ist sofort sichtbar, Ihr Text bleibt erhalten.</p></li>
        <li><h3>PDF herunterladen</h3><p>Eine A4-Datei mit echtem Text, bereit für Ihre Bewerbung per E-Mail oder für ein Jobportal.</p></li>
      </ol>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div>
        <h2>Gebaut für Bewerbermanagementsysteme</h2>
        <p>Viele Arbeitgeber nutzen eine Software (ATS), die Bewerbungen liest, bevor ein Mensch sie öffnet. Ein schlecht aufgebauter Lebenslauf wird falsch oder gar nicht gelesen.</p>
        <p>Die Vorlagen von CVLibre bleiben einfach: der Text im PDF ist echter Text, kein Bild, und jeder Abschnitt hat eine klare Überschrift.</p>
      </div>
      <ul class="checks">
        <li><b>Markierbarer Text.</b> Nichts wird in ein Bild umgewandelt.</li>
        <li><b>Übliche Überschriften.</b> Berufserfahrung, Ausbildung, Kenntnisse.</li>
        <li><b>Gängige Schriften</b> und gut lesbare Größen, ohne Effekte, die die Software verwirren.</li>
        <li><b>Ein Hinweis</b>, wenn Ihr Lebenslauf länger als zwei Seiten wird.</li>
      </ul>
    </div>
  </section>

  <section class="section" id="pricing">
    <div class="wrap">
      <h2>100 % kostenlos, für alle</h2>
      <div class="plans">
        <div class="plan plan-main">
          <h3>Alles ist kostenlos</h3>
          <p class="plan-price">0 €</p>
          <ul>
            <li>33 Lebenslauf-Vorlagen und Anpassung (Schriften, Größe, Abstand)</li>
            <li>PDFs ohne Banner oder Wasserzeichen</li>
            <li>KI: ausfüllen, verbessern, an eine Stelle anpassen und Anschreiben verfassen (5 Nutzungen pro Tag)</li>
            <li>Bis zu 20 Lebensläufe und 30 Anschreiben online mit einem kostenlosen Konto</li>
          </ul>
          <a class="btn" href="/de/lebenslauf-erstellen/">Lebenslauf erstellen</a>
        </div>
        <div class="plan">
          <h3>Wie wird das finanziert?</h3>
          <p>CVLibre wird durch Werbung und durch freiwillige Spenden seiner Nutzer finanziert.</p>
          <p>Jede KI-Nutzung kostet uns wirklich Geld: Spenden, auch kleine, helfen, es für alle kostenlos zu halten. Danke ❤️</p>
          <a class="btn btn-ghost" href="/de/unterstuetzen/">CVLibre unterstützen</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="faq">
    <div class="wrap faq">
      <h2>Häufige Fragen</h2>
''' + "".join(f"      <details><summary>{q}</summary><p>{a}</p></details>\n" for q, a in FAQ) + '''    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>Ihr kostenloser KI-Lebenslauf, fertig vor dem nächsten Kaffee.</h2>
      <a class="btn" href="/de/lebenslauf-erstellen/">Lebenslauf kostenlos erstellen</a>
    </div>
  </section>
</main>
''' + FOOTER + f'''
<script src="/assets/de/render.js?v={V}"></script>
<script>
(function () {{
  var sheet = document.getElementById("shot-sheet"), frame = document.getElementById("shot");
  sheet.style.setProperty("--acc", CVR.sample.accent);
  sheet.innerHTML = CVR.render(CVR.sample);
  var scaler = sheet.parentNode;
  function fit() {{ var k = frame.clientWidth / sheet.offsetWidth; scaler.style.transform = "scale(" + k + ")"; }}
  fit(); window.addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  var gal = document.getElementById("gal"), drawn = false;
  function draw() {{
    if (drawn) return; drawn = true;
    var html = CVR.render(CVR.sample);
    [].forEach.call(gal.querySelectorAll(".gal-card"), function (c) {{
      var th = c.querySelector(".gal-thumb"), sh = document.createElement("div");
      sh.className = "sheet t-" + c.getAttribute("data-tpl"); sh.style.setProperty("--acc", CVR.sample.accent); sh.setAttribute("aria-hidden", "true"); sh.innerHTML = html; th.appendChild(sh);
    }});
    gfit();
  }}
  function gfit() {{ [].forEach.call(gal.querySelectorAll(".gal-thumb"), function (th) {{ var sh = th.firstChild; if (sh) sh.style.transform = "scale(" + (th.clientWidth / sh.offsetWidth) + ")"; }}); }}
  if ("IntersectionObserver" in window) {{ var io = new IntersectionObserver(function (es) {{ if (es.some(function (e) {{ return e.isIntersecting; }})) {{ draw(); io.disconnect(); }} }}, {{ rootMargin: "400px" }}); io.observe(gal); }} else draw();
  window.addEventListener("resize", function () {{ if (drawn) gfit(); }});
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {{ if (drawn) gfit(); }});
}})();
</script>
<script src="/assets/de/aibar.js?v={V}" defer></script>
</body>
</html>
'''
write("/de/", home)

# ---------------- Textseiten ----------------
def text_page(path, title, desc, h1, body, robots="index, follow"):
    write(path, head(title, desc, path, robots=robots) + "<body>\n" + HEADER + f'''
<main id="main" class="wrap doc">
  <h1>{h1}</h1>
{body}
</main>
''' + FOOTER + "</body>\n</html>\n")

text_page("/de/unterstuetzen/", "CVLibre unterstützen | CVLibre", "CVLibre ist ein 100 % kostenloser Lebenslauf-Generator. Eine Spende, auch eine kleine, hilft, die KI zu bezahlen und die Seite für alle kostenlos zu halten.",
    "CVLibre unterstützen", f'''  <p class="lead">CVLibre ist 100 % kostenlos, für alle: alle Vorlagen, PDFs ohne Wasserzeichen und die KI-Werkzeuge. Nichts wird verkauft.</p>
  <p>Die Seite wird durch Werbung und durch Ihre Unterstützung finanziert. Jede KI-Nutzung (Lebenslauf ausfüllen, Text verbessern, Lebenslauf anpassen, Anschreiben verfassen) kostet uns wirklich Geld. Eine Spende, schon ab 1 €, hilft uns, die KI für alle kostenlos zu halten.</p>
  <p>Eine Spende schaltet nichts frei: alles bleibt kostenlos, ob Sie spenden oder nicht. Danke ❤️</p>
{DON_BTN}''')

text_page("/de/impressum/", "Impressum | CVLibre", "Impressum von CVLibre, dem kostenlosen Online-Lebenslauf-Generator.", "Impressum", '''  <h2>Angaben zum Anbieter</h2>
  <p>CVLibre wird privat betrieben von Jérémy Dacier-Jury.<br>Anschrift: 9 passage des Tisserands, 38790 Charantonnay, Frankreich<br>E-Mail: contact@cvlibre.com</p>
  <p>Verantwortlich für den Inhalt: Jérémy Dacier-Jury, Anschrift wie oben.</p>
  <h2>Hosting</h2>
  <p>Die Seite wird von GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, USA (GitHub Pages) gehostet. Konten und gespeicherte Lebensläufe liegen bei Supabase (Region Europäische Union).</p>
  <h2>Urheberrecht</h2>
  <p>Texte, Code und Vorlagen der Seite sind geschützt. Die Lebensläufe, die Sie erstellen, gehören vollständig Ihnen: solange sie in Ihrem Browser bleiben, haben wir keinen Zugriff darauf, und die in Ihrem Konto gespeicherten sehen nur Sie.</p>
  <h2>Haftung</h2>
  <p>CVLibre ist ein Gestaltungswerkzeug. Sie bleiben für den Inhalt Ihres Lebenslaufs und die Richtigkeit Ihrer Angaben verantwortlich. Für den Erfolg Ihrer Bewerbung übernehmen wir keine Gewähr.</p>
  <h2>Datenschutz</h2>
  <p>Siehe die <a href="/de/datenschutz/">Datenschutzerklärung</a>. Diese deutsche Fassung dient der Information; maßgeblich ist die französische Fassung der rechtlichen Seiten.</p>''')

text_page("/de/datenschutz/", "Datenschutz | CVLibre", "Wie CVLibre mit Ihren Daten umgeht: Ihr Lebenslauf bleibt in Ihrem Browser, das Konto ist freiwillig, und die KI erhält nur, was Sie bewusst senden.", "Datenschutzerklärung", '''  <p class="lead">Kurz gesagt: Sie erstellen Ihren Lebenslauf frei, und er bleibt in Ihrem Browser. Das PDF lässt sich ohne Konto herunterladen. Ein kostenloses Konto (E-Mail, kein Passwort) ist freiwillig und speichert Ihren Lebenslauf online. Ihr Lebenslauf wird nur an unsere Server gesendet, wenn Sie ihn in Ihrem Konto speichern. Die KI-Funktion und die Werbung sind unten beschrieben.</p>
  <h2>Inhalt Ihres Lebenslaufs</h2>
  <p>Die Angaben, die Sie eintragen (Name, Kontaktdaten, Foto, Werdegang), dienen nur dazu, Ihren Lebenslauf anzuzeigen und zu drucken. Sie verlassen Ihr Gerät nur, wenn Sie den Lebenslauf in Ihrem Konto speichern oder die KI nutzen.</p>
  <h2>Die KI-Funktion</h2>
  <p>Wenn Sie "Mit KI ausfüllen", "Mit KI verbessern", "Lebenslauf anpassen" oder das Anschreiben nutzen, werden der Text oder die Datei (PDF, Foto), die Sie angeben (und bei der Anpassung die Stellenanzeige und die Texte Ihres Lebenslaufs), an unseren Dienst gesendet, der sie an ein KI-Modell von Anthropic weitergibt, um das Ergebnis zu erzeugen. Wir speichern sie nicht, und sie werden keinem Konto zugeordnet. Ihre IP-Adresse dient nur dazu, die Zahl der Nutzungen pro Tag zu begrenzen, und wird für den Tag im Arbeitsspeicher gehalten. Für die Verarbeitung durch Anthropic gilt dessen eigene Datenschutzerklärung. Senden Sie keine Dokumente, die kein Lebenslauf sind (zum Beispiel Ausweisdokumente).</p>
  <h2>Nutzungsstatistik</h2>
  <p>Wir zählen Seitenaufrufe und einige Aktionen (PDF-Download, gewählte Vorlage, KI-Nutzung) anonym. Es wird kein Cookie gesetzt, keine Kennung erzeugt, weder Ihre IP-Adresse noch der Inhalt Ihres Lebenslaufs wird gespeichert, und nichts erlaubt es, Sie von einem Besuch zum nächsten wiederzuerkennen. Gespeichert werden nur Seitenname, Aktion, verweisende Seite und Gerätetyp (Mobil oder Computer). Sendet Ihr Browser ein "Do Not Track"-Signal, zählen wir nichts.</p>
  <h2>Das Konto</h2>
  <p>Ein kostenloses Konto ist freiwillig: es speichert Ihre Lebensläufe online. Wir speichern Ihre E-Mail-Adresse sowie die Lebensläufe und Anschreiben, die Sie speichern möchten, in einer Datenbank bei Supabase (Region Europäische Union, Paris). Sie melden sich über einen per E-Mail gesendeten Link an (E-Mail-Dienst Resend). Ihre gespeicherten Lebensläufe sehen nur Sie. Sie können jeden Lebenslauf oder Ihr gesamtes Konto jederzeit unter "Mein Konto" löschen: die Löschung erfolgt sofort und endgültig. Wir speichern Ihre Daten, solange Ihr Konto besteht.</p>
  <h2>Was auf Ihrem Gerät gespeichert wird</h2>
  <p>Damit Sie zu Ihrem Entwurf zurückkehren können, bleibt eine Kopie im lokalen Speicher Ihres Browsers (localStorage), ebenso Ihre Sitzung, wenn Sie angemeldet sind, und Ihre Wahl zu Werbe-Cookies. Sie können den Entwurf mit "Neu beginnen" löschen oder die Daten der Seite in Ihrem Browser entfernen. Denken Sie an einem gemeinsam genutzten Computer daran.</p>
  <h2>Werbung und Cookies</h2>
  <p>CVLibre ist dank Werbung, ausgespielt von Google AdSense, und freiwilliger Spenden über Ko-fi 100 % kostenlos. Die Zahlung läuft vollständig über Ko-fi (mit PayPal oder Stripe): CVLibre erhält Ihre Bankdaten nie. Beim ersten Besuch fragt ein Banner, ob Sie Werbe-Cookies akzeptieren. Vor Ihrer Wahl werden keine Anzeigen angefordert. Wenn Sie zustimmen, kann Google Cookies nutzen, um personalisierte Anzeigen auszuspielen und zu messen. Wenn Sie ablehnen, zeigt Google nur nicht personalisierte Anzeigen. Ihre Wahl wird 6 Monate in Ihrem Browser gespeichert, und Sie können sie jederzeit über den Link "Cookies" unten auf jeder Seite ändern. Anzeigen erscheinen nie in Ihren PDFs und haben keinen Zugriff auf den Inhalt Ihres Lebenslaufs. Für die Verarbeitung durch Google gilt dessen eigene Datenschutzerklärung.</p>
  <p>Unsere Nutzungsstatistik verwendet keine Cookies. Die Schriften liegen auf unserer Seite. Die anderen Dienste (KI, Supabase, Resend) werden nur aufgerufen, wenn Sie die entsprechende Funktion nutzen.</p>
  <h2>Ihre Rechte</h2>
  <p>Nach der DSGVO können Sie jederzeit Auskunft, Berichtigung oder Löschung Ihrer Daten verlangen: direkt unter "Mein Konto" für Ihre Lebensläufe und Ihr Konto, oder per E-Mail an contact@cvlibre.com. Sie können sich außerdem bei der französischen Datenschutzbehörde CNIL (cnil.fr) oder bei der Datenschutzaufsichtsbehörde Ihres Bundeslandes beschweren.</p>''')

text_page("/de/nutzungsbedingungen/", "Nutzungsbedingungen | CVLibre", "Nutzungsbedingungen von CVLibre, dem kostenlosen Online-Lebenslauf-Generator mit KI.", "Nutzungsbedingungen", '''  <p>Stand: 13. November 2026.</p>
  <h2>Ein 100 % kostenloser Dienst</h2>
  <p>Mit CVLibre erstellen Sie einen Lebenslauf und ein Anschreiben und laden sie kostenlos als PDF herunter, ohne Kreditkarte. Alles steht allen offen: die 33 Vorlagen, die Anpassung (Schriften, Größe, Abstand), PDFs ohne Banner oder Wasserzeichen und die KI-Werkzeuge. Auf der Seite wird nichts verkauft.</p>
  <p>CVLibre wird durch Werbung und freiwillige Spenden seiner Nutzer finanziert (über Ko-fi auf der deutschen Seite). Eine Spende schaltet keine zusätzliche Funktion frei: sie hilft einfach, die Seite zu betreiben.</p>
  <h2>Das kostenlose Konto</h2>
  <p>Ein Konto ist freiwillig. Es speichert bis zu 20 Lebensläufe und 30 Anschreiben online, damit Sie sie auf all Ihren Geräten wiederfinden. Sie können jedes Dokument oder Ihr ganzes Konto jederzeit löschen.</p>
  <h2>Künstliche Intelligenz</h2>
  <p>Die KI hilft Ihnen, einen Lebenslauf auszufüllen, einen Text zu verbessern, einen Lebenslauf an eine Stellenanzeige anzupassen und ein Anschreiben zu verfassen. Jede Nutzung kostet uns wirklich Geld: damit der Dienst kostenlos bleibt, ist er auf 5 Nutzungen pro Tag und Person begrenzt und kann bei hoher Nachfrage vorübergehend nicht verfügbar sein. Die KI kann Fehler machen: lesen und korrigieren Sie das Ergebnis immer. Sie bleiben für das verantwortlich, was Sie versenden.</p>
  <h2>Faire Nutzung</h2>
  <p>Nutzen Sie CVLibre nicht, um irreführende Dokumente oder Dokumente im Namen einer anderen Person ohne deren Zustimmung zu erstellen, oder um der KI Dokumente zu senden, die kein Lebenslauf sind (zum Beispiel Ausweisdokumente). Bei Missbrauch können wir den Zugang einschränken.</p>
  <h2>Haftung</h2>
  <p>CVLibre wird so bereitgestellt, wie es ist. Wir tun unser Bestes, damit alles gut funktioniert, garantieren aber weder den Erfolg einer Bewerbung noch eine ununterbrochene Verfügbarkeit. Bewahren Sie eine Kopie Ihrer Dokumente auf (Datei-Export oder PDF).</p>
  <h2>Kontakt und anwendbares Recht</h2>
  <p>Fragen? Nutzen Sie den Hilfe-Knopf oder schreiben Sie an contact@cvlibre.com. Es gilt französisches Recht, unbeschadet zwingender Verbraucherschutzvorschriften Ihres Wohnsitzlandes. Diese deutsche Fassung dient der Information; maßgeblich ist die französische Fassung. Siehe auch die <a href="/de/datenschutz/">Datenschutzerklärung</a> und das <a href="/de/impressum/">Impressum</a>.</p>''')
