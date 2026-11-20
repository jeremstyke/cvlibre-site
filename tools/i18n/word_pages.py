"""20 nov 2026 (Jeremy) : pages de téléchargement des modèles de CV Word (.docx), une par pays (fr, en, us, ca, au, nz, de).
Les fichiers .docx et leurs aperçus WebP sont faits par word_docx.py et rangés dans le dossier de chaque page.
Ce script écrit les 7 pages (en-tête, pied de page et consentement du pays), ajoute le lien dans le pied de page de chaque version
et le lien depuis 2 articles par pays. Idempotent, lancé par build_all.sh (avant fr_alt.py et sitemap.py)."""
import os, re, sys, json, glob
sys.path.insert(0, os.path.dirname(__file__))
from alt import links
from word_docx import FILES, DIRS
import word_design
FILES = {cc: word_design.FILES[cc] + FILES[cc] for cc in FILES}  # les 2 modèles graphiques en premier
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
P = {cc: "/" + d + "/" for cc, d in DIRS.items()}
CSS = ('<style>.wt{max-width:1040px}.wt .lead{font-size:1.12rem}.wt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:22px;margin:28px 0 8px}'
       '.wt-card{border:1px solid var(--rule);border-radius:14px;padding:16px;background:#fff;display:flex;flex-direction:column;gap:10px}'
       '.wt-card img{width:100%;height:auto;border:1px solid var(--rule);border-radius:6px;box-shadow:0 6px 18px rgba(16,33,63,.08)}'
       '.wt-card h2{font-size:1.2rem;margin:6px 0 0}.wt-card p{margin:0;flex:1}.wt-card .btn{align-self:flex-start}.wt-fmt{font-size:.88rem;color:var(--ink-2)}'
       '.wt-cta{background:var(--blue-wash,#e3eafc);border-radius:14px;padding:18px 22px;margin:22px 0}.wt-cta p{margin:0 0 10px;color:var(--ink)}'
       '.wt .faq{margin-top:8px}.wt-src{font-size:.9rem}</style>\n')

# ---------------------------------------------------------------- contenus
C = {}
C["fr"] = dict(lang="fr-FR", home="/", homel="Accueil", builder="/creer-un-cv/", dl="Télécharger le modèle Word", fmt="Fichier .docx, 1 page, A4",
 title="Modèle CV Word gratuit : 5 modèles .docx à télécharger | CVLibre",
 desc="Modèle CV Word gratuit à télécharger : 5 CV .docx pensés pour la France (élégant, deux colonnes, classique, moderne, premier emploi), sans inscription.",
 h1="Modèle CV Word gratuit : 5 CV à télécharger",
 lead="Voici 5 modèles de CV Word gratuits à télécharger, pensés pour candidater en France : deux CV plus graphiques (élégant et deux colonnes), un CV classique, un CV moderne et un CV pour un premier emploi. Chaque fichier .docx s'ouvre dans Word, LibreOffice ou Google Docs, sans inscription, sans e-mail et sans filigrane.",
 cta='<p>Vous préférez ne pas vous occuper de la mise en page&nbsp;? Le <strong>créateur de CV en ligne CVLibre</strong> remplit les rubriques avec vous, propose 33 modèles et télécharge un PDF propre, gratuitement.</p><a class="btn" href="/creer-un-cv/">Créer mon CV en ligne</a>',
 cards={"elegant": ("CV élégant", "Un bandeau de couleur en haut avec votre nom et votre poste, puis une frise avec les dates à gauche. Sobre et soigné, avec un cadre photo facultatif."), "deux-colonnes": ("CV deux colonnes", "Une colonne de couleur à gauche pour la photo, le contact, les compétences et les langues, et vos expériences à droite. Le plus moderne des cinq."), "classique": ("CV classique", "Pour la plupart des candidatures&nbsp;: profil court, expériences en premier, formation, compétences, langues et centres d'intérêt. Un cadre pour la photo, que vous pouvez supprimer."),
        "moderne": ("CV moderne", "Pour mettre vos compétences clés en avant dès le haut de la page, avec une couleur d'accent sobre. Adapté aux métiers où l'on vous juge d'abord sur ce que vous savez faire."),
        "premier-emploi": ("CV premier emploi", "Pour un étudiant, un jeune diplômé ou une alternance&nbsp;: la formation passe en premier, puis les stages, les jobs d'été et le bénévolat, qui comptent vraiment.")},
 body='''  <h2 id="remplir">Comment remplir ce modèle de CV Word</h2>
  <p>Remplacez chaque texte entre crochets par vos informations, puis supprimez les crochets. Les rubriques utilisent les vrais styles de Word (Titre&nbsp;1, Liste à puces)&nbsp;: pour ajouter une expérience, copiez un bloc existant et collez-le en dessous, la mise en forme suit.</p>
  <ul>
    <li><strong>Une page.</strong> Pour un premier emploi ou quelques années d'expérience, une page suffit. L'Onisep conseille de ne pas dépasser deux pages, et un recruteur lit d'abord le haut du CV.</li>
    <li><strong>La photo est facultative.</strong> En France, rien ne vous oblige à en mettre une et l'Onisep rappelle qu'elle n'est pas un critère de sélection. Gardez le cadre seulement si l'annonce la demande ou si vous avez une photo de qualité professionnelle&nbsp;; sinon, supprimez-le.</li>
    <li><strong>Le titre du CV</strong> reprend l'intitulé du poste visé, idéalement le même mot que dans l'annonce.</li>
    <li><strong>Les expériences</strong> vont de la plus récente à la plus ancienne, avec des dates au même format partout (MM/AAAA ou mois et année). Commencez chaque ligne par un verbe d'action et ajoutez un chiffre quand c'est possible.</li>
    <li><strong>Les langues</strong>&nbsp;: indiquez un niveau du cadre européen (A1 à C2) ou un score de test plutôt que «&nbsp;bon niveau&nbsp;».</li>
    <li><strong>Les informations personnelles</strong>&nbsp;: l'âge et la situation familiale sont facultatifs. N'indiquez jamais votre numéro de sécurité sociale.</li>
    <li><strong>Les centres d'intérêt</strong> doivent dire quelque chose de vous&nbsp;: «&nbsp;football en club depuis 8 ans, entraîneur des moins de 11 ans&nbsp;» vaut mieux que «&nbsp;sport, lecture&nbsp;».</li>
  </ul>
  <h2 id="choisir">Quel modèle choisir&nbsp;?</h2>
  <p>Le CV classique convient presque partout&nbsp;: commerce, logistique, administration, santé, artisanat. Le CV moderne est utile quand vos compétences comptent plus que vos intitulés de poste, par exemple après une reconversion. Le CV premier emploi est fait pour ceux qui ont surtout une formation et quelques expériences courtes&nbsp;: un stage de trois semaines ou un job d'été y a toute sa place.</p>
  <p>Les deux modèles graphiques, élégant et deux colonnes, attirent l'œil quand vous envoyez votre CV par e-mail ou que vous le remettez en main propre. Pour un dépôt sur un site de recrutement, le CV classique reste le plus sûr, car certains logiciels lisent mal les colonnes.</p>
  <h2 id="envoyer">Avant d'envoyer votre CV</h2>
  <p>Relisez l'orthographe, puis enregistrez votre CV en PDF (dans Word&nbsp;: Fichier, Enregistrer sous, PDF) pour que la mise en page ne bouge pas chez le recruteur. Donnez au fichier un nom clair, par exemple «&nbsp;CV-Prenom-Nom.pdf&nbsp;». Adaptez le titre, le profil et l'ordre des compétences à chaque offre&nbsp;: c'est souvent ce qui fait la différence, et c'est aussi ce que lisent les logiciels de tri des candidatures.</p>
  <p>Pour aller plus loin, lisez nos conseils pour <a href="/blog/comment-faire-un-cv/">faire un CV</a> et pour un <a href="/blog/cv-sans-experience/">CV sans expérience</a>.</p>''',
 faqh="Questions fréquentes",
 faq=[("Ces modèles de CV Word sont-ils vraiment gratuits ?", "Oui. Pas de compte, pas d'adresse e-mail, pas de paiement : vous téléchargez le fichier .docx et vous l'utilisez pour vos candidatures."),
      ("Puis-je ouvrir ces modèles sans Microsoft Word ?", "Oui. LibreOffice Writer, Google Docs (en important le fichier) et Pages sur Mac ouvrent les fichiers .docx. Si une police manque, la mise en page peut bouger un peu : vérifiez avant d'exporter en PDF."),
      ("Faut-il mettre une photo sur un CV en France ?", "Ce n'est pas obligatoire. Mettez-en une si l'annonce la demande ou si elle est de qualité professionnelle, sinon supprimez simplement le cadre prévu dans le modèle.")],
 src='Sources&nbsp;: <a href="https://www.onisep.fr/vers-l-emploi/recherche-d-emploi/les-10-questions-a-se-poser-avant-de-rediger-son-cv" target="_blank" rel="noopener">Onisep, les 10 questions à se poser avant de rédiger son CV</a>&nbsp;; <a href="https://choisirleservicepublic.gouv.fr/conseils/rediger-son-cv/" target="_blank" rel="noopener">Choisir le service public, rédiger son CV</a>.',
 foot=("/blog/", "Modèles de CV Word"), arts=["comment-faire-un-cv", "cv-sans-experience"],
 artp='<p><strong>Modèle à télécharger&nbsp;:</strong> si vous préférez travailler dans Word, prenez un de nos <a href="/modele-cv-word/">modèles de CV Word gratuits</a> (classique, moderne ou premier emploi).</p>')

