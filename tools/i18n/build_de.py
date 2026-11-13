"""Génère la version allemande des scripts : assets/<f>.js -> assets/de/<f>.js.
Les chaînes françaises viennent de en_js.py, les chaînes allemandes de de_js.py (même rang)."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from en_js import FILES
from de_js import DE
root = os.path.join(os.path.dirname(__file__), "..", "..")
ok = True
LEFT = re.compile(r'"[^"\n]*(?:[éèêàùçô]|\b(?:vous|votre|vos|les|des|une|avec|pour|dans|the|your|you|with|and|please|could|not)\b)[^"\n]*"', re.I)
for src, pairs in FILES.items():
    de = DE[src]
    if len(de) != len(pairs):
        print("NOMBRE", src, len(pairs), len(de)); ok = False; continue
    s = open(os.path.join(root, src), encoding="utf-8").read()
    for (fr, _), d in zip(pairs, de):
        if fr not in s:
            print("MANQUANT", src, ":", fr[:90]); ok = False; continue
        s = s.replace(fr, d)
    s = "/* Généré par tools/i18n/build_de.py depuis " + src + " : ne pas modifier à la main. */\n" + s
    out = os.path.join(root, "assets/de", os.path.basename(src))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(s)
    code = re.sub(r"/\*.*?\*/|//[^\n]*", "", s, flags=re.S)
    for m in LEFT.findall(code):
        print("RESTE", os.path.basename(src), m[:100])
print("OK" if ok else "ERREURS")
