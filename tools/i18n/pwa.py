# 14 nov 2026 (Jeremy): installable "Jobs CVLibre" app removed. This script now strips the app tags
# (manifest, apple-mobile-web-app...) from the job pages after each build. app.js stays: it holds the job alerts.
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
V = "20261114j"
DIRS = ["offres-emploi", "en/jobs", "us/jobs", "ca/jobs", "au/jobs", "nz/jobs", "de/jobs"]
SUB = {"offres-emploi": "offre", "de/jobs": "stelle"}
n = 0
for d in DIRS:
    for p in (os.path.join(ROOT, d, "index.html"), os.path.join(ROOT, d, SUB.get(d, "job"), "index.html")):
        if not os.path.exists(p): continue
        s = open(p, encoding="utf-8").read()
        s = re.sub(r'<link rel="manifest"[^>]*>\n?', "", s)
        s = re.sub(r'<meta name="(?:mobile-web-app-capable|apple-mobile-web-app-[a-z-]+)"[^>]*>\n?', "", s)
        s = s.replace('<link rel="apple-touch-icon" href="/assets/app-touch-180.png?v=4">', '<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">')
        s = re.sub(r'/assets/app\.js\?v=\w+', "/assets/app.js?v=" + V, s)
        open(p, "w", encoding="utf-8").write(s); n += 1
print("app emploi retirée:", n, "pages")
