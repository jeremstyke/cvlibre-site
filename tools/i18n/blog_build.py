"""Blogs des versions étrangères de CVLibre, à partir des articles JSON de content/blog/<pays>/.
Usage : python3 tools/i18n/blog_build.py en de   (sans argument : tous les pays)
Un article = content/blog/<pays>/<slug>.json :
  {"slug", "title", "desc", "mins", "date": "AAAA-MM-JJ", "cat": "CV", "blocks": [["p", "html"], ["h2", "titre"], ["ul", ["..."]], ["ex", "avant", "après"]]}
Ajouter un fichier puis relancer ce script (et tools/i18n/sitemap.py) suffit à publier un article."""
import os, sys, re, json, glob, datetime
sys.path.insert(0, os.path.dirname(__file__))
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
COVER = open(os.path.join(os.path.dirname(__file__), "cover.svg"), encoding="utf-8").read()
BLOG_CSS = '<link rel="stylesheet" href="/assets/blog.css?v=20261113k">\n'
MONTHS_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
MONTHS_DE = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]

def parts(cc):
    """head, HEADER, FOOTER, write de la version du pays."""
    if cc == "en":
        import en_pages as m
        return (lambda t, d, p, fr=None, extra="", ld=None: m.head(t, d, p, fr=fr, extra=extra, ld=ld)), m.HEADER, m.FOOTER, m.write
    if cc == "de":
        import de_pages as m
        return (lambda t, d, p, fr=None, extra="", ld=None: m.head(t, d, p, extra=extra, ld=ld)), m.HEADER, m.FOOTER, m.write
    import anglo_pages as m
    P = m.parts(cc)
    return P["head"], P["HEADER"], P["FOOTER"], m.write

def L(cc):
    if cc == "de":
        return dict(base="/de/ratgeber/", home="/de/", builder="/de/lebenslauf-erstellen/", lang="de-DE", crumb="Ratgeber", homel="Startseite", mins="Min. Lesezeit",
                    upd="Aktualisiert am", ai="Mit Hilfe von KI geschrieben", toc="Inhalt", toch="In diesem Artikel", nxt="Weiterlesen", before="Vorher", after="Nachher",
                    bc="Brotkrumen", allh="Alle Ratgeber", cta="Lebenslauf erstellen",
                    date=lambda d: "%d. %s %d" % (d.day, MONTHS_DE[d.month - 1], d.year),
                    callout='<strong>Am schnellsten starten:</strong> füllen Sie eine fertige Vorlage aus, sehen Sie das Ergebnis live und laden Sie das PDF herunter. Sie können auch <a href="/de/lebenslauf-erstellen/">Ihren Werdegang in ein paar Zeilen beschreiben und die KI das Formular ausfüllen lassen</a> und dann alles prüfen. Kostenlos, ohne Anmeldung.',
                    title="Bewerbungsratgeber: Lebenslauf, Anschreiben, Vorstellungsgespräch | CVLibre", desc="Praktische Ratgeber für Ihre Bewerbung in Deutschland: Lebenslauf, Anschreiben, Bewerbungsfoto, Vorstellungsgespräch, mit Beispielen. Kostenlos, ohne Anmeldung.",
                    h1="Lebenslauf, Anschreiben und Bewerbung, verständlich erklärt.", lead="Praktische Ratgeber für die Jobsuche in Deutschland, mit Beispielen zum Anpassen. Kostenlos, ohne Anmeldung.", alt="Illustration: ")
    if cc == "en":
        b = dict(base="/en/blog/", home="/en/", builder="/en/cv-builder/", lang="en-GB", title="CV and Job Application Advice (UK) | CVLibre",
                 desc="Practical UK guides to write your CV, personal statement and cover letter, with examples. Free, no sign-up.", lead="Practical guides for job seekers in the UK, with examples you can adapt. Free, no sign-up.", doc="CV")
    else:
        import anglo_pages as m
        c = m.C[cc]
        b = dict(base="/%s/blog/" % cc, home="/%s/" % cc, builder=c["builder"], lang=c["lang"], title="%s and Job Application Advice (%s) | CVLibre" % (c["Doc"], c["name"]),
                 desc="Practical guides for job seekers in %s: %s, cover letter, interviews, with examples. Free, no sign-up." % (c["the_name"], c["doc"]), lead="Practical guides for job seekers in %s, with examples you can adapt. Free, no sign-up." % c["the_name"], doc=c["Doc"])
    b.update(crumb="Advice", homel="Home", mins="min read", upd="Updated", ai="Written with the help of AI", toc="Contents", toch="In this article", nxt="Read next",
             before="Before", after="After", bc="Breadcrumb", allh="All guides", cta="Create my " + b["doc"],
             date=lambda d: "%d %s %d" % (d.day, MONTHS_EN[d.month - 1], d.year) if b["lang"] != "en-US" else "%s %d, %d" % (MONTHS_EN[d.month - 1], d.day, d.year),
             callout='<strong>The quickest way to start:</strong> fill in a ready-made template, see the result live and download the PDF. You can even <a href="%s">describe your background in a few lines and let the AI fill in the form</a>, then check everything. Free, no sign-up.' % b["builder"],
             h1="%ss, cover letters and applications, without the jargon." % b["doc"], alt="Illustration: ")
    return b