C["en"] = dict(lang="en-GB", home="/en/", homel="Home", builder="/en/cv-builder/", dl="Download the Word template", fmt=".docx file, A4, fits on 1 page",
 title="Free CV Template for Word (UK): 5 .docx Templates | CVLibre",
 desc="Free CV template for Word: download 5 UK CV templates (.docx), elegant, two column, classic, modern and no experience. No photo, British spelling, no sign-up.",
 h1="Free CV templates for Word (UK)",
 lead="Download a free CV template for Word below: five .docx files built for job applications in the UK, an elegant design, a two-column design, a classic, a modern and one for people with no work experience. They follow UK conventions (no photo, no date of birth, a personal statement at the top) and open in Word, Google Docs or LibreOffice.",
 cta='<p>Would you rather not fiddle with formatting? The <strong>CVLibre online CV builder</strong> walks you through each section, offers 33 templates and gives you a clean PDF, for free.</p><a class="btn" href="/en/cv-builder/">Create my CV online</a>',
 cards={"elegant": ("Elegant CV", "A coloured band at the top with your name and target job, then a timeline with dates on the left. Smart and easy to read."), "two-column": ("Two-column CV", "A coloured sidebar for your contact details, skills and languages, with your experience on the right. The most modern of the five."), "classic": ("Classic CV", "For most jobs: personal statement, work history, education, skills and references. A clear layout that works for retail, care, logistics, office and trade jobs."),
        "modern": ("Modern CV", "For people who want their key skills seen first, with a target job title under the name and a discreet accent colour. Good for a career change too."),
        "no-experience": ("CV with no experience", "For school leavers, students and apprenticeship applicants: education comes first, then skills, work experience placements, part-time jobs and volunteering.")},
 body='''  <h2 id="fill">How to fill in this CV template</h2>
  <p>Replace every text in square brackets with your own details, then delete the brackets. The headings and bullet points use real Word styles, so to add another job you can copy an existing block and paste it underneath: the formatting follows.</p>
  <ul>
    <li><strong>Contact details:</strong> your name, town or city, phone number and email address are enough. You do not need your full postal address.</li>
    <li><strong>Leave out personal details.</strong> The National Careers Service says you should not include your age, your date of birth, whether you are married or your nationality. A photo is not expected on a UK CV either.</li>
    <li><strong>Personal statement:</strong> three to five lines at the top that sum up who you are, what you offer and the job you want. Rewrite it for each application.</li>
    <li><strong>Work history:</strong> most recent job first, with dates. Start each bullet with an action verb and add a figure when you can: customers served, targets met, money saved.</li>
    <li><strong>Education:</strong> early in your career, you can put it before your work history. List qualifications with grades, including GCSEs in English and maths if they are recent.</li>
    <li><strong>References:</strong> you do not need to give referees' contact details on your CV. "References available on request" is enough, as long as you have people ready to vouch for you.</li>
    <li><strong>Length and font:</strong> two pages at most, in a clear font such as Calibri or Arial at 11 points or bigger. The templates already use Calibri.</li>
  </ul>
  <h2 id="choose">Which template should I choose?</h2>
  <p>The classic CV suits almost every job. The modern CV is useful when your skills matter more than your job titles, for example after a career break or a change of sector. The template with no experience is for a first job, a Saturday job, an apprenticeship or a placement: school projects, sport and volunteering all count as evidence.</p>
  <p>The elegant and two-column designs stand out when you email your CV or hand it in. For online application portals, the classic CV is the safest choice, because some applicant tracking systems struggle with columns.</p>
  <h2 id="send">Before you send your CV</h2>
  <p>Check your spelling and grammar, or ask someone to read it for you. Unless the employer asks for a Word file, save it as a PDF (File, Save As, PDF) so the layout stays the same on their screen, and give it a clear name such as "Firstname-Lastname-CV.pdf". Tailor the personal statement and the order of your skills to each job advert: it is the quickest way to stand out, and it helps with applicant tracking systems.</p>
  <p>Read more in our guides on <a href="/en/blog/how-to-write-a-cv/">how to write a CV</a> and <a href="/en/blog/personal-statement-cv/">writing a personal statement</a>.</p>''',
 faqh="Frequently asked questions",
 faq=[("Are these Word CV templates really free?", "Yes. There is no account, no email and no payment: you download the .docx file and use it for your job applications."),
      ("Should I put a photo on my CV in the UK?", "No. UK employers do not expect a photo, and leaving it out keeps the focus on your skills and experience. The same goes for your age and date of birth."),
      ("How long should a UK CV be?", "Two pages at most. One page is fine if you are a student or have little experience. These templates fit on one page, with room to grow onto a second.")],
 src='Sources: <a href="https://nationalcareers.service.gov.uk/careers-advice/cv-sections" target="_blank" rel="noopener">National Careers Service, CV sections</a>.',
 foot=("/en/blog/", "CV templates for Word"), arts=["how-to-write-a-cv", "cv-with-no-experience"],
 artp='<strong>Prefer working in Word?</strong> Download one of our <a href="/en/cv-template-word/">free CV templates for Word</a>: classic, modern or no experience.')

