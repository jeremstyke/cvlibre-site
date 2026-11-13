"""Versions États-Unis, Canada, Australie et Nouvelle-Zélande de CVLibre (/us/, /ca/, /au/, /nz/).
Elles sont dérivées de la version UK (/en/ et assets/en/) par remplacements propres à chaque pays, puis vérifiées
(aucune trace britannique ne doit rester). Lancer après en_pages2.py et build.py : python3 tools/i18n/anglo_pages.py"""
import os, re, sys, glob, json
sys.path.insert(0, os.path.dirname(__file__))
from alt import links, anglo_path
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))

C = {
 "us": dict(CC="US", lang="en-US", lc="en_US", name="US", the_name="the United States", in_name="in the US", In_name="In the US", adj="US", doc="resume", Doc="Resume", cur="USD", sym="$",
            city="Chicago", city2="Denver", near="Evanston", phone="(555) 201-4477", where="City, state or ZIP code", town="City", cj="https://www.careerjet.com/", us_spell=True,
            uni1="University of Michigan", deg1="MA in Digital Media", uni2="Michigan State University", deg2="BA in Communication", budget="$15,000",
            salary="E.g. $45,000 a year or $18 an hour", pages=2, pagesmsg="In the US, one page is preferred and two is the maximum: shorten the descriptions or keep your most recent jobs.",
            faqlen="One page is best for most people in the US, and two pages at most if you have a long career. CVLibre warns you if your resume goes over two pages.",
            ai_ex="E.g. Server for 3 years at The Harbor Grill in Austin, one year as a cashier at Target, associate degree in business in 2019. Fluent Spanish. Looking for a restaurant shift lead role.",
            lt_ex="E.g. Server for 3 years in Austin, one year as a cashier at a supermarket, associate degree in business. I enjoy working with customers and in a team.",
            co1="Target", co2="Costco", job_ex="sales associate, caregiver, forklift operator", sign="Sincerely,",
            final="Could you please confirm my last working day and let me know about my final paycheck and any accrued paid time off?",
            og="A free resume with AI, ready to send", flag="🇺🇸"),
 "ca": dict(CC="CA", lang="en-CA", lc="en_CA", name="Canada", the_name="Canada", in_name="in Canada", In_name="In Canada", adj="Canadian", doc="resume", Doc="Resume", cur="CAD", sym="$",
            city="Toronto", city2="Calgary", near="Mississauga", phone="(416) 555-0142", where="City, province or postal code", town="City", cj="https://www.careerjet.ca/", ca_spell=True,
            uni1="University of Toronto", deg1="MA in Digital Media", uni2="McGill University", deg2="BA in Communication Studies", budget="$15,000",
            salary="E.g. $50,000 a year or $20 an hour", pages=2, pagesmsg="In Canada, one or two pages is the norm: shorten the descriptions or keep your most recent jobs.",
            faqlen="One or two pages is the norm in Canada. One page is fine for students and people with little experience. CVLibre warns you if your resume goes over two pages.",
            ai_ex="E.g. Server for 3 years at The Harbour Grill in Halifax, one year as a cashier at Loblaws, college diploma in business in 2019. Fluent French. Looking for a restaurant supervisor role.",
            lt_ex="E.g. Server for 3 years in Halifax, one year as a cashier at a grocery store, college diploma in business. I enjoy working with customers and in a team.",
            co1="Loblaws", co2="Canadian Tire", job_ex="sales associate, personal support worker, forklift operator", sign="Sincerely,",
            final="Could you please confirm my last working day and arrange for my final pay, including vacation pay, and my Record of Employment (ROE)?",
            og="A free resume with AI, ready to send", flag="🇨🇦"),
 "au": dict(CC="AU", lang="en-AU", lc="en_AU", name="Australia", the_name="Australia", in_name="in Australia", In_name="In Australia", adj="Australian", doc="resume", Doc="Resume", cur="AUD", sym="$",
            city="Sydney", city2="Brisbane", near="Parramatta", phone="0412 345 678", where="Suburb, city or postcode", town="Suburb or city", cj="https://www.careerjet.com.au/",
            uni1="University of Sydney", deg1="Master of Digital Communication", uni2="University of Queensland", deg2="Bachelor of Communication", budget="$15,000",
            salary="E.g. $65,000 a year or $30 an hour", pages=3, pagesmsg="In Australia, two to three pages is normal: shorten the descriptions or keep your most recent jobs.",
            faqlen="Two to three pages is normal in Australia. One or two pages is fine for students and people with little experience. CVLibre warns you if your resume goes over three pages.",
            ai_ex="E.g. Waiter for 3 years at The Harbour Bistro in Melbourne, one year on the registers at Woolworths, Certificate III in Business in 2019. Fluent Italian. Looking for a restaurant supervisor role.",
            lt_ex="E.g. Waiter for 3 years in Melbourne, one year on the registers at a supermarket, Certificate III in Business. I enjoy working with customers and in a team.",
            co1="Woolworths", co2="Bunnings", job_ex="retail assistant, aged care worker, forklift driver", sign="Kind regards,",
            final="Could you please confirm my last working day and arrange for my final pay, including any accrued annual leave?",
            og="A free resume with AI, ready to send", flag="🇦🇺"),
 "nz": dict(CC="NZ", lang="en-NZ", lc="en_NZ", name="New Zealand", the_name="New Zealand", in_name="in New Zealand", In_name="In New Zealand", adj="New Zealand", doc="CV", Doc="CV", cur="NZD", sym="$",
            city="Auckland", city2="Wellington", near="Manukau", phone="021 123 4567", where="Town or city", town="Town or city", cj="https://www.careerjet.co.nz/",
            uni1="University of Auckland", deg1="Master of Communication", uni2="Victoria University of Wellington", deg2="Bachelor of Communication", budget="$15,000",
            salary="E.g. $55,000 a year or $25 an hour", pages=3, pagesmsg="In New Zealand, two to three pages is normal: shorten the descriptions or keep your most recent jobs.",
            faqlen="Two to three pages is normal in New Zealand. One or two pages is fine for students and people with little experience. CVLibre warns you if your CV goes over three pages.",
            ai_ex="E.g. Waiter for 3 years at The Harbour Bistro in Christchurch, one year on the checkouts at Countdown, NZ Certificate in Business in 2019. Fluent Māori. Looking for a restaurant supervisor role.",
            lt_ex="E.g. Waiter for 3 years in Christchurch, one year on the checkouts at a supermarket, NZ Certificate in Business. I enjoy working with customers and in a team.",
            co1="Countdown", co2="The Warehouse", job_ex="retail assistant, support worker, forklift driver", sign="Kind regards,",
            final="Could you please confirm my last working day and arrange for my final pay, including holiday pay?",
            og="A free CV with AI, ready to send", flag="🇳🇿"),
}
for cc, c in C.items(): c["builder"] = anglo_path("/en/cv-builder/", cc)

