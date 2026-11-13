"""Pages anglaises de CVLibre (cvlibre.com/en/). Lancer : python3 tools/i18n/en_pages.py
En-tête, pied de page et fenêtre de compte communs, puis le contenu de chaque page."""
import os, sys, json
sys.path.insert(0, os.path.dirname(__file__))
from alt import links
ROOT = os.path.join(os.path.dirname(__file__), "..", "..")
V = "20261113y"
# Dons des versions étrangères : page Ko-fi de CVLibre (13 nov 2026, remplace PayPal).
PAYPAL = "https://ko-fi.com/cvlibrecom"
DON_BOX = '''    <div class="after-box">
      <h3>Go further with the CVLibre Pass</h3>
      <p>No ads, 50 AI uses a day, your CV tailored to every job, ATS score and translation. One-time payment for 3 months.</p>
      <a class="btn btn-sm btn-ghost" href="/en/my-account/?pass=1" data-pass id="after-don">Discover the Pass</a>
    </div>
'''
DON_BTN = ('''  <p><a class="btn" href="%s" target="_blank" rel="noopener">Donate on Ko-fi ❤️</a></p>
  <p class="hint">Payment is handled entirely by Ko-fi: CVLibre never sees your bank details.</p>'''.replace("%s", PAYPAL)) if PAYPAL else "  <p><strong>Online donations will open very soon.</strong> Thank you for your patience!</p>"

def head(title, desc, path, fr=None, extra="", ld=None, robots="index, follow"):
    url = "https://cvlibre.com" + path
    alt = links(path) if fr else ""
    return f'''<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8"><script>(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8638687738606649" crossorigin="anonymous"></script><script src="/assets/en/consent.js?v={V}" defer></script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{url}">
{alt}<meta name="robots" content="{robots}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:locale" content="en_GB">
<meta property="og:image" content="https://cvlibre.com/assets/og-en.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://cvlibre.com/assets/og-en.png">
<meta name="theme-color" content="#f3f5f8">
<link rel="stylesheet" href="/assets/style.css?v={V}">
<link rel="stylesheet" href="/assets/cv.css?v=20261113b">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/source-sans-3-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
{extra}{('<script type="application/ld+json">' + json.dumps(ld, ensure_ascii=False) + '</script>') if ld else ''}
</head>
'''

HEADER = '''<a class="skip" href="#main">Skip to content</a>
<header class="top">
  <div class="wrap top-in">
    <a class="brand" href="/en/" aria-label="CVLibre, home"><span class="b1">CV</span><span class="b2">libre</span></a>
    <nav class="nav" aria-label="Main navigation">
      <a href="/en/cover-letter/">Cover letter</a>
      <a href="/en/letters/">Letters</a>
      <a href="/en/jobs/">Jobs</a>
      <a href="/en/blog/">Advice</a>
      <a href="/en/#faq">FAQ</a>
      <a class="btn btn-ghost btn-sm" id="nav-acc" href="/en/cv-builder/?connexion=1" rel="nofollow">Sign in</a>
      <a class="btn btn-ghost btn-sm" id="nav-out" href="#" hidden>Sign out</a>
      <a class="btn btn-sm" href="/en/cv-builder/">Create my CV</a>
    </nav>
  </div>
</header>
'''

FOOTER = f'''<footer class="foot">
  <div class="wrap foot-in">
    <p class="foot-brand"><strong>CVLibre</strong> is free. The site is funded by advertising and by the <a href="/en/my-account/?pass=1" data-pass>CVLibre Pass</a>: no ads, 50 AI uses a day, one payment for 3 months.</p>
    <p class="foot-ai">CVLibre uses artificial intelligence to fill in, improve and tailor a CV to a job advert, and to write cover letters. You always read and correct the result.</p>
    <nav aria-label="Legal pages">
      <a href="/en/blog/">CV advice</a>
      <a href="/en/letters/">Letters</a>
      <a href="/en/jobs/">Jobs</a>
      <a href="/en/recruiters/">Recruiters: post a job</a>
      <a href="/en/advertise/">Advertising and partnerships</a>
      <a href="/en/legal-notice/">Legal notice</a>
      <a href="/en/privacy/">Privacy</a>
      <a href="/en/terms/">Terms of use</a>
      <a href="/en/my-account/?pass=1" data-pass>CVLibre Pass</a>
      <a href="/" hreflang="fr" lang="fr">Version française</a>
    </nav>
  </div>
</footer>
<script src="/assets/en/nav.js?v={V}" defer></script>
<script src="/assets/en/support.js?v={V}" defer></script>
<script src="/assets/stats.js?v=20261113b" defer></script>
'''

def acc_dlg(perk1, with_in):
    out_end = "  </div>\n" if with_in else '    <p class="pass-note" id="acc-note" role="status"></p>\n  </div>\n'
    inn = '''  <div id="acc-in" hidden>
    <h2 id="acc-title-in-h" class="acc-h2">My account</h2>
    <p>Signed in as <strong id="acc-mail"></strong></p>
    <div class="fld"><label for="acc-title-in">Name of this CV (only you see it)</label><input type="text" id="acc-title-in" maxlength="60" placeholder="E.g. CV for Tesco, CV for marketing jobs" autocomplete="off"></div>
    <p class="pass-row"><button type="button" class="btn btn-sm" id="acc-save">Save this CV</button><button type="button" class="btn btn-ghost btn-sm" id="acc-new">Save as a new CV</button></p>
    <div id="acc-list"></div>
    <p class="pass-row"><button type="button" class="btn btn-ghost btn-sm" id="acc-out-btn">Sign out</button><button type="button" class="btn btn-ghost btn-sm" id="acc-del">Delete my account</button></p>
  </div>
  <p class="pass-note" id="acc-note" role="status"></p>
''' if with_in else ""
    return f'''<dialog class="pass-dlg" id="acc-dlg" aria-labelledby="acc-title">
  <button type="button" class="dlg-x" id="acc-close" aria-label="Close">&times;</button>
  <div id="acc-out">
    <p class="acc-brand" aria-hidden="true"><span class="b1">CV</span><span class="b2">libre</span></p>
    <h2 id="acc-title">Create my free account</h2>
    <ul class="acc-perks" id="acc-intro">
      <li>{perk1}</li>
      <li>Free, no password: an email address is all you need</li>
      <li>Already signed up? Sign in the same way</li>
    </ul>
    <div id="acc-step1">
      <button type="button" class="btn btn-ghost acc-big" id="acc-google">Continue with Google</button>
      <button type="button" class="btn acc-big" id="acc-mail-open">Continue with my email</button>
    </div>
    <div id="acc-step2" hidden>
      <label for="acc-email" class="acc-lab">Email address</label>
      <input type="email" id="acc-email" autocomplete="email" inputmode="email" placeholder="you@example.com">
      <button type="button" class="btn acc-big" id="acc-mail-go">Send me a sign-in link</button>
      <button type="button" class="link-btn" id="acc-back">Back</button>
    </div>
    <p class="acc-legal">By continuing, you accept the <a href="/en/terms/">terms of use</a> and the <a href="/en/privacy/">privacy policy</a>.</p>
{out_end}{inn}</dialog>
'''

