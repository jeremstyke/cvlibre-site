"""Met à jour sitemap.xml : garde les pages françaises telles quelles et régénère toutes les pages des versions étrangères
(en, de, us, ca, au, nz) à partir des fichiers index.html présents, sauf les pages en noindex. Lancer après chaque nouvel article."""
import os, re, glob, json, datetime
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
CCS = ["en", "de", "us", "ca", "au", "nz"]
sm = open(os.path.join(ROOT, "sitemap.xml"), encoding="utf-8").read()
def noindex(u):
    m = re.search(r"<loc>https://cvlibre\.com(/[^<]*)</loc>", u); f = os.path.join(ROOT, m.group(1).strip("/"), "index.html")
    return os.path.exists(f) and 'content="noindex' in open(f, encoding="utf-8").read(3000)
keep = [u for u in re.findall(r"  <url>.*?</url>\n", sm, flags=re.S) if not re.search(r"<loc>https://cvlibre\.com/(%s)/" % "|".join(CCS), u) and not noindex(u)]
dates = {}
for f in glob.glob(os.path.join(ROOT, "content/blog/*/*.json")):
    P = json.load(open(f, encoding="utf-8")); cc = os.path.basename(os.path.dirname(f))
    base = {"de": "/de/ratgeber/"}.get(cc, "/%s/blog/" % cc)
    dates[base + P["slug"] + "/"] = P.get("updated", P.get("date"))
add = []
for cc in CCS:
    for f in sorted(glob.glob(os.path.join(ROOT, cc, "**", "index.html"), recursive=True)):
        h = open(f, encoding="utf-8").read(2000)
        if 'content="noindex' in h: continue
        path = "/" + os.path.relpath(os.path.dirname(f), ROOT).replace(os.sep, "/") + "/"
        lm = dates.get(path) or datetime.date.fromtimestamp(os.path.getmtime(f)).isoformat()
        add.append("  <url><loc>https://cvlibre.com%s</loc><lastmod>%s</lastmod></url>\n" % (path, lm))
out = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "".join(keep) + "".join(add) + "</urlset>\n"
open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8").write(out)
print(len(keep), "FR +", len(add), "autres pays =", len(keep) + len(add))