US_SPELL = [("ustomisation", "ustomization"), ("ustomise", "ustomize"), ("ersonalised", "ersonalized"), ("ersonalise", "ersonalize"), ("rganised", "rganized"), ("rganise", "rganize"), ("rganisation", "rganization"),
            ("ecognise", "ecognize"), ("ptimise", "ptimize"), ("ummarise", "ummarize"), ("pecialise", "pecialize"), ("ealise", "ealize"), ("pologise", "pologize")]
SPELL_COLOUR = [("colour", "color"), ("Colour", "Color"), ("favour", "favor"), ("centre", "center"), ("enrol ", "enroll "), ("travelled", "traveled"), ("cancelled", "canceled")]

GUIDE = {
 "us": ('''    <h2>What to include in a resignation letter</h2>
    <ul><li>The date.</li><li>A clear sentence saying that you are resigning from your position.</li><li>Your last day of work.</li><li>A short thank you and an offer to help with the transition.</li><li>Your signature.</li></ul>
    <p>You do not have to give a reason for leaving. Keep the letter short, positive and factual: you may need a reference from this employer one day.</p>
    <h2>How much notice do I need to give?</h2>
    <p>In most US states, employment is "at will": unless your contract says otherwise, there is usually no legal notice period. Two weeks' notice is the professional norm, and some contracts or company policies ask for more. Check your offer letter and employee handbook.</p>
    <h2>Should I resign in person or by email?</h2>
    <p>It is good practice to tell your manager in person or on a call first, then confirm in writing the same day. Keep a copy of your letter or email.</p>
    <h2>Frequently asked questions</h2>
    <h3>When will I get my final paycheck?</h3><p>It depends on your state: some states require the final paycheck on the last day, others by the next regular payday. Unused paid time off may or may not be paid out depending on state law and company policy.</p>
    <h3>What happens to my health insurance?</h3><p>If you had employer health coverage, you may be able to keep it for a while through COBRA. Ask HR before your last day.</p>
    <p class="ct-legal">This information is general and is not legal advice. Check your contract and your state's labor department, or see the <a href="https://www.dol.gov/" target="_blank" rel="noopener">US Department of Labor</a>.</p>''',
        [("How much notice should I give when I resign?", "Two weeks' notice is the professional norm in the US. In most states employment is at will, so check your contract or company policy."), ("Do I have to explain why I am leaving?", "No. A simple, polite letter is enough.")]),
 "ca": ('''    <h2>What to include in a resignation letter</h2>
    <ul><li>The date.</li><li>A clear sentence saying that you are resigning from your position.</li><li>Your notice period and your last day of work.</li><li>A short thank you and an offer to help with the transition.</li><li>Your signature.</li></ul>
    <p>You do not have to give a reason for leaving. Keep the letter short, positive and factual: you may need a reference from this employer one day.</p>
    <h2>How much notice do I need to give?</h2>
    <p>It depends on your employment contract and on the rules of your province or territory. Two weeks is common, and senior roles often require more. Check your contract first, then your provincial employment standards.</p>
    <h2>Frequently asked questions</h2>
    <h3>What is a Record of Employment (ROE)?</h3><p>It is the form your employer issues when you stop working. Service Canada uses it to decide whether you can get Employment Insurance (EI) benefits.</p>
    <h3>Is vacation pay included in my final pay?</h3><p>Vacation pay you have earned but not taken is usually paid out with your final pay. Check your province's rules.</p>
    <p class="ct-legal">This information is general and is not legal advice. Check your contract and your province's employment standards, or see <a href="https://www.canada.ca/en/services/jobs/workplace.html" target="_blank" rel="noopener">canada.ca</a>.</p>''',
        [("How much notice should I give when I resign in Canada?", "It depends on your contract and your province. Two weeks is common."), ("Do I have to explain why I am leaving?", "No. A simple, polite letter is enough.")]),
 "au": ('''    <h2>What to include in a resignation letter</h2>
    <ul><li>The date.</li><li>A clear sentence saying that you are resigning from your position.</li><li>Your notice period and your last day of work.</li><li>A short thank you and an offer to help with the handover.</li><li>Your signature.</li></ul>
    <p>You do not have to give a reason for leaving. Keep the letter short, positive and factual: you may need a reference from this employer one day.</p>
    <h2>How much notice do I need to give?</h2>
    <p>Your notice period is usually set by your employment contract, your award or your enterprise agreement. Check them first: the Fair Work Ombudsman explains the rules for your situation.</p>
    <h2>Frequently asked questions</h2>
    <h3>Will I be paid for my unused annual leave?</h3><p>Yes, unused annual leave is paid out in your final pay when you leave.</p>
    <h3>Can I get a statement of service?</h3><p>You can ask your employer for one. It confirms your role and dates of employment, which is useful for your next job.</p>
    <p class="ct-legal">This information is general and is not legal advice. Check your contract, award or agreement, or see the <a href="https://www.fairwork.gov.au/" target="_blank" rel="noopener">Fair Work Ombudsman</a>.</p>''',
        [("How much notice should I give when I resign in Australia?", "It is usually set by your employment contract, award or enterprise agreement. Check them, or see the Fair Work Ombudsman."), ("Do I have to explain why I am leaving?", "No. A simple, polite letter is enough.")]),
 "nz": ('''    <h2>What to include in a resignation letter</h2>
    <ul><li>The date.</li><li>A clear sentence saying that you are resigning from your position.</li><li>Your notice period and your last day of work.</li><li>A short thank you and an offer to help with the handover.</li><li>Your signature.</li></ul>
    <p>You do not have to give a reason for leaving. Keep the letter short, positive and factual: you may need a reference from this employer one day.</p>
    <h2>How much notice do I need to give?</h2>
    <p>Your employment agreement should set the notice period. If it does not, you must give reasonable notice. Check your agreement first.</p>
    <h2>Frequently asked questions</h2>
    <h3>Will I be paid my holiday pay?</h3><p>Annual holidays you have earned but not taken are paid out in your final pay.</p>
    <p class="ct-legal">This information is general and is not legal advice. Check your employment agreement, or see <a href="https://www.employment.govt.nz/" target="_blank" rel="noopener">employment.govt.nz</a>.</p>''',
        [("How much notice should I give when I resign in New Zealand?", "The notice period is set by your employment agreement. If there is none, give reasonable notice."), ("Do I have to explain why I am leaving?", "No. A simple, polite letter is enough.")]),
}