def write(path, html):
    p = os.path.join(ROOT, path.strip("/"), "index.html")
    os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(html)
    print("écrit", p)

OPTS = ''.join(f'<option value="{v}">{n}</option>' for v, n in [("inter", "Inter"), ("nunito", "Nunito (rounded)"), ("montserrat", "Montserrat"), ("sourcesans", "Source Sans"), ("bricolage", "Bricolage"), ("lora", "Lora (serif)"), ("playfair", "Playfair (elegant serif)"), ("sourceserif", "Source Serif")])
def fmt_row(lab, k): return f'      <label class="fmt-row"><span>{lab}</span><select data-f="{k}"><option value="">Template default</option>{OPTS}</select></label>\n'

# ---------------- CV builder ----------------
builder = head("Free CV Builder with AI, Download as PDF | CVLibre",
    "Free UK CV builder: AI fills in your CV from your old one, improves your wording and tailors it to a job advert. 33 free templates, PDF download, no sign-up.",
    "/en/cv-builder/", fr="/creer-un-cv/",
    extra='''<style>
@media print {
  @page { size: A4; margin: 0; }
  html, body { background: #fff !important; }
  * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .skip, .top, .foot, .app-bar, .panel, .mobile-tabs, .notice, .help, .pass-dlg, .sup { display: none !important; }
  .wrap { max-width: none; padding: 0; }
  .app { display: block; padding: 0; }
  body .preview-col { display: block !important; position: static; }
  body .panel { display: none !important; }
  .preview-outer { border: 0; padding: 0; background: #fff; border-radius: 0; overflow: visible; }
  .preview-box { height: auto !important; }
  .preview-box .sheet { transform: none !important; position: relative !important; min-height: 296mm; }
}
</style>
''', ld={"@context": "https://schema.org", "@type": "WebApplication", "name": "CVLibre CV builder", "description": "Create a free CV online and download it as a PDF, no account needed.", "url": "https://cvlibre.com/en/cv-builder/", "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "inLanguage": "en-GB", "offers": [{"@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "GBP"}]}) + '<body data-tab="edit">\n' + HEADER + f'''
<div class="app-bar" role="region" aria-label="CV settings">
  <div class="wrap app-bar-in">
    <div class="grp grp-tpl" role="group" aria-label="Template"><span>Template</span>
      <button type="button" class="btn btn-ghost btn-sm tpl-cur" id="tpl-cur" aria-haspopup="dialog">Modern ▾</button>
      <div class="seg" id="tpls">
        <button type="button" data-tpl="classique" aria-pressed="false">Classic</button>
        <button type="button" data-tpl="moderne" aria-pressed="false">Modern</button>
        <button type="button" data-tpl="sobre" aria-pressed="false">Simple</button>
        <button type="button" id="tpl-more" aria-haspopup="dialog">More templates</button>
      </div>
    </div>
    <div class="grp" role="group" aria-label="Formatting"><button type="button" class="btn btn-ghost btn-sm" id="fmt-btn" aria-haspopup="dialog">Customise</button></div>
    <div class="grp" role="group" aria-label="Colour"><span>Colour</span>
      <div class="swatches" id="swatches"></div>
    </div>
    <div class="app-actions">
      <details class="tbm" id="more">
        <summary class="btn btn-ghost btn-sm">More<span class="tbm-dots" aria-hidden="true"> ⋯</span></summary>
        <div class="tbm-menu" role="group" aria-label="Other actions">
          <button type="button" class="tbm-item" id="tailor-open">Tailor to a job advert (AI)</button>
          <button type="button" class="tbm-item" id="acc-btn">Save online (free account)</button>
          <button type="button" class="tbm-item" id="export">Export (file)</button>
          <button type="button" class="tbm-item" id="import">Import a file</button><input type="file" id="import-file" accept=".json,application/json" hidden>
          <button type="button" class="tbm-item danger" id="reset">Start from scratch</button>
        </div>
      </details>
      <button type="button" class="btn btn-sm" id="print">Download PDF</button>
    </div>
  </div>
</div>

<main id="main" class="wrap">
  <h1 class="sr-only" style="position:absolute;left:-9999px">Create my CV</h1>
  <div class="mobile-tabs"><div class="seg" role="group" aria-label="View">
    <button type="button" id="tab-edit" aria-pressed="true" data-tab="edit">Edit</button>
    <button type="button" id="tab-view" aria-pressed="false" data-tab="view">Preview</button>
  </div></div>

  <div class="app">
    <div class="panel" id="panel">
      <details class="fs" open>
        <summary>Fill in with AI (free)</summary>
        <div class="fs-body">
          <div class="ai-budget" aria-live="polite"></div>
          <div class="fld"><label for="ai-text">Describe your background in a few lines</label>
            <textarea id="ai-text" maxlength="8000" placeholder="E.g. Waiter for 3 years at The Harbour Bistro in Bristol, one year on the tills at Tesco, BTEC in Business in 2019. Fluent Spanish. Looking for a restaurant supervisor role."></textarea>
            <span class="hint">Or add your old CV below: the AI reads it and fills in the form.</span>
          </div>
          <div class="fld"><label for="ai-file">Old CV (PDF or photo, optional)</label><input type="file" id="ai-file" accept="application/pdf,image/jpeg,image/png,image/webp"></div>
          <div class="ai-actions"><button type="button" class="btn btn-sm" id="ai-go">Fill in my CV</button><button type="button" class="link-btn" id="ai-undo" hidden>Undo</button></div>
          <p class="hint" id="ai-msg" role="status" aria-live="polite">Free, no sign-up: 5 uses a day. The AI never adds anything: check the result before you send your CV. What you send is processed by an AI (see <a href="/en/privacy/">privacy</a>).</p>
        </div>
      </details>
      <details class="fs" id="tailor">
        <summary>Tailor my CV to a job advert (free AI)</summary>
        <div class="fs-body">
          <p class="hint">Paste a job advert: the AI adjusts your title, profile, skills and duties to match it, and spots the keywords you are missing. It only rewords what is already in your CV, and you choose what to keep.</p>
          <div class="fld"><label for="tl-ad">The job advert</label>
            <textarea id="tl-ad" maxlength="5000" placeholder="Paste the advert here (job title, duties, person specification)."></textarea>
          </div>
          <div class="ai-actions"><button type="button" class="btn btn-sm" id="tl-go">Tailor my CV</button><button type="button" class="link-btn" id="tl-undo" hidden>Undo tailoring</button></div>
          <p class="hint" id="tl-msg" role="status" aria-live="polite">Counts as 1 of your 5 free uses today. Fill in your CV first.</p>
          <div class="tl-res" id="tl-res" hidden></div>
        </div>
      </details>
      <details class="fs" open>
        <summary>Personal details</summary>
        <div class="fs-body">
          <div class="fld"><span class="lab">Photo (optional)</span>
            <div class="photo-row">
              <div class="photo-prev" id="photo-prev" aria-hidden="true"></div>
              <input type="file" id="photo-file" accept="image/*" aria-label="Choose a photo">
              <button type="button" class="link-btn" id="photo-del" hidden>Remove photo</button>
            </div>
            <span class="hint">Not recommended for UK and US CVs: most employers prefer no photo.</span>
          </div>
          <div class="fld"><label for="f-name">Full name</label><input id="f-name" data-k="name" autocomplete="name"></div>
          <p class="hint" id="name-lock" hidden></p>
          <div class="fld"><label for="f-title">Job title or target role</label><input id="f-title" data-k="title" placeholder="E.g. Accountant, Web Developer"></div>
          <div class="row2">
            <div class="fld"><label for="f-email">Email</label><input id="f-email" data-k="email" type="email" autocomplete="email"></div>
            <div class="fld"><label for="f-phone">Phone</label><input id="f-phone" data-k="phone" type="tel" autocomplete="tel"></div>
          </div>
          <div class="row2">
            <div class="fld"><label for="f-city">Town or city</label><input id="f-city" data-k="city" autocomplete="address-level2"><span class="hint">No need for your full address.</span></div>
            <div class="fld"><label for="f-link">Link (LinkedIn, portfolio)</label><input id="f-link" data-k="link"></div>
          </div>
        </div>
      </details>

      <details class="fs" open>
        <summary>Personal profile</summary>
        <div class="fs-body">
          <div class="fld"><label for="f-summary">2 or 3 sentences about you</label><textarea id="f-summary" data-k="summary"></textarea><span class="hint">Who you are, what you are good at, what you are looking for.</span><button type="button" class="link-btn rw" data-rw="summary">Improve with AI</button></div>
        </div>
      </details>

      <details class="fs" open>
        <summary>Work experience</summary>
        <div class="fs-body"><div id="exp-list" style="display:grid;gap:14px"></div><button type="button" class="add" data-add="exp">Add a job</button></div>
      </details>

      <details class="fs">
        <summary>Education</summary>
        <div class="fs-body"><div id="edu-list" style="display:grid;gap:14px"></div><button type="button" class="add" data-add="edu">Add a qualification</button></div>
      </details>

      <details class="fs">
        <summary>Skills</summary>
        <div class="fs-body">
          <div class="fld"><label for="f-skills">Your skills</label><textarea id="f-skills" data-k="skills"></textarea><span class="hint">Separate them with commas.</span></div>
        </div>
      </details>

      <details class="fs">
        <summary>Languages</summary>
        <div class="fs-body"><div id="langs-list" style="display:grid;gap:14px"></div><button type="button" class="add" data-add="langs">Add a language</button></div>
      </details>

      <details class="fs">
        <summary>Interests</summary>
        <div class="fs-body">
          <div class="fld"><label for="f-hobbies">Your hobbies and interests</label><textarea id="f-hobbies" data-k="hobbies" style="min-height:70px"></textarea></div>
        </div>
      </details>
    </div>

    <div class="preview-col">
      <div class="preview-outer"><div class="preview-box" id="pbox"><div class="sheet t-moderne" id="sheet" aria-label="CV preview"></div></div></div>
      <p class="notice warn" id="pages-warn" hidden></p>
      <p class="notice warn" id="pass-msg" role="status" hidden></p>
      <div class="notice" id="acc-promo"><strong>Create a free account to keep your CV and edit it whenever you like.</strong> Optional: the PDF downloads without an account. <button type="button" class="btn btn-sm" id="acc-promo-btn">Create my free account</button></div>
      <p class="help">To save as a PDF: click "Download PDF", choose "Save as PDF" as the printer and untick "Headers and footers". The text in the PDF stays selectable, so applicant tracking systems (ATS) can read it.</p>
      <p class="help">Your draft is kept in this browser, and in your account if you save it. Only what you send to the AI ("Fill in with AI" or "Improve with AI") is sent off to be processed.</p>
    </div>
  </div>
</main>

''' + acc_dlg("Keep your CV and find it on all your devices", True) + f'''<dialog class="pass-dlg after-dlg" id="after-dlg" aria-labelledby="after-title">
  <form method="dialog">
    <h2 id="after-title">Your CV is ready ✅</h2>
    <p>Good luck with your application!</p>
    <div class="after-box">
      <h3>Write the cover letter</h3>
      <p>The AI writes a first draft of your cover letter from your CV and the job advert, in a few seconds.</p>
      <a class="btn btn-sm" href="/en/cover-letter/" id="after-jobs">Write my cover letter</a>
    </div>
    <div class="after-box" id="after-acc">
      <h3>Keep your CV online</h3>
      <p>With a free account, find and edit your CVs and cover letters on all your devices. No password: a sign-in link arrives by email.</p>
      <button type="button" class="btn btn-sm btn-ghost" id="after-acc-go">Create my free account</button>
    </div>
{DON_BOX}    <div class="pass-end"><button type="submit" class="btn btn-ghost btn-sm">No thanks</button></div>
  </form>
</dialog>

<dialog class="pass-dlg" id="fmt-dlg" aria-labelledby="fmt-title">
  <form method="dialog">
    <h2 id="fmt-title">Customise my CV</h2>
    <p class="hint">Each element has its own font. Leave "Template default" to keep the font of the template you chose.</p>
    <div class="fmt-list">
{fmt_row("Name", "n")}{fmt_row("Job title", "i")}{fmt_row("Section headings", "r")}{fmt_row("Jobs and qualifications", "p")}{fmt_row("Text", "t")}    </div>
    <div class="fmt-row"><span>Size</span><div class="seg"><button type="button" data-size="s" aria-pressed="false">Small</button><button type="button" data-size="" aria-pressed="true">Normal</button><button type="button" data-size="l" aria-pressed="false">Large</button></div></div>
    <div class="fmt-row"><span>Spacing</span><div class="seg"><button type="button" data-space="t" aria-pressed="false">Tight</button><button type="button" data-space="" aria-pressed="true">Normal</button><button type="button" data-space="a" aria-pressed="false">Airy</button></div></div>
    <div class="pass-end"><button type="button" class="btn btn-ghost btn-sm" id="fmt-reset">Reset everything</button><button type="submit" class="btn btn-sm">Done</button></div>
  </form>
</dialog>
<dialog class="pass-dlg tpl-dlg" id="tpl-dlg" aria-labelledby="tpl-title">
  <form method="dialog">
    <h2 id="tpl-title">All templates</h2>
    <p class="hint">Thirty-three templates, all free.</p>
    <div class="tpl-grid" id="tpl-grid"></div>
    <div class="pass-end"><button type="submit" class="btn btn-ghost btn-sm">Close</button></div>
  </form>
</dialog>

''' + FOOTER + f'''
<script src="/assets/en/render.js?v={V}"></script>
<script src="/assets/pass.js?v=20261113b"></script>
<script src="/assets/en/builder.js?v={V}"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="/assets/en/account.js?v={V}"></script>
<script src="/assets/en/aibar.js?v={V}" defer></script>
</body>
</html>
'''
write("/en/cv-builder/", builder)

