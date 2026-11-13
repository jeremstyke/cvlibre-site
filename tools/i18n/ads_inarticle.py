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

# Bloc "Display responsive" (slot 6295471606) : fin des articles de blog (avant "À lire aussi") et accueil (avant la FAQ).
RSLOT = "6295471606"
RAD = ('<div class="wrap ad-in"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8638687738606649" data-ad-slot="' + RSLOT + '" '
       'data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>\n')
homes = [os.path.join(ROOT, d, "index.html") for d in ["", "en", "de", "us", "ca", "au", "nz"]]
m = 0
for f in files + homes:
    s = open(f, encoding="utf-8").read()
    if RSLOT in s or "googlesyndication" not in s: continue
    for mark in ['  <section class="wrap rel"', '  <section class="section" id="faq">', '  <section class="section" id="questions">']:
        i = s.find(mark)
        if i >= 0:
            open(f, "w", encoding="utf-8").write(s[:i] + "  " + RAD + s[i:]); m += 1; break
print("responsive ajouté dans", m, "pages")

# Bloc "In-feed" (slot 6195574268) : dans la grille des pages d'accueil des blogs, après la 3e carte (et après la 12e s'il y en a au moins 18).
FSLOT = "6195574268"
FAD = ('<div class="ad-in b-ad"><ins class="adsbygoogle" style="display:block" data-ad-format="fluid" data-ad-layout-key="-5n+c2-23-51+w1" '
       'data-ad-client="ca-pub-8638687738606649" data-ad-slot="' + FSLOT + '"></ins><script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>\n')
k = 0
for d in ["blog", "en/blog", "de/ratgeber", "us/blog", "ca/blog", "au/blog", "nz/blog"]:
    f = os.path.join(ROOT, d, "index.html")
    s = open(f, encoding="utf-8").read()
    if FSLOT in s or "googlesyndication" not in s: continue
    g = s.find('<div class="b-grid">')
    if g < 0: continue
    ends = [g + m.end() for m in re.finditer(r"</a>\n", s[g:])]
    spots = [ends[2]] if len(ends) > 3 else []
    if len(ends) >= 18: spots.append(ends[11])
    for i in reversed(spots): s = s[:i] + "    " + FAD + s[i:]
    if spots: open(f, "w", encoding="utf-8").write(s); k += 1
print("in-feed ajouté dans", k, "pages de blog")