C["us"] = dict(lang="en-US", home="/us/", homel="Home", builder="/us/resume-builder/", dl="Download the Word template", fmt=".docx file, US Letter, 1 page",
 title="Free Resume Template for Word: 5 US Templates (.docx) | CVLibre",
 desc="Free resume template for Word: download 5 US resume templates (.docx), elegant, two column, classic, modern and entry-level. One page, no photo, no sign-up.",
 h1="Free resume templates for Word",
 lead="Download a free resume template for Word below: five .docx files built for job applications in the United States: an elegant design, a two-column design, a classic, a modern and one for entry-level jobs. Each one fits on a single US Letter page, has no photo and opens in Word, Google Docs or LibreOffice.",
 cta='<p>Don\'t want to deal with formatting? The <strong>CVLibre online resume builder</strong> guides you section by section, offers 33 templates and downloads a clean PDF, free of charge.</p><a class="btn" href="/us/resume-builder/">Build my resume online</a>',
 cards={"elegant": ("Elegant resume", "A navy header band with your name and target job title, then a timeline with dates on the left. Polished and still one page."), "two-column": ("Two-column resume", "A colored sidebar for contact details, skills and languages, with your experience on the right. Best for resumes you hand over or email directly."), "classic": ("Classic resume", "For most jobs: a short summary, experience in reverse chronological order, education and a skills line. Simple, readable and easy for applicant tracking systems."),
        "modern": ("Modern resume", "With a headline under your name, a core skills line and a certifications section. A good fit for office, tech, healthcare and sales jobs."),
        "no-experience": ("Entry-level resume", "For students, recent graduates and first jobs: education comes first, then skills, internships, part-time jobs, volunteering and campus activities.")},
 body='''  <h2 id="fill">How to fill out this resume template</h2>
  <p>Replace every text in square brackets with your own details, then delete the brackets. The headings and bullets use real Word styles, so to add a job you can copy an existing block and paste it below: the formatting comes with it.</p>
  <ul>
    <li><strong>Header:</strong> your name, city and state, phone, email and a LinkedIn or portfolio link. CareerOneStop notes that you don't need your full street address.</li>
    <li><strong>No photo, no age:</strong> US resumes leave out a photo, your date of birth and your marital status. Employers expect your skills and results, not personal details.</li>
    <li><strong>Summary:</strong> three or four sentences, or a few bullets, about your experience and what you bring to the role. With three years of experience or less, it's optional.</li>
    <li><strong>Experience:</strong> most recent job first. Start each bullet with an action verb and add a number when you can: sales, customers, time saved, team size.</li>
    <li><strong>One page:</strong> that's the norm for most US job seekers. Go to two pages only with a long, relevant career.</li>
    <li><strong>References:</strong> keep them off the resume. Prepare a separate list and share it when the employer asks.</li>
    <li><strong>Key words:</strong> many employers use applicant tracking systems. Reuse the exact words from the job posting when they are true for you.</li>
  </ul>
  <h2 id="choose">Which template should I pick?</h2>
  <p>The classic resume works for nearly every job, from retail and warehouse roles to office positions. The modern template suits people who want a target job title and their core skills right at the top. The entry-level template is for a first job, an internship or a summer job: class projects, clubs and volunteer work all count.</p>
  <p>The elegant and two-column designs look great when you email your resume to a person or bring it to a job fair. For online applications, use the classic template: some applicant tracking systems read columns in the wrong order.</p>
  <h2 id="send">Before you send your resume</h2>
  <p>Proofread it twice, then save it as a PDF (File, Save As, PDF) unless the posting asks for a Word file, so the layout looks the same on the employer's screen. Name the file clearly, for example "Firstname-Lastname-Resume.pdf". Adjust your summary and the order of your skills for each posting.</p>
  <p>For more help, read our guides on <a href="/us/blog/how-to-write-a-resume/">how to write a resume</a> and <a href="/us/blog/resume-summary-examples/">resume summary examples</a>.</p>''',
 faqh="Frequently asked questions",
 faq=[("Are these Word resume templates really free?", "Yes. No account, no email and no payment: download the .docx file and use it for your job applications."),
      ("Should a US resume include a photo?", "No. Most US employers don't expect a photo, and leaving it off keeps attention on your skills. Leave out your age, date of birth and marital status too."),
      ("Can I use these templates in Google Docs?", "Yes. Upload the .docx file to Google Drive and open it with Google Docs. Check the layout, then download it as a PDF.")],
 src='Sources: <a href="https://www.careeronestop.org/JobSearch/Resumes/ResumeGuide/top-portion-of-resume.aspx" target="_blank" rel="noopener">CareerOneStop (US Department of Labor), resume guide</a>.',
 foot=("/us/blog/", "Resume templates for Word"), arts=["how-to-write-a-resume", "resume-format"],
 artp='<strong>Prefer working in Word?</strong> Download one of our <a href="/us/resume-template-word/">free resume templates for Word</a>: classic, modern or entry-level.')