# ---------------- Cover letter ----------------
letter = head("Free AI Cover Letter Generator (UK) | CVLibre",
    "Write a UK cover letter for free with AI: paste the job advert, add your background, get a first draft in seconds. Edit it and download it as a PDF.",
    "/en/cover-letter/", fr="/lettre-de-motivation/",
    ld={"@context": "https://schema.org", "@type": "WebApplication", "name": "CVLibre AI cover letter", "description": "AI writes a first draft of your cover letter from the job advert.", "url": "https://cvlibre.com/en/cover-letter/", "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "inLanguage": "en-GB", "offers": [{"@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "GBP"}]},
    extra='<link rel="stylesheet" href="/assets/letter.css?v=20261113b">\n<style>@media print { .sup { display: none !important; } }</style>\n') + "<body>\n" + HEADER + f'''
<main id="main" class="wrap lt">
  <h1>Cover letter with AI</h1>
  <p class="lead lt-lead">Enter the job and paste the advert. The AI writes a first draft based on your background. Read it, correct it, then download it as a PDF. The text is written by artificial intelligence: you remain responsible for what you send.</p>
  <div class="ai-budget" aria-live="polite"></div>
  <div class="lt-lock" id="lt-lock" hidden></div>
  <div class="lt-grid">
    <div class="lt-form">
      <section class="lt-card">
        <h2>The job</h2>
        <div class="fld"><label for="lt-job">Job you are applying for</label><input id="lt-job" maxlength="100" placeholder="E.g. Customer Service Assistant" autocomplete="off"></div>
        <div class="fld"><label for="lt-company">Company</label><input id="lt-company" maxlength="100" placeholder="E.g. Marks &amp; Spencer" autocomplete="off"></div>
        <div class="fld"><label for="lt-ad">Job advert (optional)</label><textarea id="lt-ad" rows="5" maxlength="4000" placeholder="Paste the advert here: the AI will use the skills it asks for."></textarea></div>
      </section>
      <section class="lt-card">
        <h2>Your background</h2>
        <div class="fld" id="lt-cvrow" hidden><label for="lt-cv">Start from one of my CVs</label><select id="lt-cv"><option value="">None, I will describe my background</option></select></div>
        <div class="fld"><label for="lt-profile">In a few lines</label><textarea id="lt-profile" rows="5" maxlength="2500" placeholder="E.g. Waiter for 3 years in Bristol, one year on the tills in a supermarket, BTEC in Business. I enjoy dealing with customers and working in a team."></textarea></div>
        <div class="fld"><label for="lt-tone">Tone</label><select id="lt-tone"><option value="classique">Professional</option><option value="dynamique">Enthusiastic</option><option value="sobre">Plain and direct</option></select></div>
        <button type="button" class="btn acc-big" id="lt-gen">Write my cover letter with AI</button>
        <p class="hint" id="lt-msg" role="status" aria-live="polite">The AI can make mistakes: read everything before you send it. Free: 5 AI uses a day, shared with the CV builder.</p>
      </section>
      <section class="lt-card" id="lt-result">
        <h2>Your cover letter</h2>
        <div class="fld"><label for="lt-name">Your name</label><input id="lt-name" maxlength="80" autocomplete="name"></div>
        <div class="fld"><label for="lt-contact">Your contact details</label><textarea id="lt-contact" rows="3" maxlength="300" placeholder="Address&#10;Phone&#10;Email"></textarea></div>
        <div class="fld"><label for="lt-rcpt">Recipient</label><textarea id="lt-rcpt" rows="3" maxlength="300" placeholder="Company name&#10;Address"></textarea></div>
        <input type="hidden" id="lt-city">
        <div class="fld"><label for="lt-subject">Subject line</label><input id="lt-subject" maxlength="150" placeholder="Application for the role of ..."></div>
        <div class="fld"><label for="lt-body">Letter text</label><textarea id="lt-body" rows="14" maxlength="6000"></textarea></div>
      </section>
      <section class="lt-card">
        <h2>Save</h2>
        <div class="fld"><label for="lt-title">Name of this letter (only you see it)</label><input id="lt-title" maxlength="60" placeholder="E.g. Letter for Tesco"></div>
        <div class="lt-actions">
          <button type="button" class="btn" id="lt-print">Download PDF</button>
          <button type="button" class="btn btn-ghost" id="lt-save">Save to my account</button>
          <button type="button" class="btn btn-ghost" id="lt-new">New cover letter</button>
        </div>
        <p class="hint" id="lt-save-msg" role="status" aria-live="polite">To download the PDF or save the letter, you just need a free account.</p>
      </section>
    </div>
    <div class="lt-prev"><div class="lt-box" id="lt-box"><div class="lt-sheet" id="lt-sheet" aria-label="Cover letter preview"></div></div></div>
  </div>
  <div class="free-note"><p><strong>CVLibre is free.</strong> The site is funded by advertising and by the optional CVLibre Pass: no ads and 50 AI uses a day instead of 5, one payment for 3 months.</p><p><a class="btn btn-sm" href="/en/my-account/?pass=1" data-pass>Discover the Pass</a></p></div>
</main>
''' + FOOTER + "\n" + acc_dlg("Keep your documents and find them on all your devices", False) + f'''
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>
<script src="/assets/pass.js?v=20261113b"></script>
<script src="/assets/en/auth.js?v={V}"></script>
<script src="/assets/en/letter.js?v={V}"></script>
<script src="/assets/en/aibar.js?v={V}" defer></script>
</body>
</html>
'''
write("/en/cover-letter/", letter)