def slugid(t): return re.sub(r"[^a-z0-9]+", "-", t.lower().replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")).strip("-")[:48]
def cover(lb, label): return re.sub(r'aria-label="[^"]*"', 'aria-label="' + lb["alt"] + label.replace('"', "") + '"', COVER, count=1)

def render(blocks, lb):
    out = []
    for b in blocks:
        if b[0] == "p": out.append("<p>%s</p>" % b[1])
        elif b[0] == "h2": out.append('<h2 id="%s">%s</h2>' % (slugid(b[1]), b[1]))
        elif b[0] == "h3": out.append("<h3>%s</h3>" % b[1])
        elif b[0] == "ul": out.append("<ul>" + "".join("<li>%s</li>" % x for x in b[1]) + "</ul>")
        elif b[0] == "ol": out.append("<ol>" + "".join("<li>%s</li>" % x for x in b[1]) + "</ol>")
        elif b[0] == "ex": out.append('<div class="ex ba"><p><span class="tag bad">%s</span> %s</p><p><span class="tag good">%s</span> %s</p></div>' % (lb["before"], b[1], lb["after"], b[2]))
    return "\n".join(out)

def card(lb, P):
    return f'''    <a class="card cat-cv" href="{lb['base']}{P['slug']}/" data-cat="{P.get('cat', 'CV')}">
      <span class="card-cover">{cover(lb, P['title'])}</span>
      <span class="card-body"><span class="pill">{P.get('cat', 'CV')}</span><strong class="card-title">{P['title']}</strong><span class="card-desc">{P['desc']}</span><span class="card-meta">{P['mins']} {lb['mins']}</span></span>
    </a>
'''

def build(cc):
    head, HEADER, FOOTER, write = parts(cc)
    lb = L(cc)
    posts = [json.load(open(f, encoding="utf-8")) for f in glob.glob(os.path.join(ROOT, "content/blog", cc, "*.json"))]
    posts.sort(key=lambda P: (P.get("date", ""), P["slug"]), reverse=True)
    for i, P in enumerate(posts):
        d = datetime.date.fromisoformat(P.get("date", "2026-11-13"))
        toc = "".join('<li><a href="#%s">%s</a></li>' % (slugid(b[1]), b[1]) for b in P["blocks"] if b[0] == "h2")
        url = lb["base"] + P["slug"] + "/"
        ld = {"@context": "https://schema.org", "@type": "Article", "headline": P["title"], "description": P["desc"], "inLanguage": lb["lang"], "datePublished": P.get("date"), "dateModified": P.get("updated", P.get("date")),
              "author": {"@type": "Organization", "name": "CVLibre"}, "publisher": {"@type": "Organization", "name": "CVLibre", "url": "https://cvlibre.com" + lb["home"]}, "mainEntityOfPage": "https://cvlibre.com" + url}
        rel = "".join(card(lb, Q) for Q in (posts[i + 1:] + posts[:i])[:3])
        write(url, head(P["title"] + " | CVLibre", P["desc"], url, extra=BLOG_CSS, ld=ld) + "<body>\n" + HEADER + f'''
<main id="main" class="blog cat-cv">
  <header class="post-hero">
    <div class="wrap post-hero-in">
      <div class="post-hero-text">
        <nav class="crumbs" aria-label="{lb['bc']}"><a href="{lb['home']}">{lb['homel']}</a><span aria-hidden="true">/</span><a href="{lb['base']}">{lb['crumb']}</a></nav>
        <span class="pill">{P.get('cat', 'CV')}</span>
        <h1>{P['title']}</h1>
        <p class="standfirst">{P['desc']}</p>
        <p class="meta">{P['mins']} {lb['mins']}<span aria-hidden="true"> · </span>{lb['upd']} {lb['date'](d)}<span aria-hidden="true"> · </span>{lb['ai']}</p>
      </div>
      <div class="post-cover">{cover(lb, P['title'])}</div>
    </div>
  </header>
  <div class="wrap post-grid">
    <aside class="toc" aria-label="{lb['toc']}">
      <details class="toc-m"><summary>{lb['toc']}</summary><ol>{toc}</ol></details>
      <div class="toc-d"><p class="toc-h">{lb['toch']}</p><ol>{toc}</ol></div>
    </aside>
    <article class="prose">
{render(P['blocks'], lb)}
<div class="callout"><p>{lb['callout']}</p></div>
    </article>
  </div>
  <section class="wrap rel" aria-labelledby="rel-h"><h2 id="rel-h">{lb['nxt']}</h2><div class="b-grid">
{rel}  </div></section>
</main>
''' + FOOTER + "</body>\n</html>\n")
    write(lb["base"], head(lb["title"], lb["desc"], lb["base"], fr="/blog/", extra=BLOG_CSS) + "<body>\n" + HEADER + f'''
<main id="main" class="blog">
  <section class="b-hero"><div class="wrap b-hero-in">
    <div>
      <h1>{lb['h1']}</h1>
      <p class="lead">{lb['lead']}</p>
      <p class="hero-cta"><a class="btn" href="{lb['builder']}">{lb['cta']}</a></p>
    </div>
  </div></section>
  <section class="wrap" aria-labelledby="all-h">
    <h2 id="all-h" class="sec-h">{lb['allh']}</h2>
    <div class="b-grid">
''' + "".join(card(lb, P) for P in posts) + '''    </div>
  </section>
</main>
''' + FOOTER + "</body>\n</html>\n")
    print(cc, len(posts), "articles")

if __name__ == "__main__":
    for cc in (sys.argv[1:] or ["en", "de", "us", "ca", "au", "nz"]):
        if os.path.isdir(os.path.join(ROOT, "content/blog", cc)): build(cc)