C["ca"] = dict(lang="en-CA", home="/ca/", homel="Home", builder="/ca/resume-builder/", dl="Download the Word template", fmt=".docx file, Letter size, 1 page",
 title="Free Canadian Resume Template for Word: 5 .docx Files | CVLibre",
 desc="Free Canadian resume template for Word: 5 .docx resumes, elegant, two column, classic, modern and no experience. No photo, room for English and French.",
 h1="Free Canadian resume templates for Word",
 lead="Download a free Canadian resume template for Word below: five .docx files that follow Canadian hiring practices: an elegant design, a two-column design, a classic, a modern and one for people with no work experience. There is no photo, a clear place for your English and French skills, and each file opens in Word, Google Docs or LibreOffice.",
 cta='<p>Rather skip the formatting? The <strong>CVLibre online resume builder</strong> takes you through each section, offers 33 templates and gives you a clean PDF, free.</p><a class="btn" href="/ca/resume-builder/">Build my resume online</a>',
 cards={"elegant": ("Elegant resume", "A navy header band with your name and target job, then a timeline with dates on the left. Polished and easy to scan."), "two-column": ("Two-column resume", "A coloured sidebar for contact details, skills and both official languages, with your experience on the right."), "classic": ("Classic resume", "For most jobs: profile, work experience, education, skills and languages. Each job line has room for a city and a province or country, which helps newcomers."),
        "modern": ("Modern resume", "With your target job title and your languages under your name, then key skills and certifications. Useful when bilingualism is an asset for the role."),
        "no-experience": ("Resume with no experience", "For students, co-op placements and first jobs: education first, then skills, certificates such as First Aid, part-time jobs and volunteer work.")},
 body='''  <h2 id="fill">How to fill out this resume template</h2>
  <p>Replace every text in square brackets with your own details, then delete the brackets. The headings and bullets use real Word styles: to add a job, copy an existing block and paste it underneath, and the formatting follows.</p>
  <ul>
    <li><strong>Two pages at most:</strong> Job Bank, the Government of Canada's job site, recommends limiting your resume to two pages. These templates fit on one page with room to grow.</li>
    <li><strong>No photo:</strong> Job Bank says not to include a picture of yourself. Also leave out your age, height, weight, marital status and religion, and never write your Social Insurance Number.</li>
    <li><strong>Languages:</strong> bilingualism is an asset for many jobs in Canada. Give your level in English and in French, and add any other language you speak.</li>
    <li><strong>Experience:</strong> most recent job first. Use action verbs and add numbers. If you worked abroad, name the city and country, and explain any job title an employer here might not know.</li>
    <li><strong>Education earned abroad:</strong> if you have a credential assessment, mention the Canadian equivalent.</li>
    <li><strong>References:</strong> Job Bank advises keeping them off the resume, on a separate sheet you hand over when an employer asks.</li>
    <li><strong>Spelling:</strong> use Canadian spelling, such as colour, centre and licence (the noun), with organize and recognize.</li>
  </ul>
  <h2 id="choose">Which template should I pick?</h2>
  <p>The classic resume fits most jobs, in any province. The modern template puts your target job and your languages up front, which helps for customer service and public-facing roles. The template with no experience is for a co-op placement, a summer job or your first job after high school or college.</p>
  <p>The elegant and two-column designs stand out when you email your resume or hand it in. For online application systems, the classic template is the safest choice, because some of them read columns in the wrong order.</p>
  <h2 id="send">Before you send your resume</h2>
  <p>Proofread it several times. Save it as a PDF (File, Save As, PDF) unless the employer asks for Word, and give the file a clear name such as "Firstname-Lastname-Resume.pdf". Adjust your profile and skills to each job posting: the same key words help with applicant tracking systems.</p>
  <p>For more help, read our guides on <a href="/ca/blog/how-to-write-a-resume/">how to write a resume</a> and the <a href="/ca/blog/canadian-resume-for-newcomers/">Canadian resume for newcomers</a>.</p>''',
 faqh="Frequently asked questions",
 faq=[("Are these Word resume templates really free?", "Yes. No account, no email and no payment: download the .docx file and use it for your applications."),
      ("Should a Canadian resume include references?", "Not on the resume itself. Job Bank suggests listing them on a separate sheet and giving it to the employer when asked."),
      ("Should I put a photo on my resume in Canada?", "No. A photo is not the norm in Canada, and Job Bank advises against it. Leave out your age and marital status too.")],
 src='Sources: <a href="https://www.jobbank.gc.ca/findajob/resources/write-good-resume" target="_blank" rel="noopener">Job Bank (Government of Canada), how to write a good resume</a>.',
 foot=("/ca/blog/", "Resume templates for Word"), arts=["how-to-write-a-resume", "canadian-resume-for-newcomers"],
 artp='<strong>Prefer working in Word?</strong> Download one of our <a href="/ca/resume-template-word/">free Canadian resume templates for Word</a>: classic, modern or no experience.')

