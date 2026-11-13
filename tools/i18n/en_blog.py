"""Blog anglais (UK) de CVLibre : /en/blog/ et ses guides. Lancer : python3 tools/i18n/en_blog.py"""
import os, sys, re, json
sys.path.insert(0, os.path.dirname(__file__))
from en_pages import head, HEADER, FOOTER, write

COVER = open(os.path.join(os.path.dirname(__file__), "cover.svg"), encoding="utf-8").read()
def cover(label): return re.sub(r'aria-label="[^"]*"', 'aria-label="Illustration: ' + label.replace('"', "") + '"', COVER, count=1)
BLOG_CSS = '<link rel="stylesheet" href="/assets/blog.css?v=20261113b">\n'
DATE = "13 November 2026"

POSTS = [
 ("how-to-write-a-cv", "How to write a CV: a step-by-step UK guide", "How to write a CV that UK employers actually read: what to include, in what order, how long it should be and how to save it as a PDF.", 6, [
  ("p", "Recruiters spend only a short time on each CV: they look for whether your experience matches the job. A good CV does not try to say everything. It makes the right information easy to find. Here are the steps, in the order we suggest you fill them in."),
  ("h2", "1. Start from the job you want"),
  ("p", "Before you write anything, reread the job advert. A CV works best when it answers one specific role. Keep a master CV and adjust it for each application: change the title, reorder your skills and put the most relevant experience first."),
  ("h2", "2. Contact details at the top"),
  ("p", "Your full name, a professional email address, a phone number and your town or city. You do not need your full address. In the UK, do not include a photo, your date of birth, your marital status or your nationality: employers do not need them, and leaving them out avoids any bias."),
  ("h2", "3. A short personal profile"),
  ("p", "Three or four lines that say who you are, what you are good at and what you are looking for. Avoid empty phrases like \"hard-working team player\": back each claim with a fact. See our guide on <a href=\"/en/blog/personal-statement-cv/\">how to write a personal statement</a>."),
  ("h2", "4. Work experience, most recent first"),
  ("p", "For each job: your title, the employer, the town, the dates (month and year) and 2 to 5 bullet points. Start each bullet with an action verb (managed, trained, sold, reduced) and add a result when you have one: a figure, a volume, a deadline met."),
  ("ex", "Responsible for social media.", "Managed 4 social media channels, growing followers by 38% in one year."),
  ("p", "Never invent a figure. If you do not have one, describe the task precisely instead."),
  ("h2", "5. Education"),
  ("p", "List your qualifications with the school, college or university and the years: degree, A-levels, BTEC, GCSEs (for example \"9 GCSEs including English and Maths\"). If you are just starting out, put education before experience."),
  ("h2", "6. Skills, and interests if useful"),
  ("p", "List 6 to 12 skills, using the words of the advert when they are true for you. Interests are optional: include them only if they say something useful about you, such as volunteering or a team sport."),
  ("h2", "7. Keep it to two pages"),
  ("p", "Two A4 pages is the usual maximum in the UK. One page is fine for students and people with little experience. See <a href=\"/en/blog/how-long-should-a-cv-be/\">how long a CV should be</a>."),
  ("h2", "8. Check it and save it as a PDF"),
  ("p", "Read it out loud to spot mistakes, ask someone else to read it, then save it as a PDF so the layout does not move. Give it a clear name: <strong>CV_First_Last.pdf</strong>."),
 ]),
 ("cv-with-no-experience", "How to write a CV with no work experience", "No work experience yet? How to write a CV that still gets interviews: education, volunteering, projects, transferable skills and an example layout.", 5, [
  ("p", "Everyone starts somewhere. Employers hiring for entry-level jobs, apprenticeships and part-time roles know you will not have years of experience. What they want to see is that you are reliable, willing to learn and able to do the basics of the job."),
  ("h2", "Lead with a strong personal profile"),
  ("p", "Say what you are studying or have just finished, what kind of role you are looking for and two qualities you can prove. For example: \"Recent A-level student looking for a part-time retail role. Reliable, punctual and used to dealing with the public through volunteering at my local food bank.\""),
  ("h2", "Put education first"),
  ("p", "List your qualifications with grades if they are good, and any relevant modules or projects. A-levels, BTECs, GCSEs and short courses (food hygiene, first aid) all count."),
  ("h2", "Use everything that counts as experience"),
  ("ul", ["Volunteering, charity work and fundraising", "Work experience placements and internships", "Babysitting, dog walking, helping in a family business", "School or university roles: prefect, society treasurer, team captain", "Personal projects: a website, a YouTube channel, an event you organised"]),
  ("h2", "Highlight transferable skills"),
  ("p", "Communication, teamwork, time management, customer service, IT skills and languages are useful in almost every job. Give an example for each one rather than just listing them."),
  ("h2", "Keep it to one page"),
  ("p", "With little experience, one clear page is better than two thin ones. Use a simple template, real text and clear headings."),
 ]),
 ("personal-statement-cv", "How to write a personal statement for your CV (with examples)", "What a CV personal statement is, how long it should be, what to put in it and 5 examples you can adapt for your own CV.", 5, [
  ("p", "The personal statement (or personal profile) is the short paragraph at the top of your CV, just under your name. It is the first thing a recruiter reads, so it should quickly answer three questions: who are you, what can you offer and what are you looking for?"),
  ("h2", "How long should it be?"),
  ("p", "Three to five lines, around 50 to 150 words. Write it in the first person without \"I\" at the start of every sentence, or in a neutral style. Be consistent."),
  ("h2", "What to include"),
  ("ul", ["Your current role or situation (student, career changer, experienced manager)", "Your main strengths, backed by a fact or a figure", "The type of role you want, in the words of the job advert"]),
  ("h2", "Examples"),
  ("p", "<strong>Retail:</strong> Customer-focused sales assistant with 3 years' experience in busy high-street stores. Consistently met weekly sales targets and trained 5 new starters. Looking for a supervisor role where I can lead a small team."),
  ("p", "<strong>Graduate:</strong> Business Management graduate from the University of Leeds with a placement year in marketing. Confident with data, Excel and social media analytics. Seeking a graduate marketing role in a growing company."),
  ("p", "<strong>Career change:</strong> Former hospitality manager moving into HR, with 6 years of recruiting, rota planning and staff training. Currently completing a CIPD Level 3 qualification."),
  ("p", "<strong>Healthcare:</strong> Compassionate care assistant with 2 years' experience in residential care, including dementia care and medication rounds. Holds the Care Certificate and is keen to move into a senior role."),
  ("p", "<strong>No experience:</strong> Motivated school leaver with 7 GCSEs including English and Maths, looking for an apprenticeship in IT. Built my own website and helped run the school's computer club."),
  ("h2", "Mistakes to avoid"),
  ("p", "Clichés with no proof (\"hard-working\", \"passionate\"), long paragraphs, and a generic statement you send to every employer. Adjust it for each application: you can use the <a href=\"/en/cv-builder/\">CVLibre AI</a> to tailor it to a job advert in seconds."),
 ]),
 ("how-long-should-a-cv-be", "How long should a CV be in the UK?", "One page or two? The simple rule for UK CVs depending on your experience, and how to save space without losing important information.", 3, [
  ("p", "In the UK, the standard CV is no more than two sides of A4. Recruiters read a lot of applications, and a focused CV is easier to scan."),
  ("h2", "The simple rule"),
  ("ul", ["Students, school leavers and graduates: one page is usually enough.", "A few years of experience: one to two pages.", "Long career or senior roles: two pages, focusing on the last 10 to 15 years."]),
  ("p", "Some academic, medical and scientific CVs are longer because they list publications or clinical experience. That is the exception."),
  ("h2", "How to save space"),
  ("ul", ["Keep 2 to 5 bullet points per job, and fewer for older roles.", "Group short or old jobs under \"Earlier experience\".", "Remove your full address, a photo and \"References available on request\".", "Cut generic skills that every candidate lists."]),
  ("p", "CVLibre warns you as soon as your CV goes over two pages, so you can see the result as you type."),
 ]),
 ("skills-for-cv", "What skills to put on a CV (with examples)", "Which skills to put on your CV, how to choose them from the job advert and how to prove them, with examples of hard and soft skills.", 4, [
  ("p", "The skills section helps recruiters, and the software they use, check quickly that you match the job. The best skills section is short, honest and built around the advert."),
  ("h2", "Hard skills and soft skills"),
  ("p", "<strong>Hard skills</strong> are technical and measurable: Excel, forklift licence, Python, food hygiene, bookkeeping, a foreign language. <strong>Soft skills</strong> are personal qualities: communication, teamwork, problem solving, organisation, customer service."),
  ("h2", "How to choose them"),
  ("p", "Read the job advert and underline the skills it asks for. Keep the ones that are true for you, using the same words, and add the ones that make you stand out. 6 to 12 skills is plenty."),
  ("h2", "Prove them in your experience"),
  ("p", "A skill listed without proof is easy to ignore. Back up the most important ones in your work experience bullet points."),
  ("ex", "Excellent communication skills.", "Handled 60+ customer calls a day and resolved 90% of issues on the first call."),
  ("h2", "Examples by job"),
  ("ul", ["Retail: till handling, stock control, visual merchandising, customer service", "Warehouse: forklift licence, pick and pack, health and safety, inventory systems", "Office: Microsoft 365, data entry, diary management, minute taking", "Care: personal care, medication rounds, safeguarding, care plans"]),
 ]),
 ("how-to-write-a-cover-letter", "How to write a cover letter (UK guide with example)", "How to write a UK cover letter: structure, length, how to open and close it, and a short example you can adapt.", 5, [
  ("p", "A cover letter explains why you want this job and why you are a good fit, in a way a CV cannot. Many employers still read it, especially for smaller companies and competitive roles."),
  ("h2", "Length and format"),
  ("p", "Keep it to one page: three or four short paragraphs, around 250 to 400 words. Use the same name and contact details as on your CV, and save it as a PDF."),
  ("h2", "Structure"),
  ("ul", ["Opening: the role you are applying for and where you saw it.", "Why you: two or three strengths that match the advert, with examples.", "Why them: what attracts you to this company specifically.", "Closing: say you would welcome an interview and thank them."]),
  ("h2", "How to open and close it"),
  ("p", "If you know the name of the hiring manager, start with \"Dear Ms Smith,\" and end with \"Yours sincerely,\". If you do not, \"Dear Hiring Manager,\" is widely used today. The traditional \"Dear Sir or Madam,\" goes with \"Yours faithfully,\"."),
  ("h2", "Short example"),
  ("p", "<em>Dear Hiring Manager, I am applying for the Barista role at Pret A Manger advertised on your website. For the past two years I have worked at a busy café in Leeds, where I served up to 300 customers a day and trained new staff on our coffee machines. I enjoy fast-paced work and take pride in friendly, quick service. I would welcome the chance to discuss how I could contribute to your team. Yours sincerely, Sam Taylor</em>"),
  ("p", "With <a href=\"/en/cover-letter/\">CVLibre's free AI cover letter</a>, paste the advert and your background, and you get a first draft in seconds. Always read it through and make it sound like you."),
 ]),
]