# ---------------- Home ----------------
FAQ = [
    ("Is it really free?", "Yes, 100%. All templates, PDFs without a watermark and the AI tools are free, with no card needed. A free account (an email address, no password) is optional: it keeps your CVs and cover letters online. CVLibre is funded by advertising and by the optional CVLibre Pass."),
    ("Is my information sent anywhere?", "No, unless you choose to use the AI. Your CV is built on your device. Only the text or file you choose to send to the AI is sent off to be processed, and we do not keep it."),
    ("Should I put a photo on my CV?", "In the UK, Ireland and the US, no: most employers prefer CVs without a photo, to avoid any bias. The photo is optional in CVLibre and the templates look good without one."),
    ("How long should a CV be?", "Two A4 pages is the usual maximum in the UK. One page is fine for students, school leavers and people with little experience. CVLibre warns you if your CV goes over two pages."),
    ("What is an ATS-friendly CV?", "An ATS (applicant tracking system) is software that sorts applications. An ATS-friendly CV contains real text, clear section headings and no images in place of text. All CVLibre templates work this way."),
    ("How do I save the PDF?", "Click \"Download PDF\", choose \"Save as PDF\" instead of a printer, and untick \"Headers and footers\" for a clean result."),
]
TPL = [("moderne", "Modern"), ("classique", "Classic"), ("duo", "Duo"), ("affiche", "Poster"), ("editorial", "Editorial"), ("sobre", "Simple"), ("vertical", "Vertical"), ("monogramme", "Monogram"), ("geometrie", "Geometric"), ("sombre", "Dark"), ("retro", "Retro"), ("elegant", "Elegant")]
home = head("Free CV Builder with AI: Make a CV Online, Download PDF | CVLibre",
    "Make your CV for free with AI: it fills it in from your old CV, improves your wording and tailors it to every job. 33 templates, PDF with no watermark, no sign-up.",
    "/en/", fr="/",
    ld={"@context": "https://schema.org", "@graph": [
        {"@type": "WebApplication", "name": "CVLibre", "url": "https://cvlibre.com/en/", "applicationCategory": "BusinessApplication", "operatingSystem": "All", "inLanguage": "en-GB", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "GBP"}, "description": "Free online CV builder with AI: ATS-friendly templates, PDF download, data kept in your browser."},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}]}) + "<body>\n" + HEADER + '''
<main id="main">
  <section class="hero">
    <div class="wrap hero-in">
      <div>
        <p class="hero-kicker">✨ 100% free, with artificial intelligence</p>
        <h1>Make your CV with AI, for free.</h1>
        <p class="lead">Upload your old CV or describe your background in a few lines: the AI fills in your CV, improves your wording and tailors it to every job advert. You check it, pick one of 33 templates and download it as a PDF.</p>
        <div class="hero-cta">
          <a class="btn" href="/en/cv-builder/">Create my CV for free</a>
          <a class="btn btn-ghost" href="#ai">What the AI does</a>
        </div>
        <p class="hero-note"><strong>Really free:</strong> no sign-up, no subscription, no card, no watermark. The AI is free, 5 times a day.</p>
      </div>
      <div class="hero-shot"><div class="shot-frame" id="shot" aria-label="Example of a CV made with CVLibre" role="img"><div class="sheet-scale"><div class="sheet t-moderne" id="shot-sheet"></div></div></div></div>
    </div>
  </section>

  <section class="section ai-sec" id="ai">
    <div class="wrap">
      <h2>Free AI that does the heavy lifting</h2>
      <p class="lead-s">Four AI tools, free and with no sign-up, built into the CV builder. On many other sites, AI is only for paying subscribers.</p>
      <div class="ai-grid">
        <div class="ai-card"><span class="ai-ico" aria-hidden="true">📄</span><h3>Fill in your CV in one click</h3><p>Add your old CV (PDF or photo) or write a few lines about your background. The AI puts everything in the right place: jobs, education, skills, languages.</p></div>
        <div class="ai-card"><span class="ai-ico" aria-hidden="true">✍️</span><h3>Improve your wording</h3><p>A button next to each text turns your sentences into clear achievements with strong action verbs, without making anything up.</p></div>
        <div class="ai-card"><span class="ai-ico" aria-hidden="true">🎯</span><h3>Tailor your CV to a job</h3><p>Paste a job advert: the AI adjusts your title, profile and skills to the role and shows you the missing keywords. You tick what you keep.</p></div>
        <div class="ai-card"><span class="ai-ico" aria-hidden="true">💌</span><h3>Write your cover letter</h3><p>From your CV and the advert, the AI writes a personalised UK-style cover letter in seconds, in the tone you choose.</p></div>
      </div>
      <div class="ai-budget" aria-live="polite"></div>
      <p class="ai-note">The AI never adds jobs or qualifications: it only works with what you give it. Always read the result before you apply.</p>
      <p><a class="btn" href="/en/cv-builder/">Use the AI for free, no sign-up</a></p>
    </div>
  </section>

  <section class="section gal-sec" id="templates">
    <div class="wrap">
      <h2>33 CV templates, all free</h2>
      <p class="lead-s">Classic, modern or creative. Click a template to start with it: you can change it at any time.</p>
      <div class="gal" id="gal">
''' + "".join(f'        <a class="gal-card" href="/en/cv-builder/?modele={k}" data-tpl="{k}"><span class="gal-thumb"></span><span class="gal-name">{n}</span></a>\n' for k, n in TPL) + '''      </div>
      <p><a class="btn btn-ghost" href="/en/cv-builder/?modeles=1">See all 33 templates</a></p>
    </div>
  </section>

  <section class="section" id="how">
    <div class="wrap">
      <h2>Three steps, ten minutes</h2>
      <ol class="steps">
        <li><h3>Let the AI fill in your CV</h3><p>Upload your old CV or describe your background: the AI fills in the form. You can also type everything yourself, with an example to guide you.</p></li>
        <li><h3>Choose a template and a colour</h3><p>33 templates, from the most classic to the most creative. The change is instant and your text stays put.</p></li>
        <li><h3>Download the PDF</h3><p>An A4 file with real text, ready to attach to your application or upload to a job site.</p></li>
      </ol>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div>
        <h2>Built to get through applicant tracking systems</h2>
        <p>Many employers use software (an ATS) to read applications before a person opens them. A badly built CV can be misread or even unreadable.</p>
        <p>CVLibre templates stay simple: the text in the PDF is real text, not an image, and each section has a clear heading.</p>
      </div>
      <ul class="checks">
        <li><b>Selectable text.</b> Nothing is turned into an image.</li>
        <li><b>Standard headings.</b> Work experience, Education, Skills.</li>
        <li><b>Common fonts</b> and readable sizes, with no effects that confuse the software.</li>
        <li><b>A warning</b> when your CV goes over two pages.</li>
      </ul>
    </div>
  </section>

  <section class="section" id="pricing">
    <div class="wrap">
      <h2>100% free, for everyone</h2>
      <div class="plans">
        <div class="plan plan-main">
          <h3>Everything is free</h3>
          <p class="plan-price">£0</p>
          <ul>
            <li>33 CV templates and customisation (fonts, size, spacing)</li>
            <li>PDFs with no banner or watermark</li>
            <li>AI: fill in, improve, tailor to a job and write cover letters (5 uses a day)</li>
            <li>Up to 20 CVs and 30 cover letters kept online with a free account</li>
          </ul>
          <a class="btn" href="/en/cv-builder/">Create my CV</a>
        </div>
        <div class="plan">
          <h3>How is it funded?</h3>
          <p>CVLibre is funded by advertising and by the optional CVLibre Pass, a one-time payment for 3 months.</p>
          <p>The Pass removes ads and gives you 50 AI uses a day, your CV tailored to each job, an ATS score, CV translation and 20 saved CVs.</p>
          <a class="btn btn-ghost" href="/en/my-account/?pass=1" data-pass>Discover the Pass</a>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="faq">
    <div class="wrap faq">
      <h2>Frequently asked questions</h2>
''' + "".join(f"      <details><summary>{q}</summary><p>{a}</p></details>\n" for q, a in FAQ) + '''    </div>
  </section>

  <section class="cta-band">
    <div class="wrap">
      <h2>Your free AI CV, ready before your next cup of tea.</h2>
      <a class="btn" href="/en/cv-builder/">Create my CV for free</a>
    </div>
  </section>
</main>
''' + FOOTER + f'''
<script src="/assets/en/render.js?v={V}"></script>
<script>
(function () {{
  var sheet = document.getElementById("shot-sheet"), frame = document.getElementById("shot");
  sheet.style.setProperty("--acc", CVR.sample.accent);
  sheet.innerHTML = CVR.render(CVR.sample);
  var scaler = sheet.parentNode;
  function fit() {{ var k = frame.clientWidth / sheet.offsetWidth; scaler.style.transform = "scale(" + k + ")"; }}
  fit(); window.addEventListener("resize", fit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  var gal = document.getElementById("gal"), drawn = false;
  function draw() {{
    if (drawn) return; drawn = true;
    var html = CVR.render(CVR.sample);
    [].forEach.call(gal.querySelectorAll(".gal-card"), function (c) {{
      var th = c.querySelector(".gal-thumb"), sh = document.createElement("div");
      sh.className = "sheet t-" + c.getAttribute("data-tpl"); sh.style.setProperty("--acc", CVR.sample.accent); sh.setAttribute("aria-hidden", "true"); sh.innerHTML = html; th.appendChild(sh);
    }});
    gfit();
  }}
  function gfit() {{ [].forEach.call(gal.querySelectorAll(".gal-thumb"), function (th) {{ var sh = th.firstChild; if (sh) sh.style.transform = "scale(" + (th.clientWidth / sh.offsetWidth) + ")"; }}); }}
  if ("IntersectionObserver" in window) {{ var io = new IntersectionObserver(function (es) {{ if (es.some(function (e) {{ return e.isIntersecting; }})) {{ draw(); io.disconnect(); }} }}, {{ rootMargin: "400px" }}); io.observe(gal); }} else draw();
  window.addEventListener("resize", function () {{ if (drawn) gfit(); }});
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () {{ if (drawn) gfit(); }});
}})();
</script>
<script src="/assets/en/aibar.js?v={V}" defer></script>
</body>
</html>
'''
write("/en/", home)