def paths(s, cc):
    """/en/... -> /cc/... (sauf les liens explicites vers la version UK du sélecteur)."""
    return re.sub(r'(?<![\w.])/en/([a-z0-9\-/]*)', lambda m: anglo_path("/en/" + m.group(1), cc), s)

def doc_word(s, c):
    """CV -> resume (US, Canada, Australie) dans le texte, sans toucher au logo CVLibre ni aux clés techniques.
    Majuscule en début de phrase et dans les titres (mot voisin en majuscule, hors sigles)."""
    if c["doc"] == "CV": return s
    def rep(m):
        plural = m.group(0) == "CVs"
        before, after = s[max(0, m.start() - 30):m.start()], s[m.end():m.end() + 30]
        pw = re.search(r"([A-Za-z]+)\W*$", before); nw = re.search(r"^\W*([A-Za-z]+)", after)
        cap = (not before.strip() or re.search(r"(^|[.!?>\"]\s*)$", before)) or (nw and nw.group(1)[0].isupper() and not nw.group(1).isupper()) or (pw and pw.group(1)[0].isupper() and not pw.group(1).isupper() and pw.group(1) not in ("I",))
        w = "resumes" if plural else "resume"
        return w.capitalize() if cap else w
    return re.sub(r'(?<!class="b1">)(?<![\w/.-])CVs?\b(?![_-])(?!\.\w)', rep, s)