def render(blocks):
    out = []
    for b in blocks:
        if b[0] == "p": out.append("<p>%s</p>" % b[1])
        elif b[0] == "h2": out.append('<h2 id="%s">%s</h2>' % (re.sub(r"[^a-z0-9]+", "-", b[1].lower()).strip("-")[:48], b[1]))
        elif b[0] == "ul": out.append("<ul>" + "".join("<li>%s</li>" % x for x in b[1]) + "</ul>")
        elif b[0] == "ex": out.append('<div class="ex ba"><p><span class="tag bad">Before</span> %s</p><p><span class="tag good">After</span> %s</p></div>' % (b[1], b[2]))
    return "\n".join(out)

def card(slug, title, desc, mins):
    return f'''    <a class="card cat-cv" href="/en/blog/{slug}/" data-cat="CV">
      <span class="card-cover">{cover(title)}</span>
      <span class="card-body"><span class="pill">CV</span><strong class="card-title">{title}</strong><span class="card-desc">{desc}</span><span class="card-meta">{mins} min read</span></span>
    </a>
'''

for slug, title, desc, mins, blocks in POSTS:
    toc = "".join('<li><a href="#%s">%s</a></li>' % (re.sub(r"[^a-z0-9]+", "-", b[1].lower()).strip("-")[:48], b[1]) for b in blocks if b[0] == "h2")
    ld = {"@context": "https://schema.org", "@type": "Article", "headline": title, "description": desc, "inLanguage": "en-GB", "datePublished": "2026-11-13", "dateModified": "2026-11-13",
          "author": {"@type": "Organization", "name": "CVLibre"}, "publisher": {"@type": "Organization", "name": "CVLibre", "url": "https://cvlibre.com/en/"}, "mainEntityOfPage": "https://cvlibre.com/en/blog/%s/" % slug}
    rel = "".join([card(s, t, d, m) for s, t, d, m, _ in POSTS if s != slug][:3])
    write("/en/blog/%s/" % slug, head(title + " | CVLibre", desc, "/en/blog/%s/" % slug, extra=BLOG_CSS, ld=ld) + "<body>\n" + HEADER + f'''
<main id="main" class="blog cat-cv">
  <header class="post-hero">
    <div class="wrap post-hero-in">
      <div class="post-hero-text">
        <nav class="crumbs" aria-label="Breadcrumb"><a href="/en/">Home</a><span aria-hidden="true">/</span><a href="/en/blog/">Advice</a></nav>
        <span class="pill">CV</span>
        <h1>{title}</h1>
        <p class="standfirst">{desc}</p>
        <p class="meta">{mins} min read<span aria-hidden="true"> · </span>Updated {DATE}<span aria-hidden="true"> · </span>Written with the help of AI</p>
      </div>
      <div class="post-cover">{cover(title)}</div>
    </div>
  </header>
  <div class="wrap post-grid">
    <aside class="toc" aria-label="Contents">
      <details class="toc-m"><summary>Contents</summary><ol>{toc}</ol></details>
      <div class="toc-d"><p class="toc-h">In this article</p><ol>{toc}</ol></div>
    </aside>
    <article class="prose">
{render(blocks)}
<div class="callout"><p><strong>The quickest way to start:</strong> fill in a ready-made template, see the result live and download the PDF. You can even <a href="/en/cv-builder/">describe your background in a few lines and let the AI fill in the form</a>, then check everything. Free, no sign-up.</p></div>
    </article>
  </div>
  <section class="wrap rel" aria-labelledby="rel-h"><h2 id="rel-h">Read next</h2><div class="b-grid">
{rel}  </div></section>
</main>
''' + FOOTER + "</body>\n</html>\n")

write("/en/blog/", head("CV and Job Application Advice (UK) | CVLibre", "Practical UK guides to write your CV, personal statement and cover letter, with examples. Free, no sign-up.", "/en/blog/", fr="/blog/", extra=BLOG_CSS) + "<body>\n" + HEADER + '''
<main id="main" class="blog">
  <section class="b-hero"><div class="wrap b-hero-in">
    <div>
      <h1>CVs, cover letters and applications, without the jargon.</h1>
      <p class="lead">Practical guides for job seekers in the UK, with examples you can adapt. Free, no sign-up.</p>
      <p class="hero-cta"><a class="btn" href="/en/cv-builder/">Create my CV</a></p>
    </div>
  </div></section>
  <section class="wrap" aria-labelledby="all-h">
    <h2 id="all-h" class="sec-h">All guides</h2>
    <div class="b-grid">
''' + "".join(card(s, t, d, m) for s, t, d, m, _ in POSTS) + '''    </div>
  </section>
</main>
''' + FOOTER + "</body>\n</html>\n")
