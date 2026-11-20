"""Corrections SEO de l'audit du 20 nov 2026 (demandées par Jeremy). Lancé par build_all.sh après fr_alt.py et avant sitemap.py.
Idempotent : peut tourner à chaque build.
1. CA, AU, NZ : les pages outils, quasi identiques aux versions UK et US, passent en noindex (accueil, blog sauf
   les articles ATS copiés, et modèles Word restent visibles). Les liens hreflang qui pointaient vers ces pages sont retirés partout.
2. Pages utilitaires sans intérêt pour la recherche (recruteurs, publicité) en noindex.
3. Titres de plus de 65 caractères : on retire « | CVLibre », puis on raccourcit les rares titres encore trop longs.
4. Guides ajoutés sous les pages outils trop maigres (FR, UK, US, DE) : seo_guides.py."""
import os, re, sys, html
sys.path.insert(0, os.path.dirname(__file__))
from seo_guides import GUIDES
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

def files():
    for dp, dn, fn in os.walk(ROOT):
        if "/.git" in dp or "/tools" in dp or "/srv" in dp or "/assets" in dp: continue
        if "index.html" in fn: yield os.path.join(dp, "index.html")

def url_of(p):
    u = "/" + os.path.relpath(os.path.dirname(p), ROOT).replace(os.sep, "/") + "/"
    return "/" if u == "/./" else u

def set_noindex(s):
    if re.search(r'<meta name="robots" content="noindex', s): return s
    if '<meta name="robots"' in s: return re.sub(r'<meta name="robots" content="[^"]*">', '<meta name="robots" content="noindex, follow">', s, count=1)
    return s.replace("</title>", '</title>\n<meta name="robots" content="noindex, follow">', 1)

KEEP = re.compile(r"^/(ca|au|nz)/(blog/(?!ats-).*|[a-z-]*template-word/)?$")  # articles ATS : copies à 89 % des versions UK/US
UTIL = {"/recruteurs/", "/publicite/", "/de/arbeitgeber/", "/de/werbung/"} | {f"/{c}/{p}/" for c in ("en", "us", "ca", "au", "nz") for p in ("recruiters", "advertise")}
SHORT = {  # titres encore trop longs sans « | CVLibre »
    "/blog/cv-agent-de-securite/": "CV agent de sécurité : exemple, carte CNAPS et diplômes",
    "/de/ratgeber/": "Bewerbungsratgeber: Lebenslauf, Anschreiben, Vorstellungsgespräch",
    "/blog/meilleurs-livres-entretien-embauche/": "Les meilleurs livres pour préparer un entretien d'embauche",
    "/us/": "Free Resume Builder with AI: Make a Resume Online | CVLibre",
    "/ca/": "Free Resume Builder with AI in Canada: Download PDF",
    "/au/": "Free Resume Builder with AI in Australia: Download PDF",
    "/nz/": "Free CV Builder with AI in New Zealand: Download PDF",
}

pages = {url_of(p): p for p in files()}
noidx = set()
for u, p in pages.items():
    s = open(p, encoding="utf-8").read(); o = s
    if (re.match(r"^/(ca|au|nz)/", u) and not KEEP.match(u)) or u in UTIL: s = set_noindex(s)
    # titre
    m = re.search(r"(?s)<title>(.*?)</title>", s)
    if m:
        t = html.unescape(m.group(1).strip())
        if u in SHORT: t = SHORT[u]
        elif len(t) > 65 and t.endswith(" | CVLibre"): t = t[:-10]
        if len(t) <= 65:
            new = html.escape(t, quote=False)
            s = s[:m.start(1)] + new + s[m.end(1):]
            s = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda x: x.group(1) + html.escape(t) + x.group(2), s, count=1)
    # guide
    g = GUIDES.get(u)
    if g:
        s = re.sub(r'\n?<section class="tool-guide[^"]*"[^>]*>.*?</section><!--/tg-->\n?', "", s, flags=re.S)
        block = '\n<section class="tool-guide prose" data-g="1" style="max-width:760px;margin:40px auto 24px">\n' + g.strip() + '\n</section><!--/tg-->\n'
        i = s.find('<div class="free-note">')
        if i < 0: i = s.find("</main>")
        if i > 0: s = s[:i] + block + s[i:]
    if s != o: open(p, "w", encoding="utf-8").write(s)
    if re.search(r'<meta name="robots" content="noindex', s): noidx.add(u)

# hreflang vers des pages en noindex : retirés
n = 0
for u, p in pages.items():
    s = open(p, encoding="utf-8").read()
    def drop(m):
        tgt = m.group(2).replace("https://cvlibre.com", "")
        return "" if tgt in noidx and tgt != u else m.group(0)
    s2 = re.sub(r'(<link rel="alternate" hreflang="[^"]+" href="(https://cvlibre\.com/[^"]*)">\n?)', drop, s)
    if s2 != s: open(p, "w", encoding="utf-8").write(s2); n += 1
print("seo_fix : noindex", len(noidx), "| hreflang nettoyés dans", n, "pages | guides", len(GUIDES))