# ---------------- Text pages ----------------
def text_page(path, title, desc, h1, body, fr=None, robots="index, follow"):
    write(path, head(title, desc, path, fr=fr, robots=robots) + "<body>\n" + HEADER + f'''
<main id="main" class="wrap doc">
  <h1>{h1}</h1>
{body}
</main>
''' + FOOTER + "</body>\n</html>\n")

text_page("/en/support/", "Support CVLibre | CVLibre", "CVLibre is a 100% free CV builder. A donation, even a small one, helps pay for the AI and keep the site free for everyone.",
    "Support CVLibre", f'''  <p class="lead">CVLibre is 100% free, for everyone: all templates, PDFs with no watermark and the AI tools. Nothing is for sale.</p>
  <p>The site is funded by advertising and by your support. Every AI use (filling in a CV, improving a text, tailoring a CV, writing a cover letter) really costs us money. A donation, even £1, helps us keep the AI free for everyone.</p>
  <p>A donation does not unlock anything: everything stays free, whether you donate or not. Thank you ❤️</p>
{DON_BTN}''', fr="/soutenir/")

# 13 nov 2026 (Jeremy) : page Publicité et partenariats, contact par e-mail
text_page("/en/advertise/", "Advertising and partnerships | CVLibre", "Advertisers, schools, training providers, HR tools: reach job seekers while they write their CV. Advertising, sponsored articles and partnerships on CVLibre.",
    "Advertising and partnerships", '''  <p class="lead">CVLibre is a free CV and cover letter builder used in the UK, the United States, Canada, Australia, New Zealand, Germany and France. Our visitors are looking for a job, an apprenticeship or a course, and they are with us at the moment they take action.</p>
  <h2>What we offer</h2>
  <ul>
    <li><strong>Sponsored article</strong>: a genuinely useful guide on our blog, written with you and clearly labelled as a partnership.</li>
    <li><strong>Featured placement</strong>: your offer or service shown on the pages that match it (jobs, cover letters, CV advice).</li>
    <li><strong>Partnership</strong>: schools, training providers, recruitment agencies, job boards, tools for job seekers. We build an offer together that really helps our visitors.</li>
    <li><strong>Affiliate</strong>: a tracked link to your service, paid on performance.</li>
  </ul>
  <h2>Our rules</h2>
  <p>Sponsored content is always labelled as such. We turn down misleading offers, jobs or courses that charge candidates to apply, and anything unlawful. We never sell or share our users' CVs or data.</p>
  <h2>Contact us</h2>
  <p>Write us a few lines: your company, what you would like to promote, the countries you are targeting and an indicative budget. We will reply with a proposal and up-to-date audience figures.</p>
  <p><a class="btn" href="mailto:contact@cvlibre.com?subject=Advertising%20%2F%20partnership%20CVLibre&body=Hello%2C%0A%0ACompany%3A%20%0AWebsite%3A%20%0AType%20of%20partnership%3A%20%0ACountries%3A%20%0AIndicative%20budget%3A%20%0A%0A">Email contact@cvlibre.com</a></p>
  <p class="hint">Hiring? Posting jobs is free on the <a href="/en/recruiters/">Recruiters</a> page.</p>''', fr="/publicite/")

