# 14 nov 2026 (Jeremy): one page per CVLibre recruiter job (assets/offre.js fills it and adds the JobPosting data for Google Jobs).
# Built from each jobs page (same header, footer and app), re-run after each build.
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
V = "20261114a"
PAGES = {"offres-emploi": "offre", "en/jobs": "job", "us/jobs": "job", "ca/jobs": "job", "au/jobs": "job", "nz/jobs": "job", "de/jobs": "stelle"}
TITLE = {"offres-emploi": "Offre d'emploi | CVLibre", "de/jobs": "Stellenangebot | CVLibre"}
CSS = '<style>.of-back{display:inline-block;margin:8px 0 14px}.of-desc{margin:18px 0;line-height:1.6}#of h1{margin:6px 0}#of .jb-act{margin:14px 0}</style>\n'
n = 0
for d, sub in PAGES.items():
    src = os.path.join(ROOT, d, "index.html"); s = open(src, encoding="utf-8").read()
    s = re.sub(r'<link rel="(canonical|alternate)"[^>]*>\n?', "", s)
    s = re.sub(r'<meta property="og:url"[^>]*>\n?', "", s)
    s = re.sub(r"<title>.*?</title>", "<title>" + TITLE.get(d, "Job | CVLibre") + "</title>", s, count=1, flags=re.S)
    s = s.replace("</head>", CSS + "</head>", 1)
    i, j = s.find("<main"), s.find("</main>")
    s = s[:i] + '<main id="main" class="wrap jb"><div id="of"></div></main>' + s[j + 7:]
    s = re.sub(r'<script src="/assets/(?:[a-z]+/)?offres\.js[^"]*"[^>]*></script>', '<script src="/assets/offre.js?v=' + V + '" defer></script>', s)
    out = os.path.join(ROOT, d, sub); os.makedirs(out, exist_ok=True)
    open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(s); n += 1
print("pages offre :", n)