C["au"] = dict(lang="en-AU", home="/au/", homel="Home", builder="/au/resume-builder/", dl="Download the Word template", fmt=".docx file, A4, 1 page",
 title="Free Resume Template Word (Australia): 5 .docx Files | CVLibre",
 desc="Free resume template for Word in Australia: 5 .docx resumes (also called CVs), elegant, two column, classic, modern and no experience, all with referees.",
 h1="Free resume templates for Word (Australia)",
 lead="Download a free resume template for Word below: five .docx files built for job applications in Australia, where a resume is also called a CV. You get an elegant design, a two-column design, a classic, a modern and a no-experience template, each with a referees section at the end, and they open in Word, Google Docs or LibreOffice.",
 cta='<p>Want to skip the formatting? The <strong>CVLibre online resume builder</strong> guides you through each section, offers 33 templates and gives you a clean PDF, free.</p><a class="btn" href="/au/resume-builder/">Build my resume online</a>',
 cards={"elegant": ("Elegant resume", "A navy header band with your name and target role, then a timeline with dates on the left, and referees at the end."), "two-column": ("Two-column resume", "A coloured sidebar for contact details, key skills and licences, with your experience and referees on the right."), "classic": ("Classic resume", "For most jobs: about me, key skills, employment history, education, licences and certificates, then two referees. Clear and easy to scan."),
        "modern": ("Modern resume", "With your target job title under your name, a professional summary and key skills with evidence. Suits office, health, trade and retail roles."),
        "no-experience": ("Resume with no experience", "For school leavers, students, traineeships and apprenticeships: career objective, education, skills, work experience placements, volunteering and referees.")},
 body='''  <h2 id="fill">How to fill in this resume template</h2>
  <p>Replace every text in square brackets with your own details, then delete the brackets. The headings and bullet points use real Word styles: to add a job, copy an existing block and paste it underneath, and the formatting follows.</p>
  <ul>
    <li><strong>Two pages at most:</strong> the Department of Employment and Workplace Relations suggests keeping your resume to no more than two pages. If it runs to a second page, put your name, phone and email in the page header so they appear on every page.</li>
    <li><strong>Font:</strong> a simple font such as Calibri or Arial at 11 points. The templates already use Calibri.</li>
    <li><strong>No photo or personal details:</strong> Australian employers do not expect a photo, your date of birth or your marital status.</li>
    <li><strong>Employment history:</strong> start with your most recent role. Use action verbs and add numbers when you can.</li>
    <li><strong>Licences and certificates:</strong> list the ones the job asks for, such as a driver licence, White Card, RSA, First Aid or a Working with Children Check.</li>
    <li><strong>Referees:</strong> list at least two people who can talk about your work, such as a former manager or supervisor. Do not use family members, and always ask before you list someone.</li>
    <li><strong>Spelling:</strong> use Australian spelling, such as organise, licence and colour.</li>
  </ul>
  <h2 id="choose">Which template should I pick?</h2>
  <p>The classic resume suits nearly every job. The modern template is handy when you want your target role and strongest skills at the top, for example after a change of career. The no-experience template is for your first casual job, a traineeship or an apprenticeship: school, sport and volunteering all count.</p>
  <p>The elegant and two-column designs stand out when you email your resume or drop it in. For online application portals, the classic template is the safest choice, because some systems read columns in the wrong order.</p>
  <h2 id="send">Before you send your resume</h2>
  <p>Ask someone to proofread it for spelling and grammar. Save it as a PDF (File, Save As, PDF) unless the job ad asks for Word, and give it a clear name such as "Firstname-Lastname-Resume.pdf". Tailor your summary and skills to each job ad, and address the selection criteria if there are any.</p>
  <p>For more help, read our guides on <a href="/au/blog/how-to-write-a-resume/">how to write a resume</a> and <a href="/au/blog/referees-on-a-resume/">referees on a resume</a>.</p>''',
 faqh="Frequently asked questions",
 faq=[("Are these Word resume templates really free?", "Yes. No account, no email and no payment: download the .docx file and use it for your applications."),
      ("Is a resume the same as a CV in Australia?", "Mostly, yes. Australians use both words for the document you send with a job application. Resume is more common, and CV is often used for longer academic or medical profiles."),
      ("How many referees should I put on my resume?", "At least two, usually people who have managed or supervised you. Ask them first, and do not list family members.")],
 src='Sources: <a href="https://www.dewr.gov.au/download/8284/resume-tips-and-example-resume/12432/resume-tips-and-example-resume/pdf" target="_blank" rel="noopener">Department of Employment and Workplace Relations, resume tips and example resume</a>.',
 foot=("/au/blog/", "Resume templates for Word"), arts=["how-to-write-a-resume", "resume-for-first-job"],
 artp='<strong>Prefer working in Word?</strong> Download one of our <a href="/au/resume-template-word/">free resume templates for Word</a>: classic, modern or no experience, each with a referees section.')

C["nz"] = dict(lang="en-NZ", home="/nz/", homel="Home", builder="/nz/cv-builder/", dl="Download the Word template", fmt=".docx file, A4, 1 page",
 title="Free CV Template for Word (NZ): 5 .docx Templates | CVLibre",
 desc="Free CV template for Word in New Zealand: 5 .docx CVs, elegant, two column, classic, modern and first job, with referees and no photo. No sign-up needed.",
 h1="Free CV templates for Word (New Zealand)",
 lead="Download a free CV template for Word below: five .docx files built for job applications in New Zealand: an elegant design, a two-column design, a classic, a modern and one for your first job. They follow Careers New Zealand advice (no photo, no date of birth, two referees) and open in Word, Google Docs or LibreOffice.",
 cta='<p>Rather not fiddle with formatting? The <strong>CVLibre online CV builder</strong> takes you through each section, offers 33 templates and gives you a clean PDF, free.</p><a class="btn" href="/nz/cv-builder/">Create my CV online</a>',
 cards={"elegant": ("Elegant CV", "A navy header band with your name and target role, then a timeline with dates on the left, and two referees at the end."), "two-column": ("Two-column CV", "A coloured sidebar for contact details, skills, languages and interests, with your experience and referees on the right."), "classic": ("Classic CV", "For most jobs: personal statement, skills, work experience, qualifications, interests and two referees. Simple to read and simple to update."),
        "modern": ("Modern CV", "With your target job title under your name, key skills backed by evidence and an achievements section. Good for a change of role or sector."),
        "first-job": ("First job CV", "For school leavers and students: skills first, then education and NCEA, part-time work, volunteering and roles in clubs, teams or on the marae.")},
 body='''  <h2 id="fill">How to fill in this CV template</h2>
  <p>Replace every text in square brackets with your own details, then delete the brackets. The headings and bullet points use real Word styles: to add a job, copy an existing block and paste it underneath, and the formatting follows.</p>
  <ul>
    <li><strong>Two pages at most:</strong> Careers New Zealand recommends keeping your CV to two pages. These templates fit on one page with room to grow.</li>
    <li><strong>No photo:</strong> Careers New Zealand advises against photos and images. Also leave out your date of birth or age, your marital status, your religion and your bank account details.</li>
    <li><strong>Personal statement:</strong> optional, but useful. Three or four lines on who you are, what you offer and the role you want.</li>
    <li><strong>Skills and experience:</strong> list your skills, then your jobs and volunteer work, most recent first. Back up each skill with an example.</li>
    <li><strong>Qualifications:</strong> give your NCEA level or your tertiary qualification, plus short courses that matter for the job.</li>
    <li><strong>Referees:</strong> you need at least two, and one should be your current manager or team leader if you have one. You can also write "Referees available on request".</li>
    <li><strong>Style:</strong> one black, easy-to-read font, no slang or abbreviations, and British spelling such as organised and licence.</li>
  </ul>
  <h2 id="choose">Which template should I pick?</h2>
  <p>The classic CV works for almost every job. The modern CV suits people who want their target role and strongest skills at the top, for example when moving into a new industry. The first job CV is for school leavers and students: sport, kapa haka, a part-time job or volunteering all show skills an employer wants.</p>
  <p>The elegant and two-column designs stand out when you email your CV or hand it in. For online application portals, the classic template is the safest choice, because some systems read columns in the wrong order.</p>
  <h2 id="send">Before you send your CV</h2>
  <p>Check the spelling carefully, then save your CV as a PDF (File, Save As, PDF) unless the employer asks for Word. Give it a clear name such as "Firstname-Lastname-CV.pdf", and tailor your personal statement and skills to each job ad.</p>
  <p>For more help, read our guides on <a href="/nz/blog/how-to-write-a-cv/">how to write a CV</a> and <a href="/nz/blog/referees-on-a-cv-nz/">referees on a CV</a>.</p>''',
 faqh="Frequently asked questions",
 faq=[("Are these Word CV templates really free?", "Yes. No account, no email and no payment: download the .docx file and use it for your applications."),
      ("Should I put a photo on my CV in New Zealand?", "No. Careers New Zealand advises against photos, and employers do not expect one. Leave out your date of birth and marital status too."),
      ("How many referees do I need on a NZ CV?", "At least two. Ideally one is your current manager or team leader. Ask them first, and check their phone numbers are up to date.")],
 src='Sources: <a href="https://www.careers.govt.nz/job-hunting/cvs-and-cover-letters/parts-of-a-cv" target="_blank" rel="noopener">Careers New Zealand, parts of a CV</a>.',
 foot=("/nz/blog/", "CV templates for Word"), arts=["cv-template-nz", "how-to-write-a-cv"],
 artp='<strong>Prefer working in Word?</strong> Download one of our <a href="/nz/cv-template-word/">free CV templates for Word</a>: classic, modern or first job, each with a referees section.')