text_page("/en/legal-notice/", "Legal notice | CVLibre", "Legal notice for CVLibre, the free online CV builder.", "Legal notice", '''  <h2>Publisher</h2>
  <p>CVLibre is published on a personal basis by Jérémy Dacier-Jury.<br>Address: 9 passage des Tisserands, 38790 Charantonnay, France<br>Contact email: contact@cvlibre.com</p>
  <p>Publication director: Jérémy Dacier-Jury.</p>
  <h2>Hosting</h2>
  <p>The site is hosted by GitHub, Inc., 88 Colin P. Kelly Jr. Street, San Francisco, CA 94107, United States (GitHub Pages). Accounts and saved CVs are hosted by Supabase (European Union region).</p>
  <h2>Intellectual property</h2>
  <p>The texts, code and templates of the site are protected. The CVs you create belong entirely to you: we have no access to them while they stay in your browser, and only you can see the ones you save to your account.</p>
  <h2>Liability</h2>
  <p>CVLibre is a layout tool. You remain responsible for the content of your CV and for the accuracy of the information in it. The service comes with no guarantee of results in your job search.</p>
  <h2>Personal data</h2>
  <p>See the <a href="/en/privacy/">privacy page</a>. This English version is provided for convenience; the French version of the legal pages prevails.</p>''', fr="/mentions-legales/")

