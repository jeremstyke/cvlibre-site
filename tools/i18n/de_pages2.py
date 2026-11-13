"""Pages allemandes, partie 2 : Mein Konto, Arbeitgeber, Jobs, Briefe. Lancer : python3 tools/i18n/de_pages2.py (relance aussi de_pages.py)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from de_pages import head, HEADER, FOOTER, acc_dlg, write, V

SB = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>\n<script src="/assets/pass.js?v=20261113b"></script>\n<script src="/assets/de/auth.js?v=' + V + '"></script>\n'
LETTER_CSS = '<link rel="stylesheet" href="/assets/letter.css?v=20261113b">\n'
MODE = lambda cur: '  <nav class="mode-sw" hidden aria-label="Bereich wählen"><a href="/de/mein-konto/"%s>👤 Bewerber</a><a href="/de/arbeitgeber/"%s>🏢 Arbeitgeber</a></nav>\n' % ((' aria-current="page"', '') if cur == "c" else ('', ' aria-current="page"'))
DLG = acc_dlg("Behalten Sie Ihre Dokumente und finden Sie sie auf all Ihren Geräten", False)

# ---------------- Mein Konto ----------------
write("/de/mein-konto/", head("Mein Konto | CVLibre", "Ihre gespeicherten Lebensläufe und Anschreiben auf CVLibre.", "/de/mein-konto/", extra=LETTER_CSS, robots="noindex, follow") + "<body>\n" + HEADER + '''
<main id="main" class="wrap sp">
''' + MODE("c") + '''  <h1>Mein Konto</h1>
  <p class="lead" id="sp-who">Wird geladen...</p>
  <div id="sp-out" hidden>
    <p>Melden Sie sich an, um Ihre Lebensläufe und Anschreiben zu finden.</p>
    <p><button type="button" class="btn" id="sp-login">Anmelden</button></p>
  </div>
  <div id="sp-in" hidden>
    <section class="lt-card sp-sec" id="sp-offer">
      <div class="sp-head"><h2>CVLibre ist kostenlos</h2><a class="btn btn-sm" href="/de/mein-konto/?pass=1" data-pass>CVLibre Pass</a></div>
      <p class="hint">Alles ist offen: 33 Vorlagen, Anpassung, PDFs ohne Wasserzeichen, Anschreiben mit KI 1 Lebenslauf und 30 Anschreiben online. Die Seite wird durch Werbung und den freiwilligen CVLibre Pass finanziert: ohne Werbung, 50 KI-Nutzungen pro Tag und 20 gespeicherte Lebensläufe.</p>
    </section>
    <section class="lt-card sp-sec">
      <div class="sp-head"><h2>Meine Lebensläufe</h2><a class="btn btn-sm" href="/de/lebenslauf-erstellen/">Lebenslauf erstellen</a></div>
      <div class="sp-list" id="sp-cvs"></div>
    </section>
    <section class="lt-card sp-sec">
      <div class="sp-head"><h2>Meine Anschreiben</h2><a class="btn btn-sm" href="/de/anschreiben/">Anschreiben verfassen</a></div>
      <div class="sp-list" id="sp-letters"></div>
    </section>
    <section class="lt-card sp-sec">
      <div class="sp-head"><h2>Mein Konto</h2><button type="button" class="btn btn-ghost btn-sm" id="sp-out-btn">Abmelden</button></div>
      <p class="hint">Wenn Sie Ihr Konto löschen, werden Ihre gespeicherten Lebensläufe und Anschreiben endgültig gelöscht. Das lässt sich nicht rückgängig machen. Fragen? <a href="mailto:contact@cvlibre.com">contact@cvlibre.com</a>.</p>
      <p><button type="button" class="btn btn-ghost btn-sm" id="sp-del">Mein Konto löschen</button></p>
      <p class="hint" id="sp-del-msg" role="status" aria-live="polite" hidden></p>
    </section>
  </div>
</main>
''' + FOOTER + "\n" + DLG + "\n" + SB + '<script src="/assets/de/space.js?v=' + V + '"></script>\n</body>\n</html>\n')

# ---------------- Arbeitgeber ----------------
CONTRACTS = "".join("<option>%s</option>" % c for c in ["Unbefristet", "Befristet", "Zeitarbeit", "Saisonarbeit", "Ausbildung", "Praktikum", "Minijob", "Freiberuflich"])
write("/de/arbeitgeber/", head("Stellenanzeige kostenlos veröffentlichen | CVLibre", "Stellenanzeigen kostenlos veröffentlichen: jede Stelle wird vor der Freischaltung geprüft und bleibt 60 Tage online. Bewerber melden sich direkt bei Ihnen.", "/de/arbeitgeber/", extra=LETTER_CSS) + "<body>\n" + HEADER + '''
<main id="main" class="wrap sp rc">
''' + MODE("r") + '''  <h1>Arbeitgeber: Stellen kostenlos veröffentlichen</h1>
  <p class="lead">Ihre Stellen erscheinen oben in den Suchergebnissen von CVLibre, vor Bewerbern, die gerade ihren Lebenslauf und ihr Anschreiben vorbereiten. Jeder Bewerber kann seinen Lebenslauf mit einem Klick an Ihre Anzeige anpassen.</p>
  <ul class="rc-perks">
    <li><strong>Kostenlos</strong>: keine Gebühr, 60 Tage online.</li>
    <li><strong>Geprüft</strong>: jede Stelle wird vor der Freischaltung von CVLibre geprüft, zum Schutz der Bewerber.</li>
    <li><strong>Einfach</strong>: Bewerber melden sich direkt bei Ihnen, über Ihren Link oder Ihre E-Mail-Adresse.</li>
  </ul>
  <div id="rc-out" hidden>
    <p>Melden Sie sich an, um eine Stelle zu veröffentlichen. Ohne Passwort: ein Anmeldelink kommt per E-Mail.</p>
    <p><button type="button" class="btn" id="rc-login">Anmelden oder Konto erstellen</button></p>
  </div>
  <div id="rc-in" hidden>
    <p class="hint" id="rc-who"></p>
    <section class="lt-card sp-sec">
      <h2 id="rc-form-title">Stelle veröffentlichen</h2>
      <form id="rc-form" novalidate>
        <div class="rc-grid">
          <div class="fld"><label for="rc-company">Unternehmen *</label><input id="rc-company" maxlength="120" required autocomplete="organization"></div>
          <div class="fld" hidden><label for="rc-siret">Handelsregisternummer</label><input id="rc-siret" maxlength="17"></div>
          <div class="fld"><label for="rc-title">Position *</label><input id="rc-title" maxlength="120" required placeholder="Z. B. Verkäufer/in Bäckerei (m/w/d)"></div>
          <div class="fld"><label for="rc-city">Ort *</label><input id="rc-city" maxlength="80" required placeholder="Z. B. Leipzig" autocomplete="address-level2"></div>
          <div class="fld"><label for="rc-contract">Vertragsart *</label><select id="rc-contract">''' + CONTRACTS + '''</select></div>
          <div class="fld"><label for="rc-hours">Arbeitszeit</label><input id="rc-hours" maxlength="60" placeholder="Z. B. Vollzeit 40 Std., Teilzeit 20 Std."></div>
          <div class="fld"><label for="rc-salary">Gehalt</label><input id="rc-salary" maxlength="80" placeholder="Z. B. 36.000 € pro Jahr oder 14 € pro Stunde"></div>
          <div class="fld"><label for="rc-contact">Ansprechpartner</label><input id="rc-contact" maxlength="80" autocomplete="name"></div>
        </div>
        <div class="fld"><label for="rc-desc">Stellenbeschreibung * (Aufgaben, Anforderungen, Vorteile)</label><textarea id="rc-desc" rows="9" maxlength="6000" required></textarea></div>
        <div class="rc-grid">
          <div class="fld"><label for="rc-url">Link zur Bewerbung</label><input id="rc-url" type="url" maxlength="400" placeholder="https://..."></div>
          <div class="fld"><label for="rc-email">oder E-Mail für Bewerbungen</label><input id="rc-email" type="email" maxlength="160" autocomplete="email"></div>
        </div>
        <label class="rc-ok"><input type="checkbox" id="rc-legal"><span>Ich bestätige, dass diese Stelle echt und offen ist, dass die Anzeige dem Gesetz entspricht (keine Diskriminierung nach dem AGG, keine Kosten für Bewerber) und akzeptiere die <a href="/de/nutzungsbedingungen/" target="_blank">Nutzungsbedingungen</a>.</span></label>
        <p><button type="submit" class="btn" id="rc-send">Zur Prüfung senden</button> <button type="button" class="link-btn" id="rc-cancel" hidden>Bearbeitung abbrechen</button></p>
        <p class="hint" id="rc-msg" role="status" aria-live="polite"></p>
      </form>
    </section>
    <section class="lt-card sp-sec">
      <h2>Meine Stellen</h2>
      <div class="sp-list" id="rc-list"></div>
    </section>
  </div>
  <p class="hint">Fragen? <a href="mailto:contact@cvlibre.com">contact@cvlibre.com</a>. CVLibre kann irreführende, rechtswidrige oder diskriminierende Stellen ablehnen oder entfernen.</p>
</main>
''' + FOOTER + "\n" + DLG + "\n" + SB + '<script src="/assets/de/recruteurs.js?v=' + V + '"></script>\n</body>\n</html>\n')

# ---------------- Jobs ----------------
write("/de/jobs/", head("Jobs in Ihrer Nähe: suchen und Lebenslauf anpassen | CVLibre", "Durchsuchen Sie Tausende Stellen in Deutschland nach Position und Ort. Für jede Stelle passen Sie Ihren Lebenslauf an und schreiben Ihr Anschreiben mit kostenloser KI.", "/de/jobs/", extra=LETTER_CSS + '<link rel="stylesheet" href="/assets/offres.css?v=20261113c">\n') + "<body>\n" + HEADER + '''
<main id="main" class="wrap jb">
  <h1>Jobs in Ihrer Nähe</h1>
  <p class="lead">Suchen Sie nach Position und Ort. Für jede Stelle hilft CVLibre Ihnen kostenlos, Ihren Lebenslauf anzupassen und Ihr Anschreiben zu schreiben.</p>
  <a class="jb-rcb" href="/de/arbeitgeber/"><span class="jb-rcb-i" aria-hidden="true">📣</span><span class="jb-rcb-t"><strong>Sie stellen ein?</strong> Veröffentlichen Sie Ihre Stelle kostenlos, sie erscheint oben in den Ergebnissen.</span><span class="jb-rcb-go">Stelle veröffentlichen</span></a>
  <form class="jb-form lt-card" id="jb-form" role="search">
    <div class="fld"><label for="jb-q">Position oder Stichwort</label><input id="jb-q" maxlength="80" placeholder="Z. B. Verkäufer, Pflegekraft, Staplerfahrer" autocomplete="off" enterkeyhint="search"></div>
    <div class="fld"><label for="jb-ville">Ort oder PLZ</label><input id="jb-ville" maxlength="60" placeholder="Z. B. München" autocomplete="address-level2"></div>
    <div class="fld"><label for="jb-contrat">Vertragsart</label><select id="jb-contrat"><option value="">Alle</option><option value="CDI">Unbefristet</option><option value="CDD">Befristet</option><option value="MIS">Zeitarbeit</option><option value="SAI">Saisonarbeit</option><option value="ALT">Ausbildung</option></select></div>
    <button type="submit" class="btn" id="jb-go">Jobs finden</button>
  </form>
  <p class="jb-count" id="jb-count" hidden></p>
  <p class="hint" id="jb-msg" role="status" aria-live="polite"></p>
  <div class="jb-list" id="jb-list"></div>
  <p><button type="button" class="btn btn-ghost" id="jb-more" hidden>Weitere Jobs anzeigen</button></p>
  <p class="jb-src">Stellen bereitgestellt von <a href="https://www.careerjet.de/" target="_blank" rel="noopener">Careerjet</a>, einer Jobsuchmaschine. Das Veröffentlichungsdatum steht bei jeder Stelle. CVLibre ist nicht der Arbeitgeber und erhält keine Bewerbungen: Sie bewerben sich direkt auf der Seite der Stelle.</p>
  <p class="jb-rc">Sie stellen ein? <a href="/de/arbeitgeber/">Veröffentlichen Sie Ihre Stelle kostenlos</a>: sie erscheint oben in den Ergebnissen.</p>
  <section class="jb-how">
    <h2>Schneller bewerben mit CVLibre</h2>
    <p><strong>Lebenslauf anpassen</strong> öffnet Ihren Lebenslauf mit der bereits eingefügten Stellenanzeige: die KI formuliert Titel, Profil und Aufgaben mit den Worten der Anzeige um und zeigt fehlende Kenntnisse. Sie entscheiden, was Sie übernehmen.</p>
    <p><strong>Anschreiben</strong> bereitet ein Schreiben für diese Stelle und dieses Unternehmen vor, aus der Anzeige und Ihrem Werdegang.</p>
    <p>Noch kein Lebenslauf? <a href="/de/lebenslauf-erstellen/">Erstellen Sie ihn kostenlos</a> in wenigen Minuten.</p>
  </section>
</main>
''' + FOOTER + '<script src="/assets/de/offres.js?v=' + V + '"></script>\n</body>\n</html>\n')

# ---------------- Briefe ----------------
LETTERS = [
    ("/de/kuendigungsschreiben/", "resignation", "1", "Kündigungsschreiben Vorlage: kostenlos, mit KI | CVLibre",
     "Kündigungsschreiben als Arbeitnehmer in 2 Minuten: kostenlose Vorlage oder KI, Kündigungsfrist, Bitte um Arbeitszeugnis und PDF zum Ausdrucken. Ohne Anmeldung.",
     "Kündigungsschreiben: kostenlose Vorlage mit KI", "Geben Sie Ihre Position und Ihr Unternehmen ein: die KI schreibt ein klares, höfliches Kündigungsschreiben, oder Sie nutzen unsere kostenlose Vorlage. Danach ausdrucken und von Hand unterschreiben.", "Ihre Situation", True,
     '''    <h2>Wichtig: die Kündigung muss auf Papier und handschriftlich unterschrieben sein</h2>
    <p>In Deutschland muss eine Kündigung des Arbeitsverhältnisses schriftlich erfolgen, auf Papier und mit Ihrer eigenhändigen Unterschrift (§ 623 BGB). Eine Kündigung per E-Mail, SMS, Fax oder WhatsApp ist unwirksam. Laden Sie Ihr Schreiben deshalb als PDF herunter, drucken Sie es aus, unterschreiben Sie es und übergeben Sie es persönlich (am besten gegen Empfangsbestätigung) oder per Einwurf-Einschreiben.</p>
    <h2>Was gehört in ein Kündigungsschreiben?</h2>
    <ul><li>Ihr Name und Ihre Adresse, Name und Adresse des Arbeitgebers.</li><li>Ort und Datum.</li><li>Ein klarer Satz, dass Sie Ihr Arbeitsverhältnis kündigen, mit dem Beendigungsdatum und dem Zusatz "hilfsweise zum nächstmöglichen Zeitpunkt".</li><li>Die Bitte um eine schriftliche Bestätigung und um ein qualifiziertes Arbeitszeugnis.</li><li>Ihre handschriftliche Unterschrift.</li></ul>
    <p>Einen Grund müssen Sie nicht nennen. Bleiben Sie kurz, sachlich und freundlich.</p>
    <h2>Welche Kündigungsfrist gilt?</h2>
    <p>Schauen Sie zuerst in Ihren Arbeitsvertrag oder Tarifvertrag. Ohne besondere Regelung beträgt die gesetzliche Kündigungsfrist für Arbeitnehmer 4 Wochen zum 15. oder zum Ende eines Kalendermonats (§ 622 BGB). In einer vereinbarten Probezeit (höchstens 6 Monate) sind es 2 Wochen. Maßgeblich ist der Tag, an dem die Kündigung beim Arbeitgeber eingeht.</p>
    <h2>Häufige Fragen</h2>
    <h3>Muss ich einen Grund angeben?</h3><p>Nein. Ein einfaches, höfliches Schreiben genügt.</p>
    <h3>Was ist mit dem Arbeitslosengeld?</h3><p>Wer selbst kündigt, ohne einen neuen Job zu haben, riskiert in der Regel eine Sperrzeit beim Arbeitslosengeld. Melden Sie sich außerdem rechtzeitig bei der Agentur für Arbeit arbeitsuchend.</p>
    <h3>Habe ich Anspruch auf ein Arbeitszeugnis?</h3><p>Ja, beim Ausscheiden haben Sie Anspruch auf ein schriftliches Arbeitszeugnis. Bitten Sie direkt im Kündigungsschreiben um ein qualifiziertes Zeugnis.</p>
    <p class="ct-legal">Diese Informationen sind allgemein und keine Rechtsberatung. Prüfen Sie Ihren Vertrag oder wenden Sie sich an eine Beratungsstelle, Ihre Gewerkschaft oder eine Fachanwältin bzw. einen Fachanwalt für Arbeitsrecht.</p>''',
     [("Kann ich per E-Mail kündigen?", "Nein. In Deutschland muss die Kündigung auf Papier erfolgen und eigenhändig unterschrieben sein (§ 623 BGB). E-Mail, SMS, Fax oder WhatsApp sind unwirksam."), ("Welche Kündigungsfrist gilt für Arbeitnehmer?", "Ohne andere Regelung im Vertrag 4 Wochen zum 15. oder zum Monatsende (§ 622 BGB), in der Probezeit 2 Wochen.")]),
    ("/de/nachfassen-nach-vorstellungsgespraech/", "followup", "0", "Dankes-E-Mail nach dem Vorstellungsgespräch: Vorlage mit KI | CVLibre",
     "Schreiben Sie eine kurze, höfliche E-Mail nach Ihrem Vorstellungsgespräch: kostenlose Vorlage oder KI, bereit zum Kopieren oder für Ihr E-Mail-Programm.",
     "Nachfassen nach dem Vorstellungsgespräch", "Geben Sie Stelle und Unternehmen ein: die KI schreibt eine kurze Dankes-E-Mail für nach Ihrem Gespräch, oder Sie nutzen unsere kostenlose Vorlage.", "Ihr Gespräch", False,
     '''    <h2>Wann sollte ich nachfassen?</h2>
    <p>Eine kurze Dankes-E-Mail können Sie innerhalb von 24 Stunden nach dem Gespräch senden. Haben Sie nach dem genannten Termin nichts gehört, ist eine höfliche Nachfrage etwa eine Woche später in Ordnung.</p>
    <h2>Was schreibe ich?</h2>
    <ul><li>Bedanken Sie sich für das Gespräch, mit dem Datum.</li><li>Nennen Sie einen Punkt aus dem Gespräch, der Ihr Interesse bestärkt.</li><li>Fragen Sie höflich nach den nächsten Schritten.</li></ul>
    <p>Bleiben Sie bei wenigen Zeilen. Ziel ist ein guter Eindruck, nicht die Wiederholung Ihrer ganzen Bewerbung.</p>''',
     [("Wann sende ich eine Dankes-E-Mail nach dem Vorstellungsgespräch?", "Innerhalb von 24 Stunden. Ohne Antwort nach dem genannten Termin fassen Sie etwa eine Woche später höflich nach.")]),
    ("/de/bewerbung-per-email/", "application", "0", "Bewerbung per E-Mail: Vorlage und Muster mit KI | CVLibre",
     "Schreiben Sie die E-Mail zu Ihrer Bewerbung: kostenlose Vorlage oder KI, mit dem richtigen Betreff. Bereit zum Kopieren oder für Ihr E-Mail-Programm.",
     "Bewerbung per E-Mail", "Geben Sie Stelle, Unternehmen und Ihre Stärken ein: die KI schreibt eine kurze E-Mail zu Ihrem Lebenslauf und Anschreiben, oder Sie nutzen unsere kostenlose Vorlage.", "Ihre Bewerbung", False,
     '''    <h2>So schreiben Sie eine Bewerbungs-E-Mail</h2>
    <ul><li>Ein klarer Betreff: "Bewerbung als [Position] - [Ihr Name]", mit Referenznummer, falls vorhanden.</li><li>Ein Satz, auf welche Stelle Sie sich bewerben und wo Sie sie gesehen haben.</li><li>Zwei oder drei Stärken, die zur Stelle passen.</li><li>Ein Hinweis auf Lebenslauf und Anschreiben im Anhang.</li></ul>
    <p>Senden Sie Ihre Unterlagen als PDF, am besten in einer Datei mit klarem Namen, zum Beispiel <strong>Bewerbung_Vorname_Nachname.pdf</strong>, und achten Sie auf eine Gesamtgröße unter 5 MB.</p>''',
     [("Welcher Betreff gehört in eine Bewerbungs-E-Mail?", "Klar und vollständig: \"Bewerbung als [Position] - [Ihr Name]\", mit Referenznummer, falls vorhanden.")]),
]
LINKS = '''  <section class="ct-more"><h2>Weitere Briefe</h2><ul class="ct-links">
    <li><a href="/de/kuendigungsschreiben/">Kündigungsschreiben</a></li>
    <li><a href="/de/nachfassen-nach-vorstellungsgespraech/">Nachfassen nach dem Vorstellungsgespräch</a></li>
    <li><a href="/de/bewerbung-per-email/">Bewerbung per E-Mail</a></li>
    <li><a href="/de/anschreiben/">Anschreiben</a></li>
  </ul></section>
'''
for path, typ, letter, title, desc, h1, lead, sec, is_letter, guide, faq in LETTERS:
    ld = {"@context": "https://schema.org", "@graph": [{"@type": "WebApplication", "name": "CVLibre: " + h1, "description": desc, "url": "https://cvlibre.com" + path, "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "inLanguage": "de-DE", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "EUR"}},
          {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}]}
    actions = '<button type="button" class="btn" id="ct-print">PDF herunterladen</button><button type="button" class="btn btn-ghost" id="ct-copy">Text kopieren</button>' if is_letter else '<button type="button" class="btn" id="ct-copy">Text kopieren</button><button type="button" class="btn btn-ghost" id="ct-mail">In meinem E-Mail-Programm öffnen</button>'
    who = '''        <div class="fld"><label for="ct-name">Vor- und Nachname</label><input id="ct-name" maxlength="80" autocomplete="name"></div>
        <div class="fld"><label for="ct-contact">Ihre Adresse und Kontaktdaten</label><textarea id="ct-contact" rows="3" maxlength="300" placeholder="Straße und Hausnummer&#10;PLZ Ort&#10;Telefon"></textarea></div>
        <div class="fld"><label for="ct-rcpt">Empfänger</label><textarea id="ct-rcpt" rows="3" maxlength="300" placeholder="Unternehmen&#10;z. Hd. Name&#10;Adresse"></textarea></div>
''' if is_letter else '''        <div class="fld"><label for="ct-name">Vor- und Nachname (für die Signatur)</label><input id="ct-name" maxlength="80" autocomplete="name"></div>
'''
    prev = '    <div class="lt-prev"><div class="lt-box" id="lt-box"><div class="lt-sheet" id="lt-sheet" aria-label="Vorschau des Schreibens"></div></div></div>\n' if is_letter else ''
    write(path, head(title, desc, path, extra=LETTER_CSS + '<style>@media print { .sup, .cty { display: none !important; } }</style>\n', ld=ld) + "<body>\n" + HEADER + f'''
<main id="main" class="wrap lt ct{'' if is_letter else ' ct-mail'}" data-type="{typ}" data-letter="{letter}">
  <nav class="crumbs" aria-label="Brotkrumen"><a href="/de/">Startseite</a> / <a href="/de/briefe/">Briefe</a></nav>
  <h1>{h1}</h1>
  <p class="lead lt-lead">{lead}</p>
  <div class="ai-budget" aria-live="polite"></div>
  <div class="lt-grid">
    <div class="lt-form">
      <section class="lt-card">
        <h2>{sec}</h2>
        <div id="ct-fields"></div>
        <button type="button" class="btn acc-big" id="ct-gen">Mit KI schreiben</button>
        <button type="button" class="link-btn" id="ct-model">Kostenlose Vorlage nutzen (ohne KI)</button>
        <p class="hint" id="ct-msg" role="status" aria-live="polite">Kostenlos, ohne Anmeldung: 5 KI-Nutzungen pro Tag. Die Vorlage ohne KI ist unbegrenzt. Lesen Sie den Text immer vor dem Versenden.</p>
      </section>
      <section class="lt-card">
        <h2>{'Sie und der Empfänger' if is_letter else 'Sie'}</h2>
{who}      </section>
      <section class="lt-card" id="ct-result" hidden>
        <h2>{'Ihr Schreiben' if is_letter else 'Ihre E-Mail'}</h2>
        <div class="fld"><label for="ct-subject">{'Betreff' if is_letter else 'Betreff der E-Mail'}</label><input id="ct-subject" maxlength="150"></div>
        <div class="fld"><label for="ct-body">Text</label><textarea id="ct-body" rows="14" maxlength="4000"></textarea></div>
        <div class="lt-actions">{actions}</div>
      </section>
    </div>
{prev}  </div>
  <article class="ct-guide prose-s">
{guide}
  </article>
{LINKS}</main>
''' + FOOTER + '<script src="/assets/de/letters.js?v=' + V + '" defer></script>\n<script src="/assets/de/aibar.js?v=' + V + '" defer></script>\n</body>\n</html>\n')

write("/de/briefe/", head("Bewerbungs-E-Mails und Briefe kostenlos mit KI | CVLibre", "Kostenlose Vorlagen mit KI: Anschreiben, Kündigungsschreiben, Nachfassen nach dem Vorstellungsgespräch und Bewerbung per E-Mail.", "/de/briefe/", extra=LETTER_CSS) + "<body>\n" + HEADER + '''
<main id="main" class="wrap lt">
  <h1>Briefe und E-Mails rund um die Bewerbung, kostenlos mit KI</h1>
  <p class="lead lt-lead">Alle Schreiben und E-Mails, die Sie bei der Jobsuche brauchen, in Sekunden mit KI oder mit unseren kostenlosen Vorlagen. Ohne Anmeldung.</p>
''' + LINKS.replace("Weitere Briefe", "Schreiben wählen") + '''</main>
''' + FOOTER + "</body>\n</html>\n")