C["de"] = dict(lang="de-DE", home="/de/", homel="Startseite", builder="/de/lebenslauf-erstellen/", dl="Word-Vorlage herunterladen", fmt=".docx-Datei, A4, 1 Seite",
 title="Lebenslauf Vorlage Word kostenlos: 5 Vorlagen (.docx) | CVLibre",
 desc="Lebenslauf Vorlage für Word kostenlos: 5 Lebensläufe (.docx), elegant, zweispaltig, klassisch, modern und ohne Berufserfahrung. Ohne Anmeldung, editierbar.",
 h1="Lebenslauf Vorlage für Word: 5 Vorlagen kostenlos",
 lead="Hier können Sie eine kostenlose Lebenslauf Vorlage für Word herunterladen: fünf Lebensläufe als .docx-Datei, elegant, zweispaltig, klassisch, modern und ohne Berufserfahrung. Jede Vorlage hat Platz für ein freiwilliges Bewerbungsfoto, Ort, Datum und Unterschrift und lässt sich in Word, LibreOffice oder Google Docs bearbeiten.",
 cta='<p>Keine Lust auf Formatierung? Mit dem <strong>Lebenslauf-Generator von CVLibre</strong> füllen Sie Ihren Lebenslauf Schritt für Schritt aus, wählen aus 33 Vorlagen und laden ein sauberes PDF herunter, kostenlos.</p><a class="btn" href="/de/lebenslauf-erstellen/">Lebenslauf online erstellen</a>',
 cards={"elegant": ("Eleganter Lebenslauf", "Ein farbiger Kopfbereich mit Name, Wunschposition, Kontaktdaten und Foto, darunter die Stationen mit den Zeiträumen links."), "zweispaltig": ("Zweispaltiger Lebenslauf", "Eine farbige Seitenleiste mit Foto, persönlichen Daten, Kenntnissen und Sprachen, rechts Berufserfahrung und Ausbildung."), "klassisch": ("Klassischer Lebenslauf", "Für die meisten Bewerbungen: persönliche Daten, Berufserfahrung, Ausbildung, Kenntnisse und Interessen in zwei Spalten, links die Zeiträume, rechts die Stationen."),
        "modern": ("Moderner Lebenslauf", "Mit Wunschposition unter dem Namen, einem kurzen Profil und einer dezenten Akzentfarbe. Passt gut zu Büro, Vertrieb, IT und Pflege."),
        "ohne-berufserfahrung": ("Lebenslauf ohne Berufserfahrung", "Für Schüler, Ausbildung und Berufseinstieg: Schulbildung zuerst, dann Praktika, Nebenjobs, Kenntnisse sowie Ehrenamt und Interessen.")},
 body='''  <h2 id="ausfuellen">So füllen Sie die Lebenslauf Vorlage aus</h2>
  <p>Ersetzen Sie jeden Text in eckigen Klammern durch Ihre Angaben und löschen Sie die Klammern. Überschriften und Aufzählungen nutzen echte Word-Formatvorlagen, die Stationen stehen in einer unsichtbaren Tabelle: Für eine weitere Station kopieren Sie eine Tabellenzeile und fügen sie darunter ein.</p>
  <ul>
    <li><strong>Persönliche Daten:</strong> Name, Anschrift, Telefon und E-Mail. Die Bundesagentur für Arbeit nennt auch Geburtsdatum und Geburtsort, Familienstand und Staatsangehörigkeit sind freiwillig. Durch das Gleichbehandlungsgesetz darf Ihnen kein Nachteil entstehen, wenn Sie solche Angaben weglassen.</li>
    <li><strong>Foto:</strong> Ein Bewerbungsfoto ist laut Bundesagentur für Arbeit kein Muss mehr. Wenn Sie eines verwenden, gehört es oben rechts in den Lebenslauf oder auf ein Deckblatt. Sonst löschen Sie den Rahmen einfach.</li>
    <li><strong>Antichronologisch:</strong> Die neueste Station steht oben. Schreiben Sie pro Stelle drei bis fünf kurze Stichpunkte, möglichst mit Zahlen.</li>
    <li><strong>Lücken:</strong> Längere Zeiträume ohne Station erklären Sie kurz, zum Beispiel mit Elternzeit, Weiterbildung oder Jobsuche.</li>
    <li><strong>Kenntnisse:</strong> Sprachen mit Niveau (zum Beispiel B2), EDV-Kenntnisse mit konkreten Programmen und Ihren Führerschein, wenn er für die Stelle zählt.</li>
    <li><strong>Länge:</strong> höchstens zwei Seiten. Die Vorlagen passen auf eine Seite und haben noch Platz.</li>
    <li><strong>Ort, Datum und Unterschrift:</strong> stehen traditionell am Ende, sind aber kein Muss. Bei einer Online-Bewerbung können Sie eine eingescannte Unterschrift einfügen oder die Zeile löschen.</li>
  </ul>
  <h2 id="auswahl">Welche Vorlage passt zu mir?</h2>
  <p>Der klassische Lebenslauf passt zu fast jeder Bewerbung, ob Handwerk, Handel, Verwaltung oder Pflege. Der moderne Lebenslauf eignet sich, wenn Sie Ihre Wunschposition und Ihr Profil gleich oben zeigen möchten, etwa nach einem Branchenwechsel. Die Vorlage ohne Berufserfahrung ist für die Bewerbung um einen Ausbildungsplatz, ein Praktikum oder den ersten Job gedacht.</p>
  <p>Die Vorlagen elegant und zweispaltig fallen auf, wenn Sie Ihre Bewerbung per E-Mail schicken. Für Online-Bewerbungsportale ist der klassische Lebenslauf die sicherere Wahl, weil manche Bewerbermanagementsysteme Spalten falsch auslesen.</p>
  <h2 id="versenden">Bevor Sie den Lebenslauf verschicken</h2>
  <p>Lesen Sie alles noch einmal auf Rechtschreibung. Speichern Sie den Lebenslauf als PDF (Datei, Speichern unter, PDF), wenn das Unternehmen nichts anderes verlangt, und geben Sie der Datei einen klaren Namen wie "Lebenslauf-Vorname-Nachname.pdf". Passen Sie Profil und Kenntnisse an jede Stellenanzeige an.</p>
  <p>Mehr dazu in unseren Ratgebern <a href="/de/ratgeber/lebenslauf-schreiben/">Lebenslauf schreiben</a> und <a href="/de/ratgeber/bewerbungsfoto/">Bewerbungsfoto</a>.</p>''',
 faqh="Häufige Fragen",
 faq=[("Sind die Lebenslauf Vorlagen wirklich kostenlos?", "Ja. Kein Konto, keine E-Mail-Adresse und keine Zahlung: Sie laden die .docx-Datei herunter und nutzen sie für Ihre Bewerbungen."),
      ("Muss ein Foto in den Lebenslauf?", "Nein. Ein Bewerbungsfoto ist freiwillig. Wenn Sie keines verwenden, löschen Sie den Fotorahmen oben rechts in der Vorlage."),
      ("Wie lang darf ein Lebenslauf sein?", "Höchstens zwei Seiten. Für Schüler und Berufseinsteiger reicht meist eine Seite, und alle fünf Vorlagen passen auf eine Seite.")],
 src='Quellen: <a href="https://www.arbeitsagentur.de/bildung/bewerbung/lebenslauf" target="_blank" rel="noopener">Bundesagentur für Arbeit, Lebenslauf</a>.',
 foot=("/de/ratgeber/", "Lebenslauf-Vorlagen für Word"), arts=["lebenslauf-schreiben", "lebenslauf-ohne-berufserfahrung"],
 artp='<strong>Lieber in Word arbeiten?</strong> Laden Sie eine unserer <a href="/de/lebenslauf-vorlage-word/">kostenlosen Lebenslauf Vorlagen für Word</a> herunter: klassisch, modern oder ohne Berufserfahrung.')


