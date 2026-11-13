# 14 nov 2026 (Jeremy): Notifpush (Adrenalead) on every page, re-applied after each build
import os, re
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
SNIP = """<script type="text/javascript">
  window._nAdzq=window._nAdzq||[];(function(){
  window._nAdzq.push(["setIds","62e1995e0e7de2e0"]);
  var e="https://notifpush.com/scripts/";
  var t=document.createElement("script");
  t.type="text/javascript";
  t.defer=true;
  t.async=true;
  t.src=e+"nadz-sdk.js";
  var s=document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(t,s)})();
</script>
"""
# the SDK is loaded later by assets/push.js; SNIP is the old inline version, removed where found
TAG = '<script src="/assets/push.js?v=20261114c" defer></script>'
n = 0
for d, dirs, files in os.walk(ROOT):
    dirs[:] = [x for x in dirs if not x.startswith(".") and x not in ("tools", "node_modules", "content", "stats")]
    for f in files:
        if not f.endswith(".html"): continue
        p = os.path.join(d, f)
        s = open(p, encoding="utf-8").read()
        if TAG in s or "</body>" not in s: continue
        s = s.replace(SNIP, "")
        import re as _re; s = _re.sub(r'<script src="/assets/push\.js\?v=[^"]*" defer></script>\n?', "", s)
        i = s.rfind("</body>")
        open(p, "w", encoding="utf-8").write(s[:i] + TAG + "\n" + s[i:]); n += 1
print("notifpush:", n, "pages")
