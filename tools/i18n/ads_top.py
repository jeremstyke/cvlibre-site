"""13 nov 2026 (Jeremy) : bannière AdSense bien visible en haut de toutes les pages où c'est possible, dans les 7 pays.
Accueils et pages d'accueil des blogs : juste sous le grand bandeau du haut. Articles : sous l'en-tête de l'article.
Offres d'emploi, courriers et soutien : sous le titre et le chapeau. Pas sur les pages légales ni les outils sans pub.
Les lettres types ont la leur (ads_letters.py). Idempotent, lancé par build_all.sh."""
import os, re, glob
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
SLOT = "6295471606"
# 14 nov 2026 (Jeremy): small fixed banner instead of the big responsive square (320x50 on mobile, 468x60 on tablet, 728x90 on computer)
STYLE = ('<style>.ad-top{text-align:center}.ad-top .cvl-top{display:inline-block;width:320px;height:50px}'
         '@media(min-width:520px){.ad-top .cvl-top{width:468px;height:60px}}@media(min-width:800px){.ad-top .cvl-top{width:728px;height:90px}}</style>')
INS = ('<ins class="adsbygoogle cvl-top" data-ad-client="ca-pub-8638687738606649" data-ad-slot="' + SLOT + '"></ins>')
OLD = ('<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-8638687738606649" '
       'data-ad-slot="' + SLOT + '" data-ad-format="horizontal" data-full-width-responsive="true"></ins>')
def ad(wrap):
    return ('<div class="' + ('wrap ' if wrap else '') + 'ad-in ad-top">' + STYLE + INS + '<script>(adsbygoogle = window.adsbygoogle || []).push({});</script></div>\n')
CC = ["", "en", "de", "us", "ca", "au", "nz"]
J = lambda *p: os.path.join(ROOT, *[x for x in p if x], "index.html")
hero = [J(c) for c in CC] + [J("blog")] + [J(c, "blog") for c in ["en", "us", "ca", "au", "nz"]] + [J("de", "ratgeber")]
simple = [J("offres-emploi"), J("courriers"), J("soutenir"), J("de", "jobs"), J("de", "briefe"), J("de", "unterstuetzen")]
simple += [J(c, s) for c in ["en", "us", "ca", "au", "nz"] for s in ["jobs", "letters", "support"]]
arts = []
for b in ["blog", "en/blog", "us/blog", "ca/blog", "au/blog", "nz/blog", "de/ratgeber"]:
    arts += glob.glob(os.path.join(ROOT, b, "*", "index.html"))
n = 0
def put(f, kind):
    global n
    if not os.path.exists(f): print("absent", f); return
    s = open(f, encoding="utf-8").read()
    if OLD in s:  # pages built before the small banner
        s = s.replace(OLD, STYLE + INS); open(f, "w", encoding="utf-8").write(s); n += 1; return
    if 'ad-in ad-top' in s or "adsbygoogle.js" not in s: return
    h = s.find("</h1>")
    if h < 0: return
    if kind == "hero":
        m = re.compile(r"</section>\n").search(s, h); i = m.end() if m else -1; w = True
    elif kind == "art":
        i = s.find("</header>\n", h); i = i + 10 if i >= 0 else -1; w = True
    else:
        i = s.find("</p>\n", h); i = i + 5 if i >= 0 else -1; w = False
    if i < 0: print("pas de place", f); return
    s = s[:i] + "  " + ad(w) + s[i:]
    open(f, "w", encoding="utf-8").write(s); n += 1
for f in hero: put(f, "hero")
for f in simple: put(f, "simple")
for f in arts: put(f, "art")
print("bannière du haut :", n, "pages")
# small banner everywhere the big top banner exists (letter pages included, written by ads_letters.py)
m = 0
for d, dirs, files in os.walk(ROOT):
    dirs[:] = [x for x in dirs if not x.startswith(".") and x not in ("tools", "node_modules", "content")]
    for fn in files:
        if not fn.endswith(".html"): continue
        f = os.path.join(d, fn); s = open(f, encoding="utf-8").read()
        if OLD in s: open(f, "w", encoding="utf-8").write(s.replace(OLD, STYLE + INS)); m += 1
print("petite bannière (autres pages) :", m)
