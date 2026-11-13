"""Google AdSense (13 nov 2026, Jeremy) : annonces automatiques = ancrages latéraux (side rails) + vignettes (interstitiels),
bannières manuelles plus tard. Pas de pub sur les pages où l'on travaille sur un document (créateurs, lettres, compte,
recruteurs, stats) : on y retire le script AdSense, dans les 7 pays. Lancé par build_all.sh."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from alt import ALT, ANGLO, anglo_path
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
TOOLS = ["/creer-un-cv/", "/lettre-de-motivation/", "/lettre-de-demission/", "/relance-apres-entretien/", "/mail-de-candidature/", "/mon-espace/", "/recruteurs/"]
NOADS = {"/stats/", "/rupture-conventionnelle/"}
for r in ALT:
    if r[0] in TOOLS:
        NOADS.update([r[0], r[1], r[2]] + [anglo_path(r[1], cc) for cc in ANGLO])
TAG = re.compile(r'<script>\(window\.adsbygoogle=window\.adsbygoogle\|\|\[\]\)\.pauseAdRequests=1</script><script async src="https://pagead2\.googlesyndication\.com/pagead/js/adsbygoogle\.js\?client=ca-pub-\d+" crossorigin="anonymous"></script>')
n = 0
for p in sorted(NOADS):
    f = os.path.join(ROOT, p.strip("/"), "index.html")
    if not os.path.exists(f): continue
    s = open(f, encoding="utf-8").read()
    s2 = TAG.sub("<!-- Pas de pub AdSense sur cette page (outil de travail) : tools/i18n/ads_pages.py -->", s)
    if s2 != s: open(f, "w", encoding="utf-8").write(s2); n += 1
print("pub retirée sur", n, "pages,", len(NOADS), "pages outils")
