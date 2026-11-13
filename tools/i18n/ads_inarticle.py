"""Bloc AdSense "In-article" (13 nov 2026, slot 8709881953) dans tous les articles de blog des 7 pays,
juste avant le 2e intertitre de l'article. Idempotent : lancé par build_all.sh après chaque nouvel article."""
import os, re, glob
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
SLOT = "8709881953"
AD = ('<div class="ad-in"><ins class="adsbygoogle" style="display:block; text-align:center;" data-ad-layout="in-article" data-ad-format="fluid" '
      'data-ad-client="ca-pub-8638687738606649" data-ad-slot="' + SLOT + '"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>\n')
files = []
for base in ["blog", "en/blog", "us/blog", "ca/blog", "au/blog", "nz/blog", "de/ratgeber"]:
    files += glob.glob(os.path.join(ROOT, base, "*", "index.html"))
n = 0
for f in files:
    s = open(f, encoding="utf-8").read()
    if SLOT in s or "googlesyndication" not in s: continue
    a = s.find('<article class="prose">')
    if a < 0: continue
    h2 = [m.start() for m in re.finditer(r"<h2[ >]", s[a:])]
    if len(h2) < 2: continue
    i = a + h2[1]
    open(f, "w", encoding="utf-8").write(s[:i] + AD + s[i:]); n += 1
print("in-article ajouté dans", n, "articles sur", len(files))