def common(s, cc, c, js=False):
    R = [
        ("Jobs Near You in the UK", "Jobs Near You " + c["in_name"]), ("(UK)", "(" + c["name"] + ")"), ("Search thousands of UK jobs", "Search thousands of " + c["adj"] + " jobs"),
        ("Free UK templates", "Free " + c["adj"] + " templates"), ("Write your UK resignation letter", "Write your resignation letter"), ("Free UK CV builder", "Free CV builder"),
        ("Post a Job for Free in the UK", "Post a Job for Free " + c["in_name"]), ("UK employers:", c["adj"] + " employers:"), ("Write a UK cover letter", "Write a cover letter"),
        ("free UK template with AI", "free template with AI"), ("personalised UK-style cover letter", "personalised cover letter"),
        ("Under the GDPR (and the UK GDPR), you can", "Under the GDPR, you can"), (", or, in the UK, to the ICO (ico.org.uk)", ""),
        ("Town, city or postcode", c["where"]), ("https://www.careerjet.co.uk/", c["cj"]), ('placeholder="E.g. Manchester"', 'placeholder="E.g. ' + c["city"] + '"'), ('placeholder="E.g. Leeds"', 'placeholder="E.g. ' + c["city2"] + '"'),
        ("Not recommended for UK and US CVs: most employers prefer no photo.", "Not recommended " + c["in_name"] + ": most employers prefer no photo."),
        ("In the UK, Ireland and the US, no: most employers prefer CVs without a photo, to avoid any bias.", c["In_name"] + ", no: most employers prefer CVs without a photo, to avoid any bias."),
        ("Two A4 pages is the usual maximum in the UK. One page is fine for students, school leavers and people with little experience. CVLibre warns you if your CV goes over two pages.", c["faqlen"]),
        ("E.g. Waiter for 3 years at The Harbour Bistro in Bristol, one year on the tills at Tesco, BTEC in Business in 2019. Fluent Spanish. Looking for a restaurant supervisor role.", c["ai_ex"]),
        ("E.g. Waiter for 3 years in Bristol, one year on the tills in a supermarket, BTEC in Business. I enjoy dealing with customers and working in a team.", c["lt_ex"]),
        ("E.g. CV for Tesco, CV for marketing jobs", "E.g. CV for " + c["co1"] + ", CV for marketing jobs"), ("E.g. Letter for Tesco", "E.g. Letter for " + c["co1"]), ("E.g. Marks &amp; Spencer", "E.g. " + c["co2"]),
        ("E.g. £24,000 a year or £12.50 an hour", c["salary"]), ("E.g. sales assistant, care worker, forklift driver", "E.g. " + c["job_ex"]),
        ("even £1", "even " + c["sym"] + "1"), (">£0<", ">" + c["sym"] + "0<"), ("cup of tea", "cup of coffee"),
        ('"GBP"', '"' + c["cur"] + '"'), ("en_GB", c["lc"]), ('content="en_GB"', 'content="' + c["lc"] + '"'),
        ("og-en.png", "og-" + cc + ".png"), ("ready before your next cup of tea", "ready before your next coffee"),
        ("Town or city", c["town"]), ("in the UK", c["in_name"]), ("In the UK", c["In_name"]), ("Careerjet UK", "Careerjet " + c["name"]), ("UK job search", c["adj"] + " job search"),
        # JS
        ('"cvlibre.en.', '"cvlibre.' + cc + '.'), ('country=eq.GB', 'country=eq.' + c["CC"]), ('country: "GB"', 'country: "' + c["CC"] + '"'), ('.eq("country", "GB")', '.eq("country", "' + c["CC"] + '")'),
        ('payload.lang = "en";', 'payload.lang = "en"; payload.cc = "' + c["CC"] + '";'), ('{ lang: "en", job:', '{ lang: "en", cc: "' + c["CC"] + '", job:'),
        ('Object.assign({ lang: "en" }, cur)', 'Object.assign({ lang: "en", cc: "' + c["CC"] + '" }, cur)'), ('JSON.stringify({ lang: "en", messages: hist })', 'JSON.stringify({ lang: "en", cc: "' + c["CC"] + '", messages: hist })'),
        ('JSON.stringify({ lang: "en", type: TYPE, fields: fields })', 'JSON.stringify({ lang: "en", cc: "' + c["CC"] + '", type: TYPE, fields: fields })'),
        ("In the UK, two pages is the usual maximum: shorten the descriptions or keep your most recent jobs.", c["pagesmsg"]),
        ('if (pages > 2) {', 'if (pages > ' + str(c["pages"]) + ') {'),
        # exemple de CV (render.js)
        ('city: "Manchester"', 'city: "' + c["city"] + '"'), ('city: "Salford"', 'city: "' + c["near"] + '"'), ('"07700 900123"', '"' + c["phone"] + '"'), ("£10,000", c["budget"]),
        ('"MA Digital Media and Communications", school: "University of Manchester"', '"' + c["deg1"] + '", school: "' + c["uni1"] + '"'),
        ('"BA (Hons) Media and Communication", school: "University of Leeds"', '"' + c["deg2"] + '", school: "' + c["uni2"] + '"'),
        # courriers (letters.js)
        ("Could you please confirm my last working day, and arrange for my final payslip and P45 to be sent to me?", c["final"]),
    ]
    for a, b in R: s = s.replace(a, b)
    s = re.sub(r'(?<!hreflang=")en-GB', c["lang"], s)
    s = re.sub(r'(?<!https://)cvlibre\.com/en/support/', "cvlibre.com" + anglo_path("/en/support/", cc), s)
    ad = "job posting" if (c.get("us_spell") or c.get("ca_spell")) else "job ad"
    s = re.sub(r"\b(?:[Jj]ob )?([Aa])dverts?\b|\b([Aa])dvertised\b", lambda m: ("Posted" if m.group(2) == "A" else "posted") if m.group(0).lower().startswith("advertised") else ((ad[0].upper() + ad[1:]) if (m.group(1) == "A" or m.group(0).startswith("Job")) else ad) + ("s" if m.group(0).endswith("s") else ""), s)
    if c.get("us_spell") or c.get("ca_spell"):
        for a, b in US_SPELL: s = s.replace(a, b)
        s = s.replace("Yours sincerely,", "Sincerely,")
    if c.get("us_spell"):
        for a, b in SPELL_COLOUR: s = s.replace(a, b)
    return s

