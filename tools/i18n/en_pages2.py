"""Pages anglaises, partie 2 : My account, Recruiters, Jobs, Letters. Lancer : python3 tools/i18n/en_pages2.py (relance aussi en_pages.py)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from en_pages import head, HEADER, FOOTER, acc_dlg, write, V

SB = '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js"></script>\n<script src="/assets/pass.js?v=20261113b"></script>\n<script src="/assets/en/auth.js?v=' + V + '"></script>\n'
LETTER_CSS = '<link rel="stylesheet" href="/assets/letter.css?v=20261113b">\n'
MODE = lambda cur: '  <nav class="mode-sw" hidden aria-label="Choose my area"><a href="/en/my-account/"%s>👤 Candidate</a><a href="/en/recruiters/"%s>🏢 Recruiter</a></nav>\n' % ((' aria-current="page"', '') if cur == "c" else ('', ' aria-current="page"'))
DLG = acc_dlg("Keep your documents and find them on all your devices", False)

# ---------------- My account ----------------
write("/en/my-account/", head("My account | CVLibre", "Your saved CVs and cover letters on CVLibre.", "/en/my-account/", fr="/mon-espace/", extra=LETTER_CSS, robots="noindex, follow") + "<body>\n" + HEADER + '''
<main id="main" class="wrap sp">
''' + MODE("c") + '''  <h1>My account</h1>
  <p class="lead" id="sp-who">Loading...</p>
  <div id="sp-out" hidden>
    <p>Sign in to find your CVs and cover letters.</p>
    <p><button type="button" class="btn" id="sp-login">Sign in</button></p>
  </div>
  <div id="sp-in" hidden>
    <section class="lt-card sp-sec" id="sp-offer">
      <div class="sp-head"><h2>CVLibre is free</h2><a class="btn btn-sm" href="/en/support/">Support CVLibre</a></div>
      <p class="hint">Everything is open: 33 templates, customisation, PDFs with no watermark, AI cover letters, and up to 20 CVs and 30 cover letters kept online. The site is funded by advertising and voluntary donations. Every AI use costs us money: donations really help. Thank you ❤️</p>
    </section>
    <section class="lt-card sp-sec">
      <div class="sp-head"><h2>My CVs</h2><a class="btn btn-sm" href="/en/cv-builder/">Create a CV</a></div>
      <div class="sp-list" id="sp-cvs"></div>
    </section>
    <section class="lt-card sp-sec">
      <div class="sp-head"><h2>My cover letters</h2><a class="btn btn-sm" href="/en/cover-letter/">Write a cover letter</a></div>
      <div class="sp-list" id="sp-letters"></div>
    </section>
    <section class="lt-card sp-sec">
      <div class="sp-head"><h2>My account</h2><button type="button" class="btn btn-ghost btn-sm" id="sp-out-btn">Sign out</button></div>
      <p class="hint">Deleting your account permanently erases your saved CVs and cover letters. This cannot be undone. Any questions? <a href="mailto:contact@cvlibre.com">contact@cvlibre.com</a>.</p>
      <p><button type="button" class="btn btn-ghost btn-sm" id="sp-del">Delete my account</button></p>
      <p class="hint" id="sp-del-msg" role="status" aria-live="polite" hidden></p>
    </section>
  </div>
</main>
''' + FOOTER + "\n" + DLG + "\n" + SB + '<script src="/assets/en/space.js?v=' + V + '"></script>\n</body>\n</html>\n')

# ---------------- Recruiters ----------------
CONTRACTS = "".join("<option>%s</option>" % c for c in ["Permanent", "Fixed-term contract", "Temporary", "Seasonal", "Apprenticeship", "Internship", "Freelance"])
write("/en/recruiters/", head("Post a Job for Free in the UK | CVLibre", "UK employers: post your job ads for free on CVLibre. Each job is checked before going live and stays online for 60 days. Candidates apply directly to you.", "/en/recruiters/", fr="/recruteurs/", extra=LETTER_CSS) + "<body>\n" + HEADER + '''
<main id="main" class="wrap sp rc">
''' + MODE("r") + '''  <h1>Recruiters: post your jobs for free</h1>
  <p class="lead">Your jobs appear at the top of the search results on CVLibre, in front of candidates who are preparing their CV and cover letter. Each candidate can tailor their CV to your advert in one click.</p>
  <ul class="rc-perks">
    <li><strong>Free</strong>: no fee to post, online for 60 days.</li>
    <li><strong>Checked</strong>: every job is reviewed by CVLibre before it goes live, to protect candidates.</li>
    <li><strong>Simple</strong>: candidates apply directly to you, through your link or your email.</li>
  </ul>
  <div id="rc-out" hidden>
    <p>Sign in to post a job. No password: a sign-in link arrives by email.</p>
    <p><button type="button" class="btn" id="rc-login">Sign in or create my account</button></p>
  </div>
  <div id="rc-in" hidden>
    <p class="hint" id="rc-who"></p>
    <section class="lt-card sp-sec">
      <h2 id="rc-form-title">Post a job</h2>
      <form id="rc-form" novalidate>
        <div class="rc-grid">
          <div class="fld"><label for="rc-company">Company *</label><input id="rc-company" maxlength="120" required autocomplete="organization"></div>
          <div class="fld" hidden><label for="rc-siret">Company number</label><input id="rc-siret" maxlength="17"></div>
          <div class="fld"><label for="rc-title">Job title *</label><input id="rc-title" maxlength="120" required placeholder="E.g. Bakery Sales Assistant"></div>
          <div class="fld"><label for="rc-city">Town or city *</label><input id="rc-city" maxlength="80" required placeholder="E.g. Leeds" autocomplete="address-level2"></div>
          <div class="fld"><label for="rc-contract">Contract *</label><select id="rc-contract">''' + CONTRACTS + '''</select></div>
          <div class="fld"><label for="rc-hours">Hours</label><input id="rc-hours" maxlength="60" placeholder="E.g. 37.5 hours, part-time 20 hours"></div>
          <div class="fld"><label for="rc-salary">Salary</label><input id="rc-salary" maxlength="80" placeholder="E.g. £24,000 a year or £12.50 an hour"></div>
          <div class="fld"><label for="rc-contact">Contact name</label><input id="rc-contact" maxlength="80" autocomplete="name"></div>
        </div>
        <div class="fld"><label for="rc-desc">Job description * (duties, person specification, benefits)</label><textarea id="rc-desc" rows="9" maxlength="6000" required></textarea></div>
        <div class="rc-grid">
          <div class="fld"><label for="rc-url">Link to apply</label><input id="rc-url" type="url" maxlength="400" placeholder="https://..."></div>
          <div class="fld"><label for="rc-email">or email to receive applications</label><input id="rc-email" type="email" maxlength="160" autocomplete="email"></div>
        </div>
        <label class="rc-ok"><input type="checkbox" id="rc-legal"><span>I confirm that this job is real and open, that the advert complies with the law (no discrimination, no fees charged to candidates) and I accept the <a href="/en/terms/" target="_blank">terms of use</a>.</span></label>
        <p><button type="submit" class="btn" id="rc-send">Send for review</button> <button type="button" class="link-btn" id="rc-cancel" hidden>Cancel editing</button></p>
        <p class="hint" id="rc-msg" role="status" aria-live="polite"></p>
      </form>
    </section>
    <section class="lt-card sp-sec">
      <h2>My jobs</h2>
      <div class="sp-list" id="rc-list"></div>
    </section>
  </div>
  <p class="hint">Any questions? <a href="mailto:contact@cvlibre.com">contact@cvlibre.com</a>. CVLibre may refuse or remove a misleading, illegal or discriminatory job.</p>
</main>
''' + FOOTER + "\n" + DLG + "\n" + SB + '<script src="/assets/en/recruteurs.js?v=' + V + '"></script>\n</body>\n</html>\n')

# ---------------- Jobs ----------------
write("/en/jobs/", head("Jobs Near You in the UK: Search and Tailor Your CV | CVLibre", "Search thousands of UK jobs by job title and town. For each job, tailor your CV and write your cover letter with free AI.", "/en/jobs/", fr="/offres-emploi/", extra=LETTER_CSS + '<link rel="stylesheet" href="/assets/offres.css?v=20261113c">\n') + "<body>\n" + HEADER + '''
<main id="main" class="wrap jb">
  <h1>Jobs near you</h1>
  <p class="lead">Search by job title and town. For each job, CVLibre helps you tailor your CV and write your cover letter, for free.</p>
  <a class="jb-rcb" href="/en/recruiters/"><span class="jb-rcb-i" aria-hidden="true">📣</span><span class="jb-rcb-t"><strong>Hiring?</strong> Post your job for free, it appears at the top of the results.</span><span class="jb-rcb-go">Post a job</span></a>
  <form class="jb-form lt-card" id="jb-form" role="search">
    <div class="fld"><label for="jb-q">Job title or keyword</label><input id="jb-q" maxlength="80" placeholder="E.g. sales assistant, care worker, forklift driver" autocomplete="off" enterkeyhint="search"></div>
    <div class="fld"><label for="jb-ville">Town, city or postcode</label><input id="jb-ville" maxlength="60" placeholder="E.g. Manchester" autocomplete="address-level2"></div>
    <div class="fld"><label for="jb-contrat">Contract</label><select id="jb-contrat"><option value="">All</option><option value="CDI">Permanent</option><option value="CDD">Contract</option><option value="MIS">Temporary</option><option value="SAI">Seasonal</option><option value="ALT">Apprenticeship</option></select></div>
    <button type="submit" class="btn" id="jb-go">Find jobs</button>
  </form>
  <p class="jb-count" id="jb-count" hidden></p>
  <p class="hint" id="jb-msg" role="status" aria-live="polite"></p>
  <div class="jb-list" id="jb-list"></div>
  <p><button type="button" class="btn btn-ghost" id="jb-more" hidden>Show more jobs</button></p>
  <p class="jb-src">Jobs provided by <a href="https://www.careerjet.co.uk/" target="_blank" rel="noopener">Careerjet</a>, a job search engine. The posting date is shown on each job. CVLibre is not the employer and does not receive applications: you apply directly on the job's website.</p>
  <p class="jb-rc">Hiring? <a href="/en/recruiters/">Post your job for free</a>: it will appear at the top of the results.</p>
  <section class="jb-how">
    <h2>Apply faster with CVLibre</h2>
    <p><strong>Tailor my CV</strong> opens your CV with the job advert already pasted in: the AI rewords your title, profile and duties with the words of the advert and spots the skills you are missing. You choose what to keep.</p>
    <p><strong>Cover letter</strong> prepares a letter for this job and this company, from the advert and your background.</p>
    <p>No CV yet? <a href="/en/cv-builder/">Create it for free</a> in a few minutes.</p>
  </section>
</main>
''' + FOOTER + '<script src="/assets/en/offres.js?v=' + V + '"></script>\n</body>\n</html>\n')

# ---------------- Letters ----------------
LETTERS = [
    ("/en/resignation-letter/", "/lettre-de-demission/", "resignation", "1", "Resignation Letter Template (UK): Free, with AI | CVLibre",
     "Write your UK resignation letter in 2 minutes: free template or AI, notice period, last working day and a PDF ready to send. No sign-up.",
     "Resignation letter: free UK template with AI", "Enter your job and your company: the AI writes a clear, polite resignation letter, or use our free template. You read it through, then download it as a PDF.", "Your situation", True,
     '''    <h2>What to include in a resignation letter</h2>
    <ul><li>The date.</li><li>A clear sentence saying that you are resigning from your role.</li><li>Your notice period and your expected last working day.</li><li>A short thank you and an offer to help with the handover.</li><li>Your signature.</li></ul>
    <p>You do not have to give a reason for leaving. Keep the letter short, positive and factual: you may need a reference from this employer one day.</p>
    <h2>How much notice do I need to give?</h2>
    <p>Check your employment contract first: it usually sets your notice period. If your contract says nothing, the legal minimum in the UK is one week once you have worked for your employer for at least one month. Your employer can agree to a shorter notice period, but they do not have to.</p>
    <h2>Should I resign in person or by email?</h2>
    <p>It is good practice to tell your manager in person or by phone first, then confirm in writing the same day. A letter or an email both work, as long as your contract does not require a specific format. Keep a copy.</p>
    <h2>Frequently asked questions</h2>
    <h3>Do I have to explain why I am leaving?</h3><p>No. A simple, polite letter is enough. You can share your reasons in a conversation if you wish.</p>
    <h3>What is a P45?</h3><p>It is the document your employer gives you when you leave. It shows your pay and the tax deducted this tax year. You give it to your next employer.</p>
    <h3>Can I take holiday during my notice period?</h3><p>It depends on your contract and on your employer's agreement. Unused holiday is usually paid in your final pay.</p>
    <p class="ct-legal">This information is general and is not legal advice. Check your contract, or see <a href="https://www.gov.uk/resign-from-job" target="_blank" rel="noopener">gov.uk</a> and <a href="https://www.acas.org.uk/" target="_blank" rel="noopener">Acas</a>.</p>''',
     [("How much notice do I need to give?", "Check your contract first. If it says nothing, the legal minimum in the UK is one week once you have worked for at least one month."), ("Do I have to explain why I am leaving?", "No. A simple, polite letter is enough.")]),
    ("/en/interview-follow-up-email/", "/relance-apres-entretien/", "followup", "0", "Thank You Email After an Interview: Free Template with AI | CVLibre",
     "Write a short, polite follow-up email after your job interview: free template or AI, ready to copy or open in your email app.",
     "Follow-up email after an interview", "Enter the job and the company: the AI writes a short thank-you email to send after your interview, or use our free template.", "Your interview", False,
     '''    <h2>When to send a follow-up email</h2>
    <p>Send a short thank-you email within 24 hours of your interview. If you have heard nothing after the date they gave you, a polite follow-up about a week later is fine.</p>
    <h2>What to write</h2>
    <ul><li>Thank them for their time, with the date of the interview.</li><li>Mention one thing you discussed that confirms your interest.</li><li>Ask politely about the next steps.</li></ul>
    <p>Keep it to a few lines. The goal is to leave a good impression, not to repeat your whole application.</p>''',
     [("When should I send a thank-you email after an interview?", "Within 24 hours. If you hear nothing after the date they gave you, follow up politely about a week later.")]),
    ("/en/job-application-email/", "/mail-de-candidature/", "application", "0", "Job Application Email: Free Template with AI | CVLibre",
     "Write the email that goes with your CV and cover letter: free template or AI, with the right subject line. Ready to copy or open in your email app.",
     "Job application email", "Enter the job, the company and your strengths: the AI writes a short email to send with your CV and cover letter, or use our free template.", "Your application", False,
     '''    <h2>How to write a job application email</h2>
    <ul><li>A clear subject line: "Application for [job title] - [your name]".</li><li>One sentence saying which job you are applying for and where you saw it.</li><li>Two or three strengths that match the job.</li><li>A mention of your attached CV and cover letter.</li></ul>
    <p>Name your files clearly, for example <strong>CV_First_Last.pdf</strong>, and send them as PDFs so the layout does not change.</p>''',
     [("What should the subject line of a job application email be?", "Keep it clear: \"Application for [job title] - [your name]\", with the job reference if there is one.")]),
]
LINKS = '''  <section class="ct-more"><h2>Other letters</h2><ul class="ct-links">
    <li><a href="/en/resignation-letter/">Resignation letter</a></li>
    <li><a href="/en/interview-follow-up-email/">Follow-up email after an interview</a></li>
    <li><a href="/en/job-application-email/">Job application email</a></li>
    <li><a href="/en/cover-letter/">Cover letter</a></li>
  </ul></section>
'''
for path, fr, typ, letter, title, desc, h1, lead, sec, is_letter, guide, faq in LETTERS:
    ld = {"@context": "https://schema.org", "@graph": [{"@type": "WebApplication", "name": "CVLibre: " + h1, "description": desc, "url": "https://cvlibre.com" + path, "applicationCategory": "BusinessApplication", "operatingSystem": "Web", "inLanguage": "en-GB", "offers": {"@type": "Offer", "price": "0", "priceCurrency": "GBP"}},
          {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}]}
    actions = '<button type="button" class="btn" id="ct-print">Download PDF</button><button type="button" class="btn btn-ghost" id="ct-copy">Copy the text</button>' if is_letter else '<button type="button" class="btn" id="ct-copy">Copy the text</button><button type="button" class="btn btn-ghost" id="ct-mail">Open in my email app</button>'
    who = '''        <div class="fld"><label for="ct-name">Your full name</label><input id="ct-name" maxlength="80" autocomplete="name"></div>
        <div class="fld"><label for="ct-contact">Your contact details</label><textarea id="ct-contact" rows="3" maxlength="300" placeholder="Address&#10;Phone&#10;Email"></textarea></div>
        <div class="fld"><label for="ct-rcpt">Recipient</label><textarea id="ct-rcpt" rows="3" maxlength="300" placeholder="Manager's name&#10;Company name&#10;Address"></textarea></div>
''' if is_letter else '''        <div class="fld"><label for="ct-name">Your full name (for the signature)</label><input id="ct-name" maxlength="80" autocomplete="name"></div>
'''
    prev = '    <div class="lt-prev"><div class="lt-box" id="lt-box"><div class="lt-sheet" id="lt-sheet" aria-label="Letter preview"></div></div></div>\n' if is_letter else ''
    write(path, head(title, desc, path, fr=fr, extra=LETTER_CSS + '<style>@media print { .sup, .cty { display: none !important; } }</style>\n', ld=ld) + "<body>\n" + HEADER + f'''
<main id="main" class="wrap lt ct{'' if is_letter else ' ct-mail'}" data-type="{typ}" data-letter="{letter}">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/en/">Home</a> / <a href="/en/letters/">Letters</a></nav>
  <h1>{h1}</h1>
  <p class="lead lt-lead">{lead}</p>
  <div class="ai-budget" aria-live="polite"></div>
  <div class="lt-grid">
    <div class="lt-form">
      <section class="lt-card">
        <h2>{sec}</h2>
        <div id="ct-fields"></div>
        <button type="button" class="btn acc-big" id="ct-gen">Write it with AI</button>
        <button type="button" class="link-btn" id="ct-model">Use the free template (no AI)</button>
        <p class="hint" id="ct-msg" role="status" aria-live="polite">Free, no sign-up: 5 AI uses a day. The template without AI is unlimited. Always read it through before sending.</p>
      </section>
      <section class="lt-card">
        <h2>{'You and the recipient' if is_letter else 'You'}</h2>
{who}      </section>
      <section class="lt-card" id="ct-result" hidden>
        <h2>{'Your letter' if is_letter else 'Your email'}</h2>
        <div class="fld"><label for="ct-subject">{'Subject' if is_letter else 'Email subject'}</label><input id="ct-subject" maxlength="150"></div>
        <div class="fld"><label for="ct-body">Text</label><textarea id="ct-body" rows="14" maxlength="4000"></textarea></div>
        <div class="lt-actions">{actions}</div>
      </section>
    </div>
{prev}  </div>
  <article class="ct-guide prose-s">
{guide}
  </article>
{LINKS}</main>
''' + FOOTER + '<script src="/assets/en/letters.js?v=' + V + '" defer></script>\n<script src="/assets/en/aibar.js?v=' + V + '" defer></script>\n</body>\n</html>\n')

write("/en/letters/", head("Free Job Letters and Emails with AI (UK) | CVLibre", "Free UK templates with AI: cover letter, resignation letter, follow-up email after an interview and job application email.", "/en/letters/", fr="/courriers/", extra=LETTER_CSS) + "<body>\n" + HEADER + '''
<main id="main" class="wrap lt">
  <h1>Job letters and emails, free with AI</h1>
  <p class="lead lt-lead">Every letter and email you need in your job search, written in seconds with AI or from our free templates. No sign-up.</p>
''' + LINKS.replace("Other letters", "Choose a letter") + '''</main>
''' + FOOTER + "</body>\n</html>\n")
