# 14 nov 2026 (Jeremy): "CVLibre Emploi / Jobs" installable app, only on the job pages; re-applied after each build
import os
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
V = "20261114h"
DIRS = ["offres-emploi", "en/jobs", "us/jobs", "ca/jobs", "au/jobs", "nz/jobs", "de/jobs"]
n = 0
for d in DIRS:
    p = os.path.join(ROOT, d, "index.html")
    s = open(p, encoding="utf-8").read()
    if 'rel="manifest"' not in s:
        title = "Jobs CVLibre"
        head = ('<link rel="manifest" href="/%s/manifest.webmanifest">\n'
                '<meta name="mobile-web-app-capable" content="yes">\n'
                '<meta name="apple-mobile-web-app-capable" content="yes">\n'
                '<meta name="apple-mobile-web-app-title" content="%s">\n'
                '<meta name="apple-mobile-web-app-status-bar-style" content="default">\n') % (d, title)
        s = s.replace("</head>", head + "</head>", 1)
    # the installed app uses the "CV jobs" icon on these pages
    s = s.replace('<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">', '<link rel="apple-touch-icon" href="/assets/app-touch-180.png?v=4">')
    s = s.replace('content="CVLibre Emploi"', 'content="Jobs CVLibre"').replace('<meta name="apple-mobile-web-app-title" content="CVLibre Jobs">', '<meta name="apple-mobile-web-app-title" content="Jobs CVLibre">')
    if "/assets/app.js" not in s:
        i = s.rfind("</body>")
        s = s[:i] + '<script src="/assets/app.js?v=%s" defer></script>\n' % V + s[i:]
    open(p, "w", encoding="utf-8").write(s); n += 1
print("app emploi:", n, "pages")