# Conseils d'édition propres au format de page de chaque pays (insérés avant le dernier paragraphe de liens)
def _tips(h, paper):
    return (f'  <h2 id="edit">{h}</h2>\n  <p>To add a bullet point, press Enter at the end of an existing one. To move a whole section, select its heading and the lines below it, then cut and paste. '
            f'If your text spills onto a second page, shorten older jobs to one or two bullet points before you make the font smaller: 10 points is about as small as you can go and stay easy to read. '
            f'The page is set to {paper}, so it prints correctly on standard paper, and the margins are about 1.8 cm.</p>\n')
EXTRA = {"us": _tips("Tips for editing the template in Word", "US Letter").replace("about 1.8 cm", "about 0.7 inch"),
         "ca": _tips("Tips for editing the template in Word", "Letter size, the standard paper format in Canada").replace("about 1.8 cm", "about 0.7 inch (1.8 cm)"),
         "au": _tips("Tips for editing the template in Word", "A4"), "nz": _tips("Tips for editing the template in Word", "A4"),
         "de": '  <h2 id="bearbeiten">Tipps zum Bearbeiten in Word</h2>\n  <p>Die Tabelle hat keine sichtbaren Rahmen. Wenn Sie die Spalten beim Bearbeiten sehen möchten, schalten Sie in Word die Gitternetzlinien ein: Sie werden nicht gedruckt. '
               'Für einen neuen Stichpunkt drücken Sie am Ende eines bestehenden die Eingabetaste. Ihr Foto fügen Sie über Einfügen, Bilder in den Rahmen oben rechts ein und passen die Größe an. '
               'Wird der Lebenslauf länger als eine Seite, kürzen Sie zuerst ältere Stationen auf ein bis zwei Stichpunkte, bevor Sie die Schrift verkleinern. Die Seite ist auf A4 mit 2 cm Rand eingestellt.</p>\n'}
for _cc, _t in EXTRA.items():
    _b = C[_cc]["body"]; _k = _b.rfind("  <p>"); C[_cc]["body"] = _b[:_k] + _t + _b[_k:]

ALTS = {"fr": "Aperçu du modèle de CV Word : ", "de": "Vorschau der Word-Vorlage: "}

# ---------------------------------------------------------------- gabarits
def fr_parts():
    s = open(os.path.join(ROOT, "blog/cv-senior/index.html"), encoding="utf-8").read()
    header = s[s.find('<a class="skip"'):s.find("</header>") + 10]
    foot = s[s.find('<footer class="foot">'):]
    foot = foot[:foot.find("</body>")]
    foot = re.sub(r'<script src="/assets/push\.js[^"]*" defer></script>\n?', "", foot).rstrip() + "\n"
    v = dict(consent=re.search(r'/assets/consent\.js\?v=(\w+)', s).group(1), style=re.search(r'/assets/style\.css\?v=(\w+)', s).group(1))
    def head(t, d, p, ld):
        url = "https://cvlibre.com" + p
        return f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8"><script>(window.adsbygoogle=window.adsbygoogle||[]).pauseAdRequests=1</script><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8638687738606649" crossorigin="anonymous"></script><script src="/assets/consent.js?v={v["consent"]}" defer></script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{t}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{url}">
