"""Génère la version anglaise des scripts : assets/<f>.js -> assets/en/<f>.js à partir des paires de en_js.py.
Échoue si une chaîne française d'une paire n'est plus trouvée (le script français a changé), et signale le français restant."""
import os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from en_js import FILES
root = os.path.join(os.path.dirname(__file__), "..", "..")
ok = True
FR = re.compile(r'"[^"\n]*(?:[éèêàùçôî]|\b(?:vous|votre|vos|les|des|une|avec|pour|dans|réessayez)\b)[^"\n]*"')
for src, pairs in FILES.items():
    s = open(os.path.join(root, src), encoding="utf-8").read()
    for fr, en in pairs:
        if fr not in s:
            print("MANQUANT", src, ":", fr[:90]); ok = False; continue
        s = s.replace(fr, en)
    s = "/* Généré par tools/i18n/build.py depuis " + src + " : ne pas modifier à la main. */\n" + s
    out = os.path.join(root, "assets/en", os.path.basename(src))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, "w", encoding="utf-8").write(s)
    code = re.sub(r"/\*.*?\*/|//[^\n]*", "", s, flags=re.S)
    for m in FR.findall(code):
        print("RESTE FR", os.path.basename(src), m[:100])
print("OK" if ok else "ERREURS")
