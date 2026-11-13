"""Met à jour les balises hreflang des pages françaises qui ont un équivalent dans les autres pays (liste dans alt.py)."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from alt import ALT, links
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
for fr, en, de in ALT:
    f = os.path.join(ROOT, (fr.strip("/") + "/index.html") if fr != "/" else "index.html")
    s = open(f, encoding="utf-8").read()
    s = re.sub(r'(<link rel="alternate" hreflang="[^"]+" href="[^"]+">\n)+', "", s)
    m = re.search(r'<link rel="canonical"[^>]*>\n', s)
    open(f, "w", encoding="utf-8").write(s[:m.end()] + links(fr) + s[m.end():])
print("fr hreflang ok")