<meta name="robots" content="index, follow">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:type" content="website">
<meta property="og:url" content="{url}">
<meta property="og:locale" content="fr_FR">
<meta property="og:image" content="https://cvlibre.com/assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="https://cvlibre.com/assets/og.png">
<meta name="theme-color" content="#f3f5f8">
<link rel="stylesheet" href="/assets/style.css?v={v["style"]}">
<link rel="icon" href="/assets/favicon.ico" sizes="32x32"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/source-sans-3-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
</head>
'''
    return head, header, foot

def parts(cc):
    if cc == "fr": return fr_parts()
    import blog_build
    h, H, F, _ = blog_build.parts(cc)
    return (lambda t, d, p, ld: h(t, d, p, ld=ld)), H, F

def esc(s): return s.replace("&", "&amp;").replace('"', "&quot;")
def strip(s): return re.sub(r"<[^>]+>", "", s).replace("&nbsp;", " ")

def page(cc):
    L = C[cc]; path = P[cc]; url = "https://cvlibre.com" + path
    assert len(L["title"]) <= 65, (cc, len(L["title"])); assert 150 <= len(L["desc"]) <= 160, (cc, len(L["desc"]))
    head, HEADER, FOOTER = parts(cc)
    docs = [{"@type": "DigitalDocument", "name": L["cards"][k][0], "encodingFormat": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
             "url": url + f, "inLanguage": L["lang"], "isAccessibleForFree": True} for k, f, _ in FILES[cc]]
    ld = {"@context": "https://schema.org", "@graph": [
        {"@type": "CollectionPage", "@id": url, "url": url, "name": L["h1"], "description": L["desc"], "inLanguage": L["lang"], "hasPart": docs,
         "isPartOf": {"@type": "WebSite", "name": "CVLibre", "url": "https://cvlibre.com/"}},
        {"@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in L["faq"]]},
        {"@type": "BreadcrumbList", "itemListElement": [{"@type": "ListItem", "position": 1, "name": L["homel"], "item": "https://cvlibre.com" + L["home"]},
                                                        {"@type": "ListItem", "position": 2, "name": L["h1"], "item": url}]}]}
    h = head(esc(L["title"]), esc(L["desc"]), path, ld)
    h = re.sub(r'(<link rel="alternate" hreflang="[^"]+" href="[^"]+">\n)+', "", h)
    h = h.replace('<link rel="canonical" href="' + url + '">\n', '<link rel="canonical" href="' + url + '">\n' + links(path), 1)
    h = h.replace("</head>", CSS + "</head>", 1)
    cards = ""
    alt = ALTS.get(cc, "Preview of the Word template: ")
    for k, f, _ in FILES[cc]:
        name, txt = L["cards"][k]; img = f[:-5] + ".webp"
        wh = 'width="560" height="725"' if cc in ("us", "ca") else 'width="560" height="791"'
        cards += f'''    <article class="wt-card">
      <img src="{path}{img}" alt="{alt}{name}" {wh} loading="lazy" decoding="async">
      <h2>{name}</h2>
      <p>{txt}</p>
      <p class="wt-fmt">{L["fmt"]}</p>
      <a class="btn" href="{path}{f}" download>{L["dl"]}</a>
    </article>
'''
    faq = "".join(f'    <details><summary>{q}</summary><p>{a}</p></details>\n' for q, a in L["faq"])
    crumbs = f'<nav class="crumbs" aria-label="{ {"fr": "Fil d&#39;Ariane", "de": "Brotkrumen"}.get(cc, "Breadcrumb") }"><a href="{L["home"]}">{L["homel"]}</a><span aria-hidden="true"> / </span><span>{L["h1"]}</span></nav>'
    body = f'''<body>
{HEADER}
<main id="main" class="wrap doc wt">
  {crumbs}
  <h1>{L["h1"]}</h1>
  <p class="lead">{L["lead"]}</p>
  <div class="wt-cta">{L["cta"]}</div>
  <section class="wt-grid" aria-label="{L["h1"]}">
{cards}  </section>
{L["body"]}
  <div class="wt-cta">{L["cta"]}</div>
  <h2 id="faq">{L["faqh"]}</h2>
  <div class="faq">
{faq}  </div>
  <p class="wt-src">{L["src"]}</p>
</main>
{FOOTER}</body>
</html>
'''
    out = os.path.join(ROOT, path.strip("/"), "index.html")
    open(out, "w", encoding="utf-8").write(h + body)
    words = len(strip(L["lead"] + " " + L["cta"] + " " + " ".join(" ".join(v) for v in L["cards"].values()) + " " + L["body"] + " " + " ".join(q + " " + a for q, a in L["faq"]) + " " + L["h1"]).split())
    return words

# ---------------------------------------------------------------- liens : pied de page et articles
SKIP = {".git", "tools", "content", "node_modules", "pdf", "pdf-demarches-france", "es", "it", "pt", "stats", "srv"}
def footer_links():
    n = 0
    for d, dirs, files in os.walk(ROOT):
        if d == ROOT: dirs[:] = [x for x in dirs if x not in SKIP]
        else: dirs[:] = [x for x in dirs if x not in ("pdf",)]
        for fn in files:
            if fn != "index.html": continue
            f = os.path.join(d, fn); s = open(f, encoding="utf-8").read()
            i = s.find('<footer class="foot">')
            if i < 0: continue
            j = s.find("</footer>", i); foot = s[i:j]
            for cc, L in C.items():
                href, text = L["foot"]; target = P[cc]
                m = re.search(r'(\n(\s*)<a href="' + re.escape(href) + r'">[^<]*</a>)', foot)
                if not m: continue
                if 'href="' + target + '"' in foot: break
                foot2 = foot[:m.end()] + "\n" + m.group(2) + '<a href="' + target + '">' + text + "</a>" + foot[m.end():]
                open(f, "w", encoding="utf-8").write(s[:i] + foot2 + s[j:]); n += 1
                break
    return n

def article_links():
    n = 0
    for cc, L in C.items():
        for slug in L["arts"]:
            if cc == "fr":
                f = os.path.join(ROOT, "blog", slug, "index.html"); s = open(f, encoding="utf-8").read()
                if 'href="/modele-cv-word/"' in s: continue
                k = s.find("</article>"); k = s.rfind("\n", 0, k) + 1; s = s[:k] + L["artp"] + "\n" + s[k:]
                open(f, "w", encoding="utf-8").write(s); n += 1
            else:
                f = os.path.join(ROOT, "content/blog", cc, slug + ".json"); A = json.load(open(f, encoding="utf-8"))
                if any(P[cc] in json.dumps(b, ensure_ascii=False) for b in A["blocks"]): continue
                A["blocks"].append(["p", L["artp"]])
                open(f, "w", encoding="utf-8").write(json.dumps(A, ensure_ascii=False, indent=1)); n += 1
    return n

if __name__ == "__main__":
    a = article_links()
    w = {cc: page(cc) for cc in C}
    print("pages modèles Word :", w, "| liens articles ajoutés :", a, "| pieds de page :", footer_links())
