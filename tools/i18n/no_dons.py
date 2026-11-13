"""13 nov 2026 (Jeremy) : plus de dons, place au Pass CVLibre.
Les anciennes pages Soutenir / Support / Unterstützen redirigent vers l'offre du Pass (page du compte, ?pass=1)
et sortent du sitemap. Lancé en dernier par build_all.sh."""
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
R = {"soutenir": "/mon-espace/?pass=1", "de/unterstuetzen": "/de/mein-konto/?pass=1"}
for cc in ("en", "us", "ca", "au", "nz"):
    R[cc + "/support"] = "/" + cc + "/my-account/?pass=1"
STUB = """<!doctype html>
<html><head><meta charset="utf-8"><title>CVLibre Pass</title>
<meta name="robots" content="noindex, follow">
<link rel="canonical" href="https://cvlibre.com{u}">
<meta http-equiv="refresh" content="0; url={u}">
<script>location.replace("{u}");</script>
</head><body><p><a href="{u}">CVLibre Pass</a></p></body></html>
"""
for p, u in R.items():
    d = os.path.join(ROOT, p); os.makedirs(d, exist_ok=True)
    open(os.path.join(d, "index.html"), "w", encoding="utf-8").write(STUB.format(u=u))
sm = os.path.join(ROOT, "sitemap.xml"); s = open(sm, encoding="utf-8").read()
for p in R:
    s = re.sub(r"\s*<url><loc>https://cvlibre\.com/" + re.escape(p) + r"/</loc>.*?</url>", "", s, flags=re.S)
open(sm, "w", encoding="utf-8").write(s)
print("pages dons redirigées :", len(R))