text_page("/en/privacy/", "Privacy | CVLibre", "How CVLibre handles your data: your CV stays in your browser, the account is optional, and the AI only receives what you choose to send.", "Privacy", '''  <p class="lead">In short: you build your CV freely and it stays in your browser. The PDF downloads without an account. A free account (email, no password) is optional and keeps your CV online. Your CV is only sent to our servers if you save it to your account. The AI option and advertising are described below.</p>
  <h2>What your CV contains</h2>
  <p>The information you enter (identity, contact details, photo, background) is only used to display and print your CV. It only leaves your device if you save the CV to your account, or for the AI option.</p>
  <h2>The AI option</h2>
  <p>If you use "Fill in with AI", "Improve with AI", "Tailor my CV" or the cover letter, the text or file (PDF, photo) you provide (and, for tailoring, the job advert and the texts of your CV) is sent to our service, which passes it to an Anthropic AI model to produce the result. We do not store it and it is not linked to any account. Your IP address is only used to limit the number of uses per day and is kept in memory for the day. Processing by Anthropic is subject to its own privacy policy. Do not send documents that are not your CV (for example, identity documents).</p>
  <h2>Usage statistics</h2>
  <p>We count page views and a few actions (PDF download, template chosen, AI use) anonymously. No cookie is set, no identifier is created, neither your IP address nor the content of your CV is recorded in these statistics, and nothing lets us recognise you from one visit to the next. Only the page name, the action, the referring site and the type of device (mobile or computer) are kept. If your browser sends a "Do Not Track" signal, we count nothing.</p>
  <h2>The account</h2>
  <p>A free account is optional: it keeps your CVs online. We store your email address and the CVs and letters you choose to save, in a database hosted by Supabase (European Union region, Paris). You sign in with a link sent by email, through the Resend email service. Your saved CVs are only visible to you. You can delete each CV, or your whole account with all your CVs, at any time from "My account": deletion is immediate and permanent. We keep your data for as long as your account exists.</p>
  <h2>What is stored on your device</h2>
  <p>So that you can come back to your draft, a copy is kept in your browser's local storage (localStorage), along with your session if you are signed in, and your choice about advertising cookies. You can clear the draft with the "Start from scratch" button, or by clearing the site's data in your browser. If you use a shared computer, remember to do so.</p>
  <h2>Advertising and cookies</h2>
  <p>CVLibre is free thanks to advertising, shown by Google AdSense, and to the optional CVLibre Pass. Payment for the Pass is handled entirely by Gumroad: CVLibre never receives your bank details, only the purchase confirmation, the email address used and your account ID to activate the Pass. On your first visit, a banner asks whether you accept advertising cookies. No ads are requested before you choose. If you accept, Google may use cookies to show and measure personalised ads. If you decline, Google only shows non-personalised ads. Your choice is kept for 6 months in your browser and you can change it at any time with the "Cookies" link at the bottom of each page. Ads never appear in your PDFs and never have access to the content of your CV. Processing by Google is subject to its own privacy policy.</p>
  <p>Our usage statistics use no cookies. Fonts are hosted on the site. The other services (AI, Supabase, Resend) are only called if you use the matching feature.</p>
  <h2>Your rights</h2>
  <p>Under the GDPR (and the UK GDPR), you can access, correct or delete your data at any time: directly from "My account" for your CVs and your account, or by writing to contact@cvlibre.com. You can also complain to the French data protection authority, the CNIL (cnil.fr), or, in the UK, to the ICO (ico.org.uk).</p>''', fr="/confidentialite/")

