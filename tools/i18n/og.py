"""Images de partage (1200x630) par pays. Usage : python3 tools/i18n/og.py de "Titre" "Sous-titre" "cvlibre.com/de" """
import sys, os
from playwright.sync_api import sync_playwright
root = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
code, title, sub, url = sys.argv[1:5]
fs = sys.argv[5] if len(sys.argv) > 5 else "78"
F = "file://" + root + "/assets/fonts/"
html = f'''<html><head><meta charset="utf-8"><style>
@font-face {{ font-family: B; src: url({F}bricolage-grotesque-latin-wght-normal.woff2); font-weight: 200 800; }}
@font-face {{ font-family: B; src: url({F}bricolage-grotesque-latin-ext-wght-normal.woff2); font-weight: 200 800; unicode-range: U+0100-024F; }}
@font-face {{ font-family: S; src: url({F}source-sans-3-latin-wght-normal.woff2); font-weight: 200 900; }}
body {{ margin:0; width:1200px; height:630px; background:#1f4fd8; color:#fff; font-family:S; position:relative; overflow:hidden; }}
.l {{ position:absolute; left:80px; top:62px; font-family:B; font-size:38px; }} .l b {{ font-weight:800; }}
h1 {{ position:absolute; left:80px; top:150px; width:640px; margin:0; font-family:B; font-weight:800; font-size:{fs}px; line-height:1.08; letter-spacing:-1px; }}
p {{ position:absolute; left:80px; top:390px; width:640px; margin:0; font-size:29px; line-height:1.4; opacity:.92; }}
.u {{ position:absolute; left:80px; bottom:62px; font-weight:700; font-size:30px; }}
.d {{ position:absolute; left:760px; top:60px; width:370px; height:470px; background:#fff; border-radius:18px; transform:rotate(4deg); box-shadow:0 30px 60px rgba(0,0,0,.25); padding:40px 30px; box-sizing:border-box; }}
.d i {{ display:block; height:16px; border-radius:8px; background:#d6ddf5; margin:22px 0; }} .d i.h {{ background:#1f4fd8; width:45%; height:22px; margin-top:28px; }}
</style></head><body><div class="l"><b>CV</b>libre</div><h1>{title}</h1><p>{sub}</p><div class="u">{url}</div>
<div class="d"><i class="h"></i><i></i><i style="width:80%"></i><i></i><i style="width:65%"></i><i class="h"></i><i></i><i style="width:80%"></i><i></i><i style="width:65%"></i></div></body></html>'''
open("/tmp/og.html", "w", encoding="utf-8").write(html)
with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={"width": 1200, "height": 630})
    pg.goto("file:///tmp/og.html"); pg.wait_for_timeout(400)
    pg.screenshot(path=root + "/assets/og-%s.png" % code); b.close()
print("ok", code)
