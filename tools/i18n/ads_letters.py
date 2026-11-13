"""13 nov 2026 (Jeremy) : un bloc AdSense "Display responsive" (slot 6295471606) sur les pages de lettres types
(démission, relance après entretien, mail de candidature) des 7 pays, dans le guide sous le formulaire, juste avant
les questions fréquentes. Remet aussi le script AdSense sur ces pages. Idempotent, lancé par build_all.sh."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from alt import ALT, ANGLO, anglo_path
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
MARK = "<!-- Pas de pub AdSense sur cette page (outil de travail) : tools/i18n/ads_pages.py -->"
TAG = ('<script>(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1</script><script async src="https://pagead2.googlesyndication.com/'
       'pagead/js/adsbygoogle.js?client=ca-pub-8638687738606649" crossorigin="anonymous"></script>')
SLOT = "6295471606"
AD = ('<div class="ad-in"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8638687738606649" data-ad-slot="' + SLOT + '" '
      'data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>\n    ')
TOP = ('  <div class="ad-in ad-top"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8638687738606649" data-ad-slot="' + SLOT + '" '
       'data-ad-format="horizontal" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>\n')
pages = set()
for r in ALT:
    if r[0] in ("/lettre-de-demission/", "/relance-apres-entretien/", "/mail-de-candidature/"):
        pages.update([r[0], r[1], r[2]] + [anglo_path(r[1], cc) for cc in ANGLO])
n = 0
for p in sorted(pages):
    f = os.path.join(ROOT, p.strip("/"), "index.html")
    if not os.path.exists(f): print("absent", p); continue
    s = o = open(f, encoding="utf-8").read()
    s = s.replace(MARK, TAG)
    if SLOT not in s:
        a = s.find('<article class="ct-guide')
        e = s.find("</article>", a)
        i = s.rfind("<h2>", a, e) if a >= 0 else -1
        if i > a: s = s[:i] + AD + s[i:]
        else: print("pas de guide", p)
    # 13 nov 2026 (Jeremy) : bannière bien visible en haut, sous le titre, avant le formulaire
    if 'class="ad-in ad-top"' not in s:
        g = s.find('  <div class="lt-grid">')
        if g >= 0: s = s[:g] + TOP + s[g:]
    if s != o: open(f, "w", encoding="utf-8").write(s); n += 1
print("pub lettres types :", n, "pages sur", len(pages))