text_page("/en/terms/", "Terms of use | CVLibre", "Terms of use of CVLibre, the free online CV builder with AI.", "Terms of use", '''  <p>Last updated: 13 November 2026.</p>
  <h2>A free service</h2>
  <p>CVLibre lets you create a CV and a cover letter and download them as PDFs, for free, with no card. Everything is open to everyone: the 33 CV templates, customisation (fonts, size, spacing), PDFs with no banner or watermark, and the AI tools.</p>
  <p>CVLibre is funded by advertising and by the optional CVLibre Pass.</p>
  <h2>The CVLibre Pass</h2>
  <p>The Pass is a one-time payment for 3 months or 1 year, with no subscription and no automatic renewal. It gives you 50 AI uses a day instead of 5, CV tailoring to a job ad, an ATS score, CV translation, up to 20 saved CVs instead of one, and browsing with no ads. It is linked to the CVLibre account used to buy it and is activated as soon as payment is received.</p>
  <p>Payment is handled by Gumroad, which sells the Pass as merchant of record: Gumroad takes the payment, applies any sales tax or VAT and provides the receipt and invoice. For any question about the Pass or a refund request: contact@cvlibre.com.</p>
  <h2>The free account</h2>
  <p>An account is optional. It keeps up to 20 CVs and 30 cover letters online so you can find them on all your devices. You can delete each document, or your whole account, at any time.</p>
  <h2>Artificial intelligence</h2>
  <p>The AI helps you fill in a CV, improve a text, tailor a CV to a job advert and write a cover letter. Each use has a real cost for us: to keep the service free, it is limited to 5 uses per day per person, and it may be temporarily unavailable when demand is high. The AI can make mistakes: always read and correct the result. You remain responsible for what you send.</p>
  <h2>Fair use</h2>
  <p>Do not use CVLibre to create misleading documents or documents in someone else's name without their consent, or to send the AI documents that are not a CV (for example, identity documents). We may limit access in case of abuse.</p>
  <h2>Liability</h2>
  <p>CVLibre is provided as is. We do our best to make it work well, but we guarantee neither the outcome of an application nor uninterrupted availability. Keep a copy of your documents (file export or PDF).</p>
  <h2>Contact and governing law</h2>
  <p>Any questions? Use the Help button or write to contact@cvlibre.com. These terms are governed by French law. This English version is provided for convenience; the French version prevails. See also the <a href="/en/privacy/">privacy policy</a> and the <a href="/en/legal-notice/">legal notice</a>.</p>''', fr="/cgv/")