def convert_html(s, cc, en_path):
    c = C[cc]
    if en_path == "/en/resignation-letter/":
        g, faq = GUIDE[cc]
        s = re.sub(r'(<article class="ct-guide prose-s">\n).*?(\n  </article>)', lambda m: m.group(1) + g + m.group(2), s, flags=re.S)
        s = re.sub(r'\{"@type": "FAQPage".*?\]\}\]\}', lambda m: json.dumps({"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}, ensure_ascii=False) + "]}", s, flags=re.S)
    # hreflang : remplacé par la liste complète
    s = re.sub(r'(<link rel="alternate" hreflang="[^"]+" href="[^"]+">\n)+', "", s)
    s = re.sub(r'https://cvlibre\.com(/en/[a-z0-9\-/]*)', lambda m: "https://cvlibre.com" + anglo_path(m.group(1), cc), s)
    s = s.replace('<link rel="canonical" href="https://cvlibre.com' + anglo_path(en_path, cc) + '">\n', '<link rel="canonical" href="https://cvlibre.com' + anglo_path(en_path, cc) + '">\n' + links(en_path))
    s = s.replace('<html lang="en-GB">', '<html lang="' + c["lang"] + '">')
    s = s.replace('/assets/en/', '/assets/' + cc + '/')
    s = common(s, cc, c)
    s = paths(s, cc)
    s = s.replace('<a href="/" hreflang="fr" lang="fr">Version française</a>', '<a href="/en/" hreflang="en-GB">United Kingdom</a>\n      <a href="/" hreflang="fr" lang="fr">Version française</a>')
    s = doc_word(s, c)
    s = s.replace("A resume template", "A resume template")
    return s

def convert_js(s, cc):
    c = C[cc]
    s = common(s, cc, c, js=True)
    s = paths(s, cc)
    s = s.replace("/* Généré par tools/i18n/build.py", "/* Généré par tools/i18n/anglo_pages.py (" + cc + ") depuis la version UK, elle-même générée par tools/i18n/build.py")
    if c["doc"] != "CV":
        s = re.sub(r'"([^"\n]*)"', lambda m: '"' + doc_word(m.group(1), c) + '"' if not re.search(r"cvlibre\.|^/|\.css|\.js|^#|^\w+$", m.group(1)) else m.group(0), s)
    return s

UKLEFT = re.compile(r"\bUK\b|British|Britain|£|gov\.uk|Acas|P45|Tesco|Manchester|GCSE|A-level|BTEC|careerjet\.co\.uk|(?<!hreflang=\")en-GB|en_GB|payslip|(?<![\w.])/en/(?!\" hreflang)")

def write(path, html):
    p = os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(html)

def parts(cc):
    """Pour blog_build : head, en-tête et pied de page du pays (pris de en_pages puis convertis)."""
    import en_pages as m
    c = C[cc]
    def head(t, d, p, fr=None, extra="", ld=None):
        en_p = "/en/" + p.split("/", 2)[2]
        h = m.head(t, d, en_p, fr=fr, extra=extra, ld=ld)
        h = h.replace('<link rel="canonical" href="https://cvlibre.com' + en_p + '">', '<link rel="canonical" href="https://cvlibre.com' + p + '">')
        h = h.replace('<meta property="og:url" content="https://cvlibre.com' + en_p + '">', '<meta property="og:url" content="https://cvlibre.com' + p + '">')
        h = re.sub(r'("@id"|"url"|"mainEntityOfPage"): "https://cvlibre\.com(/en/[a-z0-9\-/]*)"', lambda mm: mm.group(1) + ': "https://cvlibre.com' + anglo_path(mm.group(2), cc) + '"', h)
        h = h.replace('<html lang="en-GB">', '<html lang="' + c["lang"] + '">').replace('/assets/en/', '/assets/' + cc + '/')
        return doc_word(paths(common(h, cc, c), cc), c)
    conv = lambda s: doc_word(paths(common(s.replace('/assets/en/', '/assets/' + cc + '/'), cc, c), cc), c).replace('<a href="/" hreflang="fr" lang="fr">Version française</a>', '<a href="/en/" hreflang="en-GB">United Kingdom</a>\n      <a href="/" hreflang="fr" lang="fr">Version française</a>')
    return {"head": head, "HEADER": conv(m.HEADER), "FOOTER": conv(m.FOOTER)}

if __name__ == "__main__":
    bad = 0
    for cc in C:
        # scripts
        os.makedirs(os.path.join(ROOT, "assets", cc), exist_ok=True)
        for f in glob.glob(os.path.join(ROOT, "assets/en/*.js")):
            s = open(f, encoding="utf-8").read()
            if os.path.basename(f) == "nav.js":
                for a in ['"/en/my-account/"', '"/en/cv-builder/?connexion=1"', '"/en/cv-builder/"', 'location.href = "/en/"']:
                    s = s.replace(a, paths(a.replace('"/en/', '"/en/'), cc).replace("/en/", "/" + cc + "/") if a.startswith("location") else paths(a, cc))
                s = s.replace('"cvlibre.en.', '"cvlibre.' + cc + '.')
            else:
                s = convert_js(s, cc)
            open(os.path.join(ROOT, "assets", cc, os.path.basename(f)), "w", encoding="utf-8").write(s)
            code = re.sub(r"/\*.*?\*/|//[^\n]*", "", s, flags=re.S)
            for m in ([] if os.path.basename(f) == "nav.js" else UKLEFT.finditer(code)): print("RESTE UK", cc, os.path.basename(f), code[max(0, m.start() - 40):m.end() + 30].replace("\n", " ")); bad += 1
        # pages (hors blog, construit par blog_build.py)
        for f in glob.glob(os.path.join(ROOT, "en/**/index.html"), recursive=True):
            en_path = "/" + os.path.relpath(os.path.dirname(f), ROOT).replace(os.sep, "/") + "/"
            if en_path.startswith("/en/blog/"): continue
            s = convert_html(open(f, encoding="utf-8").read(), cc, en_path)
            write(anglo_path(en_path, cc), s)
            txt = re.sub(r"<script.*?</script>|<link[^>]+>|<a href=\"/en/\" hreflang=\"en-GB\">United Kingdom</a>", "", s, flags=re.S)
            for m in UKLEFT.finditer(txt): print("RESTE UK", cc, en_path, txt[max(0, m.start() - 50):m.end() + 30].replace("\n", " ")); bad += 1
    print("OK" if not bad else "%d restes" % bad)
