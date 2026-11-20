"""20 nov 2026 (Jeremy) : modèles de CV Word (.docx) gratuits, 3 par pays (fr, en, us, ca, au, nz, de), 21 fichiers.
Chaque modèle suit les usages du pays (sources officielles citées sur les pages). Génération : python3 tools/i18n/word_docx.py
(nécessite python-docx). Les fichiers vont dans le dossier de la page de téléchargement (word_pages.py). Pas lancé par build_all.sh."""
import os
from docx import Document
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DIRS = {"fr": "modele-cv-word", "en": "en/cv-template-word", "us": "us/resume-template-word", "ca": "ca/resume-template-word",
        "au": "au/resume-template-word", "nz": "nz/cv-template-word", "de": "de/lebenslauf-vorlage-word"}
LANG = {"fr": "fr-FR", "en": "en-GB", "us": "en-US", "ca": "en-CA", "au": "en-AU", "nz": "en-NZ", "de": "de-DE"}
LETTER = {"us", "ca"}
COL = {"classic": "1F2937", "modern": "1F4FD8", "fresh": "0F766E", "de": "1F2937", "de-m": "1F4FD8", "de-f": "0F766E"}

# ---------------------------------------------------------------- outils Word
def _font(style, name, size=None, bold=None, color=None):
    f = style.font; f.name = name
    if size: f.size = Pt(size)
    if bold is not None: f.bold = bold
    f.color.rgb = RGBColor.from_string(color) if color else RGBColor(0x11, 0x18, 0x27)
    rpr = style.element.get_or_add_rPr(); rf = rpr.find(qn("w:rFonts"))
    if rf is None: rf = OxmlElement("w:rFonts"); rpr.insert(0, rf)
    for a in ("asciiTheme", "hAnsiTheme", "eastAsiaTheme", "cstheme"):
        if rf.get(qn("w:" + a)) is not None: del rf.attrib[qn("w:" + a)]
    for a in ("ascii", "hAnsi", "eastAsia", "cs"): rf.set(qn("w:" + a), name)

def _lang(style, lang):
    rpr = style.element.get_or_add_rPr(); l = rpr.find(qn("w:lang"))
    if l is None: l = OxmlElement("w:lang"); rpr.append(l)
    l.set(qn("w:val"), lang)

def _pbdr(style, color, sz=8, side="bottom", remove=False):
    ppr = style.element.get_or_add_pPr(); b = ppr.find(qn("w:pBdr"))
    if b is not None: ppr.remove(b)
    if remove: return
    b = OxmlElement("w:pBdr"); e = OxmlElement("w:" + side)
    for k, v in (("val", "single"), ("sz", str(sz)), ("space", "1"), ("color", color)): e.set(qn("w:" + k), v)
    b.append(e); ppr.append(b)

def _cell_border(cell, color="9CA3AF", sz=6, val="single"):
    tcpr = cell._tc.get_or_add_tcPr(); b = OxmlElement("w:tcBorders")
    for side in ("top", "left", "bottom", "right"):
        e = OxmlElement("w:" + side)
        for k, v in (("val", val), ("sz", str(sz)), ("space", "0"), ("color", color)): e.set(qn("w:" + k), v)
        b.append(e)
    tcpr.append(b)

def _no_borders(table):
    tblpr = table._tbl.tblPr; b = OxmlElement("w:tblBorders")
    for side in ("top", "left", "bottom", "right", "insideH", "insideV"):
        e = OxmlElement("w:" + side); e.set(qn("w:val"), "nil"); b.append(e)
    tblpr.append(b)

def _widths(table, cms):
    table.autofit = False
    tblpr = table._tbl.tblPr; lay = OxmlElement("w:tblLayout"); lay.set(qn("w:type"), "fixed"); tblpr.append(lay)
    for row in table.rows:
        for c, w in zip(row.cells, cms): c.width = Cm(w)
    grid = table._tbl.tblGrid
    for g, w in zip(grid.findall(qn("w:gridCol")), cms): g.set(qn("w:w"), str(int(w * 567)))

def _row_height(row, cm):
    trpr = row._tr.get_or_add_trPr(); h = OxmlElement("w:trHeight"); h.set(qn("w:val"), str(int(cm * 567))); h.set(qn("w:hRule"), "exact"); trpr.append(h)

def _clear(cell):
    p = cell.paragraphs[0]; return p

# ---------------------------------------------------------------- document
def new_doc(cc, layout, title):
    d = Document(); s = d.sections[0]
    if cc in LETTER: s.page_width, s.page_height = Cm(21.59), Cm(27.94)
    else: s.page_width, s.page_height = Cm(21.0), Cm(29.7)
    m = 2.0 if layout.startswith("de") else 1.8
    s.left_margin = s.right_margin = Cm(m); s.top_margin = Cm(1.6); s.bottom_margin = Cm(1.5)
    font = "Arial" if cc == "de" else "Calibri"
    acc = COL[layout]
    st = d.styles
    _font(st["Normal"], font, 10.5); _lang(st["Normal"], LANG[cc])
    st["Normal"].paragraph_format.space_after = Pt(2); st["Normal"].paragraph_format.space_before = Pt(0); st["Normal"].paragraph_format.line_spacing = 1.08
    _font(st["Title"], font, 22, True, acc); _pbdr(st["Title"], "000000", remove=True)
    st["Title"].paragraph_format.space_after = Pt(2); st["Title"].paragraph_format.space_before = Pt(0)
    _font(st["Subtitle"], font, 12, True, "374151"); st["Subtitle"].font.italic = False
    sp = st["Subtitle"].element.get_or_add_rPr().find(qn("w:spacing"))
    if sp is not None: sp.getparent().remove(sp)
    st["Subtitle"].paragraph_format.space_after = Pt(4)
    h = st["Heading 1"]; _font(h, font, 11.5, True, acc)
    h.paragraph_format.space_before = Pt(9); h.paragraph_format.space_after = Pt(3); h.paragraph_format.keep_with_next = True
    h.font.all_caps = layout in ("classic", "de"); _pbdr(h, acc if layout != "classic" else "6B7280", 6)
    h2 = st["Heading 2"]; _font(h2, font, 10.5, True, "111827")
    h2.paragraph_format.space_before = Pt(5); h2.paragraph_format.space_after = Pt(1); h2.paragraph_format.keep_with_next = True
    lb = st["List Bullet"]; _font(lb, font, 10.5); lb.paragraph_format.space_after = Pt(1)
    d.core_properties.title = title; d.core_properties.author = ""; d.core_properties.comments = "CVLibre (cvlibre.com)"
    d._cc, d._layout, d._acc, d._w = cc, layout, acc, (s.page_width - s.left_margin - s.right_margin)
    return d

def para(d, text, style=None, bold=False, italic=False, align=None, size=None, color=None, after=None, before=None):
    p = d.add_paragraph(style=style)
    for i, chunk in enumerate(text.split("**")):
        if not chunk: continue
        r = p.add_run(chunk); r.bold = bold or (i % 2 == 1); r.italic = italic
        if size: r.font.size = Pt(size)
        if color: r.font.color.rgb = RGBColor.from_string(color)
    if align: p.alignment = align
    if after is not None: p.paragraph_format.space_after = Pt(after)
    if before is not None: p.paragraph_format.space_before = Pt(before)
    return p

def header(d, name, sub, contact, photo=None):
    lay = d._layout
    if photo:
        t = d.add_table(rows=1, cols=2); _no_borders(t)
        W = d._w / 360000; _widths(t, [W - 3.3, 3.3]); t.alignment = WD_TABLE_ALIGNMENT.CENTER
        left, right = t.rows[0].cells
        p = left.paragraphs[0]; p.style = d.styles["Title"]; p.add_run(name)
        if sub: q = left.add_paragraph(style="Subtitle"); q.add_run(sub)
        for line in contact: left.add_paragraph(line)
        inner = right.add_table(rows=1, cols=1); _widths(inner, [3.0]); _row_height(inner.rows[0], 3.4)
        c = inner.rows[0].cells[0]; _cell_border(c, "9CA3AF", 6, "dashed")
        cp = c.paragraphs[0]; cp.alignment = WD_ALIGN_PARAGRAPH.CENTER; cp.paragraph_format.space_before = Pt(32)
        r = cp.add_run(photo); r.font.size = Pt(8.5); r.font.color.rgb = RGBColor(0x6B, 0x72, 0x80)
        right.paragraphs[0].paragraph_format.space_after = Pt(0)
        d.add_paragraph().paragraph_format.space_after = Pt(0)
        return
    center = lay == "classic"
    p = d.add_paragraph(style="Title"); p.add_run(name)
    if center: p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    if sub:
        q = d.add_paragraph(style="Subtitle"); q.add_run(sub)
        if center: q.alignment = WD_ALIGN_PARAGRAPH.CENTER
    c = para(d, "  |  ".join(contact), color="374151", after=4)
    if center: c.alignment = WD_ALIGN_PARAGRAPH.CENTER

def section(d, title): d.add_paragraph(title, style="Heading 1")

def job(d, left, right, bullets=(), sub=None):
    p = d.add_paragraph(style="Heading 2")
    p.paragraph_format.tab_stops.add_tab_stop(d._w, WD_TAB_ALIGNMENT.RIGHT)
    p.add_run(left); r = p.add_run("\t" + right); r.bold = False; r.font.color.rgb = RGBColor(0x4B, 0x55, 0x63)
    if sub: para(d, sub, italic=True, color="4B5563")
    for b in bullets: para(d, b, style="List Bullet")

def bullets(d, items):
    for b in items: para(d, b, style="List Bullet")

# Lebenslauf tabellarisch : colonne de gauche (dates), colonne de droite (contenu)
def de_rows(d, rows):
    t = d.add_table(rows=0, cols=2); _no_borders(t); W = d._w / 360000; _widths(t, [4.6, W - 4.6])
    for left, lines, bl in rows:
        row = t.add_row(); _widths_row(row, [4.6, W - 4.6]); a, b = row.cells
        a.paragraphs[0].add_run(left).font.color.rgb = RGBColor(0x37, 0x41, 0x51)
        p = b.paragraphs[0]
        for i, chunk in enumerate(lines[0].split("**")):
            if chunk: r = p.add_run(chunk); r.bold = (i % 2 == 1)
        for l in lines[1:]: b.add_paragraph(l)
        for x in bl: b.add_paragraph(x, style="List Bullet")
        b.paragraphs[-1].paragraph_format.space_after = Pt(5)
    return t

def _widths_row(row, cms):
    for c, w in zip(row.cells, cms): c.width = Cm(w)

def save(d, cc, fname):
    out = os.path.join(ROOT, DIRS[cc]); os.makedirs(out, exist_ok=True)
    p = os.path.join(out, fname); d.save(p); return p

# ---------------------------------------------------------------- contenus
def build_generic(cc, key, layout, spec):
    d = new_doc(cc, layout, spec["title"])
    header(d, spec["name"], spec.get("sub"), spec["contact"], spec.get("photo"))
    for title, items in spec["sections"]:
        section(d, title)
        for it in items:
            k = it[0]
            if k == "p": para(d, it[1])
            elif k == "job": job(d, it[1], it[2], it[3] if len(it) > 3 else (), it[4] if len(it) > 4 else None)
            elif k == "b": bullets(d, it[1])
            elif k == "rows": de_rows(d, it[1])
    for line in spec.get("end", []):
        para(d, line[0], **line[1])
    return save(d, cc, spec["file"])

T = {}

# ======================= FRANCE (1 page, photo facultative) =======================
FR_C = ["[Ville (département)]  |  [06 00 00 00 00]  |  [prenom.nom@email.fr]", "[Permis B, véhicule : seulement si utile pour le poste]"]
T["fr"] = [
 ("classique", "classic", dict(file="modele-cv-classique.docx", title="Modèle de CV classique", name="[Prénom NOM]", sub="[Intitulé du poste recherché]", contact=FR_C, photo="[Photo facultative]",
  sections=[
   ("Profil", [("p", "[En 2 ou 3 lignes : votre métier, vos années d'expérience et ce que vous apportez au poste visé. Supprimez ce paragraphe si vous préférez commencer par vos expériences.]")]),
   ("Expériences professionnelles", [
     ("job", "[Intitulé du poste], [Entreprise], [Ville]", "[MM/AAAA] - [MM/AAAA]", ["[Mission principale, avec un verbe d'action : gérer, accueillir, préparer...]", "[Réalisation concrète, chiffrée si possible : nombre de clients, budget, délai]", "[Outil, logiciel ou méthode utilisé au quotidien]"]),
     ("job", "[Intitulé du poste], [Entreprise], [Ville]", "[MM/AAAA] - [MM/AAAA]", ["[Mission principale]", "[Résultat obtenu ou responsabilité confiée]"]),
     ("job", "[Intitulé du poste], [Entreprise], [Ville]", "[MM/AAAA] - [MM/AAAA]", ["[Mission principale]", "[Résultat obtenu ou responsabilité confiée]"])]),
   ("Formation", [("job", "[Diplôme ou titre], [Établissement], [Ville]", "[AAAA]"), ("job", "[Diplôme ou titre], [Établissement], [Ville]", "[AAAA]")]),
   ("Compétences", [("b", ["[Compétence métier : technique, logiciel, machine, certification]", "[Compétence métier]", "[Qualité utile au poste, prouvée par une de vos expériences]"])]),
   ("Langues", [("b", ["[Anglais : niveau B2 du CECRL ou score de test, par exemple TOEIC]", "[Autre langue : niveau]"])]),
   ("Centres d'intérêt", [("p", "[Activité précise et parlante : bénévolat, sport pratiqué en club, association. Supprimez la rubrique si rien n'est utile.]")])])),
 ("moderne", "modern", dict(file="modele-cv-moderne.docx", title="Modèle de CV moderne", name="[Prénom NOM]", sub="[Intitulé du poste recherché]", contact=FR_C, photo="[Photo facultative]",
  sections=[
   ("Profil", [("p", "[2 ou 3 lignes : qui vous êtes professionnellement, votre point fort principal et le poste que vous visez.]")]),
   ("Compétences clés", [("b", ["**[Compétence 1]** : [exemple concret qui la prouve]", "**[Compétence 2]** : [exemple concret qui la prouve]", "**[Compétence 3]** : [exemple concret qui la prouve]"])]),
   ("Expériences professionnelles", [
     ("job", "[Intitulé du poste], [Entreprise]", "[Mois AAAA] - [Mois AAAA]", ["[Mission principale]", "[Réalisation chiffrée : +15 % de ventes, 30 commandes par jour...]", "[Responsabilité, outil ou projet marquant]"], "[Ville, type de contrat si utile]"),
     ("job", "[Intitulé du poste], [Entreprise]", "[Mois AAAA] - [Mois AAAA]", ["[Mission principale]", "[Réalisation ou résultat]"], "[Ville]")]),
   ("Formation", [("job", "[Diplôme ou titre professionnel], [Établissement]", "[AAAA]"), ("job", "[Formation courte ou certification]", "[AAAA]")]),
   ("Langues", [("p", "[Anglais : B2]  |  [Espagnol : A2]")]),
   ("Logiciels et outils", [("p", "[Pack Office]  |  [Logiciel métier]  |  [Outil collaboratif]")]),
   ("Centres d'intérêt", [("p", "[Une ou deux activités précises qui disent quelque chose de vous]")])])),
 ("premier-emploi", "fresh", dict(file="modele-cv-premier-emploi.docx", title="Modèle de CV premier emploi", name="[Prénom NOM]", sub="[Poste, stage ou alternance recherché]", contact=["[Ville (département)]  |  [06 00 00 00 00]  |  [prenom.nom@email.fr]", "[Disponibilité : date ou rythme d'alternance]"], photo="[Photo facultative]",
  sections=[
   ("Profil", [("p", "[2 lignes : votre formation, le poste visé et deux qualités que vous pouvez prouver par un exemple.]")]),
   ("Formation", [("job", "[Diplôme en cours ou obtenu], [Établissement], [Ville]", "[AAAA] - [AAAA]", ["[Matières, projet ou option en lien avec le poste]"]), ("job", "[Diplôme précédent : bac, CAP...], [Établissement]", "[AAAA]")]),
   ("Stages, jobs et bénévolat", [
     ("job", "[Stage : intitulé], [Entreprise], [Ville]", "[MM/AAAA] ([durée])", ["[Ce que vous avez fait concrètement]", "[Ce que vous avez appris ou réussi]"]),
     ("job", "[Job d'été ou étudiant], [Employeur]", "[MM/AAAA] - [MM/AAAA]", ["[Mission principale : accueil, caisse, mise en rayon...]"]),
     ("job", "[Bénévolat ou engagement], [Association]", "[AAAA]", ["[Rôle et action concrète]"])]),
   ("Compétences", [("b", ["[Compétence acquise en formation ou en stage]", "[Logiciel ou outil maîtrisé]", "[Qualité prouvée : ponctualité, travail en équipe, avec un exemple]"])]),
   ("Langues", [("p", "[Anglais : B1]  |  [Autre langue : niveau]")]),
   ("Centres d'intérêt", [("p", "[Sport, musique, projet personnel : précisez ce que vous faites vraiment]")])]))]

# ======================= ROYAUME-UNI (CV, 2 pages max, pas de photo ni d'âge) =======================
UK_C = ["[Town or city]", "[Phone number]", "[Email address]", "[LinkedIn profile, optional]"]
T["en"] = [
 ("classic", "classic", dict(file="cv-template-uk-classic.docx", title="UK CV template (classic)", name="[Your Name]", contact=UK_C, sections=[
   ("Personal statement", [("p", "[3 to 5 lines: who you are, the skills and experience you bring, and the role you are looking for. Tailor it to each job and back it up with facts.]")]),
   ("Work history", [
     ("job", "[Job title], [Employer], [Town]", "[Month Year] - [Month Year]", ["[Main responsibility, starting with an action verb: organised, managed, supported]", "[An achievement with a number: customers served, budget, time saved]", "[A skill or system you used every day]"]),
     ("job", "[Job title], [Employer], [Town]", "[Month Year] - [Month Year]", ["[Main responsibility]", "[Achievement or result]"]),
     ("job", "[Job title], [Employer], [Town]", "[Month Year] - [Month Year]", ["[Main responsibility]", "[Achievement or result]"])]),
   ("Education and qualifications", [("job", "[Degree, diploma or apprenticeship], [University, college or provider]", "[Year]"), ("job", "[A levels or equivalent: subjects and grades]", "[Year]"), ("job", "[GCSEs: number and grades, including English and maths]", "[Year]")]),
   ("Skills", [("b", ["[Job-specific skill, software or licence]", "[Job-specific skill]", "[Transferable skill, with a short example]"])]),
   ("Interests", [("p", "[Optional. Only include interests that say something useful about you: volunteering, a team sport, a club you run.]")]),
   ("References", [("p", "References available on request.")])])),
 ("modern", "modern", dict(file="cv-template-uk-modern.docx", title="UK CV template (modern)", name="[Your Name]", sub="[Job title you are applying for]", contact=UK_C, sections=[
   ("Personal statement", [("p", "[3 to 5 lines that match the job description: your experience, your strongest skills and what you want to do next.]")]),
   ("Key skills", [("b", ["**[Skill 1]**: [one line of evidence]", "**[Skill 2]**: [one line of evidence]", "**[Skill 3]**: [one line of evidence]", "**[Skill 4]**: [one line of evidence]"])]),
   ("Employment history", [
     ("job", "[Job title], [Employer]", "[Month Year] - present", ["[Main responsibility]", "[Achievement with a figure]", "[Project, team or tool you were responsible for]"], "[Town or city]"),
     ("job", "[Job title], [Employer]", "[Month Year] - [Month Year]", ["[Main responsibility]", "[Achievement or result]"], "[Town or city]")]),
   ("Education and training", [("job", "[Qualification], [Institution]", "[Year]"), ("job", "[Short course or certificate]", "[Year]")]),
   ("Achievements", [("b", ["[An award, a promotion or a target you beat]"])]),
   ("References", [("p", "References available on request.")])])),
 ("no-experience", "fresh", dict(file="cv-template-uk-no-experience.docx", title="UK CV template (no experience)", name="[Your Name]", sub="[Type of role, apprenticeship or placement you want]", contact=UK_C, sections=[
   ("Personal statement", [("p", "[3 or 4 lines: what you are studying or have just finished, the role you want and two qualities you can prove with an example.]")]),
   ("Education and qualifications", [("job", "[Course or qualification in progress], [School, college or university]", "[Year] - [Year]", ["[Relevant modules, project or predicted grades]"]), ("job", "[GCSEs: number and grades, including English and maths]", "[Year]")]),
   ("Skills", [("b", ["[Skill gained at school, college or in a hobby, with an example]", "[Software or tool you can use]", "[Personal quality: reliable, punctual, team player, with proof]"])]),
   ("Work experience and volunteering", [
     ("job", "[Work experience placement], [Organisation], [Town]", "[Month Year]", ["[What you did and what you learned]"]),
     ("job", "[Part-time job or volunteering role], [Organisation]", "[Month Year] - [Month Year]", ["[Main task]", "[Something you achieved or were trusted with]"])]),
   ("Interests and achievements", [("b", ["[Duke of Edinburgh Award, sports team, club, music grade: add a detail]"])]),
   ("References", [("p", "References available on request.")])]))]

# ======================= ÉTATS-UNIS (resume, 1 page, Summary) =======================
US_C = ["[City, State]", "[Phone]", "[Email]", "[LinkedIn URL]"]
T["us"] = [
 ("classic", "classic", dict(file="resume-template-us-classic.docx", title="US resume template (classic)", name="[Your Name]", contact=US_C, sections=[
   ("Summary", [("p", "[3 or 4 sentences: your profession, years of experience, top skills and the value you bring to this employer.]")]),
   ("Experience", [
     ("job", "[Job Title], [Company], [City, State]", "[Month Year] - [Month Year]", ["[Accomplishment starting with an action verb: organized, managed, increased]", "[Result with a number: dollars, percent, customers, time saved]", "[Key responsibility or tool you used]"]),
     ("job", "[Job Title], [Company], [City, State]", "[Month Year] - [Month Year]", ["[Accomplishment]", "[Result with a number]"]),
     ("job", "[Job Title], [Company], [City, State]", "[Month Year] - [Month Year]", ["[Accomplishment]", "[Result with a number]"])]),
   ("Education", [("job", "[Degree], [School], [City, State]", "[Year]"), ("job", "[Certification or training], [Organization]", "[Year]")]),
   ("Skills", [("p", "[Skill]  |  [Skill]  |  [Software]  |  [Certification]  |  [Language]")])])),
 ("modern", "modern", dict(file="resume-template-us-modern.docx", title="US resume template (modern)", name="[Your Name]", sub="[Headline: target job title]", contact=US_C, sections=[
   ("Summary", [("p", "[3 or 4 sentences tailored to the job posting. Use the same key words as the posting when they are true for you.]")]),
   ("Core Skills", [("p", "[Skill]  |  [Skill]  |  [Skill]  |  [Skill]  |  [Software]  |  [Software]")]),
   ("Professional Experience", [
     ("job", "[Job Title], [Company]", "[Month Year] - Present", ["[Accomplishment with a measurable result]", "[Accomplishment with a measurable result]", "[Project or responsibility]"], "[City, State]"),
     ("job", "[Job Title], [Company]", "[Month Year] - [Month Year]", ["[Accomplishment with a measurable result]", "[Responsibility]"], "[City, State]")]),
   ("Education", [("job", "[Degree], [School]", "[Year]")]),
   ("Certifications", [("p", "[Certification name], [Issuing organization], [Year]")])])),
 ("no-experience", "fresh", dict(file="resume-template-us-no-experience.docx", title="US resume template (no experience)", name="[Your Name]", contact=US_C, sections=[
   ("Summary", [("p", "[2 or 3 sentences: what you are studying or just finished, the job you want and two strengths you can prove.]")]),
   ("Education", [("job", "[Degree or High School Diploma], [School], [City, State]", "[Expected Month Year]", ["[GPA if 3.5 or higher, honors, relevant coursework]"])]),
   ("Skills", [("p", "[Skill]  |  [Skill]  |  [Software]  |  [Language]  |  [Certification: CPR, food handler...]")]),
   ("Experience", [
     ("job", "[Internship, Part-Time Job or Volunteer Role], [Organization]", "[Month Year] - [Month Year]", ["[What you did, starting with an action verb]", "[Result or responsibility you were trusted with]"]),
     ("job", "[Part-Time Job or Volunteer Role], [Organization]", "[Month Year] - [Month Year]", ["[What you did]"])]),
   ("Activities and Leadership", [("b", ["[Club, team or project: your role and one result]"])])]))]

# ======================= CANADA (resume, 2 pages max, bilinguisme, sans références) =======================
CA_C = ["[City, Province]", "[Phone]", "[Email]", "[LinkedIn URL]"]
T["ca"] = [
 ("classic", "classic", dict(file="resume-template-canada-classic.docx", title="Canadian resume template (classic)", name="[Your Name]", contact=CA_C, sections=[
   ("Profile", [("p", "[3 or 4 lines: your occupation, years of Canadian or international experience, main skills and the role you are targeting.]")]),
   ("Work Experience", [
     ("job", "[Job Title], [Employer], [City, Province or Country]", "[Month Year] - [Month Year]", ["[Accomplishment starting with an action verb: organized, coordinated, improved]", "[Result with a number]", "[Key responsibility, tool or licence]"]),
     ("job", "[Job Title], [Employer], [City, Province or Country]", "[Month Year] - [Month Year]", ["[Accomplishment]", "[Result]"]),
     ("job", "[Job Title], [Employer], [City, Province or Country]", "[Month Year] - [Month Year]", ["[Accomplishment]"])]),
   ("Education", [("job", "[Diploma or Degree], [College or University], [City, Country]", "[Year]", ["[If earned abroad: Canadian equivalency, if you have an assessment]"])]),
   ("Skills", [("b", ["[Technical skill or software]", "[Technical skill or certification]", "[Transferable skill with a short example]"])]),
   ("Languages", [("p", "[English: fluent]  |  [French: intermediate, or your level]  |  [Other language]")])])),
 ("modern", "modern", dict(file="resume-template-canada-modern.docx", title="Canadian resume template (modern)", name="[Your Name]", sub="[Target job title]  |  Bilingual: [English and French]", contact=CA_C, sections=[
   ("Profile", [("p", "[3 or 4 lines tailored to the job posting: experience, strongest skills, what you want to do next.]")]),
   ("Key Skills", [("b", ["**[Skill 1]**: [one line of evidence]", "**[Skill 2]**: [one line of evidence]", "**[Skill 3]**: [one line of evidence]"])]),
   ("Professional Experience", [
     ("job", "[Job Title], [Employer]", "[Month Year] - Present", ["[Accomplishment with a measurable result]", "[Project or responsibility]", "[Tool, licence or certification used]"], "[City, Province]"),
     ("job", "[Job Title], [Employer]", "[Month Year] - [Month Year]", ["[Accomplishment with a measurable result]", "[Responsibility]"], "[City, Province or Country]")]),
   ("Education", [("job", "[Diploma or Degree], [Institution]", "[Year]")]),
   ("Certifications", [("p", "[Certification or licence], [Issuing organization], [Year]")]),
   ("Languages", [("p", "[English: fluent]  |  [French: fluent]")])])),
 ("no-experience", "fresh", dict(file="resume-template-canada-no-experience.docx", title="Canadian resume template (no experience)", name="[Your Name]", sub="[Type of job, co-op or summer job you want]", contact=CA_C, sections=[
   ("Profile", [("p", "[2 or 3 lines: your studies, the job you want and two strengths you can show with an example.]")]),
   ("Education", [("job", "[Program, Diploma or High School Diploma], [School], [City, Province]", "[Year] - [Year]", ["[Relevant courses, projects or awards]"])]),
   ("Skills", [("b", ["[Skill from school, a project or a hobby, with an example]", "[Software or tool]", "[Certificate: First Aid, Food Handler, Smart Serve...]"])]),
   ("Experience", [
     ("job", "[Co-op Placement, Part-Time Job or Summer Job], [Employer]", "[Month Year] - [Month Year]", ["[What you did, starting with an action verb]", "[Result or responsibility]"]),
     ("job", "[Volunteer Role], [Organization]", "[Month Year] - [Month Year]", ["[What you did]"])]),
   ("Languages", [("p", "[English: fluent]  |  [French: your level]  |  [Other language]")])]))]

# ======================= AUSTRALIE (resume, Referees à la fin, 2 pages max) =======================
AU_C = ["[Suburb, State]", "[Mobile]", "[Email]", "[LinkedIn URL, optional]"]
AU_REF = [("job", "[Referee name], [Job title]", "[Phone]", (), "[Organisation]  |  [Email]  |  [How they know you: former manager]"),
          ("job", "[Referee name], [Job title]", "[Phone]", (), "[Organisation]  |  [Email]  |  [How they know you]")]
T["au"] = [
 ("classic", "classic", dict(file="resume-template-australia-classic.docx", title="Australian resume template (classic)", name="[Your Name]", contact=AU_C, sections=[
   ("About me", [("p", "[3 or 4 lines: your occupation, your experience, the skills you bring and the role you are looking for.]")]),
   ("Key skills", [("b", ["[Skill related to the job, with a short example]", "[Skill related to the job]", "[Software, equipment or system]"])]),
   ("Employment history", [
     ("job", "[Job title], [Employer], [Suburb]", "[Month Year] - [Month Year]", ["[Duty or achievement, starting with an action verb: organised, supervised, improved]", "[Achievement with a number]", "[Key responsibility]"]),
     ("job", "[Job title], [Employer], [Suburb]", "[Month Year] - [Month Year]", ["[Duty or achievement]", "[Result]"])]),
   ("Education and training", [("job", "[Qualification: Certificate III, Diploma, Bachelor...], [Provider]", "[Year]"), ("job", "[Year 12 or equivalent], [School]", "[Year]")]),
   ("Licences and certificates", [("p", "[Driver licence]  |  [White Card]  |  [First Aid]  |  [Working with Children Check]")]),
   ("Referees", AU_REF)])),
 ("modern", "modern", dict(file="resume-template-australia-modern.docx", title="Australian resume template (modern)", name="[Your Name]", sub="[Target job title]", contact=AU_C, sections=[
   ("Professional summary", [("p", "[3 or 4 lines tailored to the job ad: experience, strongest skills and what you want to do next.]")]),
   ("Key skills", [("b", ["**[Skill 1]**: [one line of evidence]", "**[Skill 2]**: [one line of evidence]", "**[Skill 3]**: [one line of evidence]"])]),
   ("Career history", [
     ("job", "[Job title], [Employer]", "[Month Year] - present", ["[Achievement with a measurable result]", "[Responsibility or project]", "[System or equipment used]"], "[Suburb, State]"),
     ("job", "[Job title], [Employer]", "[Month Year] - [Month Year]", ["[Achievement with a measurable result]", "[Responsibility]"], "[Suburb, State]")]),
   ("Education", [("job", "[Qualification], [Institution]", "[Year]")]),
   ("Licences and certifications", [("p", "[Licence or certificate]  |  [Licence or certificate]")]),
   ("Referees", AU_REF)])),
 ("no-experience", "fresh", dict(file="resume-template-australia-no-experience.docx", title="Australian resume template (no experience)", name="[Your Name]", sub="[Type of job, traineeship or apprenticeship you want]", contact=AU_C, sections=[
   ("Career objective", [("p", "[2 or 3 lines: what you are studying or just finished, the job you want and two qualities you can prove.]")]),
   ("Education", [("job", "[Year 12, Certificate or degree in progress], [School or provider]", "[Year] - [Year]", ["[Relevant subjects, projects or awards]"])]),
   ("Skills", [("b", ["[Skill from school, sport or a hobby, with an example]", "[Software or tool]", "[Personal quality: reliable, punctual, team player, with proof]"])]),
   ("Work experience and volunteering", [
     ("job", "[Work experience placement or casual job], [Employer]", "[Month Year] - [Month Year]", ["[What you did]", "[What you were trusted with]"]),
     ("job", "[Volunteer role], [Organisation]", "[Month Year]", ["[What you did]"])]),
   ("Licences and certificates", [("p", "[Learner or provisional licence]  |  [RSA]  |  [First Aid]")]),
   ("Referees", AU_REF)]))]

# ======================= NOUVELLE-ZÉLANDE (CV, Referees, 2 pages) =======================
NZ_C = ["[Town or city]", "[Mobile]", "[Email]", "[LinkedIn URL, optional]"]
NZ_REF = [("job", "[Referee name], [Job title]", "[Phone]", (), "[Organisation]  |  [Email]  |  [Relationship: current manager or team leader]"),
          ("job", "[Referee name], [Job title]", "[Phone]", (), "[Organisation]  |  [Email]  |  [Relationship]")]
T["nz"] = [
 ("classic", "classic", dict(file="cv-template-nz-classic.docx", title="New Zealand CV template (classic)", name="[Your Name]", contact=NZ_C, sections=[
   ("Personal statement", [("p", "[3 or 4 lines: who you are, the skills and experience you bring and the kind of role you are looking for.]")]),
   ("Skills", [("b", ["[Skill related to the job, with a short example]", "[Skill related to the job]", "[Software, equipment or licence]"])]),
   ("Work experience", [
     ("job", "[Job title], [Employer], [Town]", "[Month Year] - [Month Year]", ["[Main task or achievement, starting with an action verb: organised, supported, improved]", "[Achievement with a number]", "[Key responsibility]"]),
     ("job", "[Job title], [Employer], [Town]", "[Month Year] - [Month Year]", ["[Main task or achievement]", "[Result]"])]),
   ("Qualifications", [("job", "[Qualification: NZ Certificate, Diploma, degree], [Provider]", "[Year]"), ("job", "[NCEA level or equivalent], [School]", "[Year]")]),
   ("Interests", [("p", "[Optional: interests that show useful skills, such as a club, coaching or volunteering]")]),
   ("Referees", NZ_REF)])),
 ("modern", "modern", dict(file="cv-template-nz-modern.docx", title="New Zealand CV template (modern)", name="[Your Name]", sub="[Target job title]", contact=NZ_C, sections=[
   ("Personal statement", [("p", "[3 or 4 lines tailored to the job ad: experience, strongest skills and what you want to do next.]")]),
   ("Key skills", [("b", ["**[Skill 1]**: [one line of evidence]", "**[Skill 2]**: [one line of evidence]", "**[Skill 3]**: [one line of evidence]"])]),
   ("Work history", [
     ("job", "[Job title], [Employer]", "[Month Year] - present", ["[Achievement with a measurable result]", "[Responsibility or project]", "[System or equipment used]"], "[Town or city]"),
     ("job", "[Job title], [Employer]", "[Month Year] - [Month Year]", ["[Achievement with a measurable result]", "[Responsibility]"], "[Town or city]")]),
   ("Qualifications and training", [("job", "[Qualification], [Provider]", "[Year]"), ("job", "[Short course or certificate]", "[Year]")]),
   ("Achievements", [("b", ["[An award, a promotion or a target you beat]"])]),
   ("Referees", NZ_REF)])),
 ("first-job", "fresh", dict(file="cv-template-nz-first-job.docx", title="New Zealand CV template (first job)", name="[Your Name]", sub="[Type of job or apprenticeship you want]", contact=NZ_C, sections=[
   ("Personal statement", [("p", "[2 or 3 lines: what you are studying or just finished, the job you want and two qualities you can prove.]")]),
   ("Skills", [("b", ["[Skill from school, sport or a hobby, with an example]", "[Software or tool]", "[Personal quality: reliable, punctual, team player, with proof]"])]),
   ("Education", [("job", "[School or provider]", "[Year] - [Year]", ["[NCEA level and endorsements, relevant subjects or awards]"])]),
   ("Work and volunteer experience", [
     ("job", "[Part-time job, work experience or volunteering], [Organisation]", "[Month Year] - [Month Year]", ["[What you did]", "[What you were trusted with]"]),
     ("job", "[Role in a club, team or marae], [Organisation]", "[Year]", ["[What you did]"])]),
   ("Interests", [("p", "[Sport, music, a project: say what you actually do]")]),
   ("Referees", NZ_REF)]))]

# ======================= ALLEMAGNE (Lebenslauf tabellarisch) =======================
DE_PD = ("rows", [("Name", ["[Vorname Nachname]"], []), ("Anschrift", ["[Straße Hausnummer], [PLZ Ort]"], []), ("Telefon", ["[Telefonnummer]"], []), ("E-Mail", ["[E-Mail-Adresse]"], []),
                  ("Geburtsdatum", ["[TT.MM.JJJJ] in [Ort] (freiwillige Angabe)"], [])])
DE_END = [("[Ort], [TT.MM.JJJJ]", dict(before=10, after=16)), ("[Unterschrift]", dict(color="6B7280"))]
def de_spec(file, title, sub, sections):
    return dict(file=file, title=title, name="Lebenslauf", sub=sub, contact=[], photo="[Bewerbungsfoto, freiwillig]", sections=[("Persönliche Daten", [DE_PD])] + sections, end=DE_END)
T["de"] = [
 ("klassisch", "de", de_spec("lebenslauf-vorlage-klassisch.docx", "Lebenslauf Vorlage klassisch", "[Vorname Nachname]", [
   ("Berufserfahrung", [("rows", [
     ("[MM/JJJJ] - heute", ["**[Position]**", "[Unternehmen], [Ort]"], ["[Aufgabe oder Erfolg, möglichst mit Zahl]", "[Aufgabe oder Erfolg]", "[Verantwortung, Werkzeug oder Projekt]"]),
     ("[MM/JJJJ] - [MM/JJJJ]", ["**[Position]**", "[Unternehmen], [Ort]"], ["[Aufgabe oder Erfolg]", "[Aufgabe oder Erfolg]"]),
     ("[MM/JJJJ] - [MM/JJJJ]", ["**[Position]**", "[Unternehmen], [Ort]"], ["[Aufgabe oder Erfolg]"])])]),
   ("Ausbildung", [("rows", [("[MM/JJJJ] - [MM/JJJJ]", ["**[Abschluss: Ausbildung, Studium]**", "[Betrieb, Berufsschule oder Hochschule], [Ort]"], []),
                             ("[MM/JJJJ] - [MM/JJJJ]", ["**[Schulabschluss]**", "[Schule], [Ort]"], [])])]),
   ("Kenntnisse", [("rows", [("Sprachen", ["[Deutsch: Muttersprache]", "[Englisch: B2]"], []), ("EDV", ["[Programm], [Programm], [Programm]"], []), ("Führerschein", ["[Klasse B]"], [])])]),
   ("Interessen", [("rows", [("Ehrenamt, Hobbys", ["[Freiwillige Angabe, wenn sie zur Stelle passt]"], [])])])])),
 ("modern", "de-m", de_spec("lebenslauf-vorlage-modern.docx", "Lebenslauf Vorlage modern", "[Vorname Nachname]  |  [Gewünschte Position]", [
   ("Kurzprofil", [("p", "[2 bis 3 Zeilen: Ihr Beruf, Ihre Erfahrung und was Sie der neuen Stelle bieten.]")]),
   ("Berufserfahrung", [("rows", [
     ("[MM/JJJJ] - heute", ["**[Position]**", "[Unternehmen], [Ort]"], ["[Erfolg mit Zahl: Umsatz, Kunden, Zeit]", "[Projekt oder Verantwortung]", "[Werkzeug oder Methode]"]),
     ("[MM/JJJJ] - [MM/JJJJ]", ["**[Position]**", "[Unternehmen], [Ort]"], ["[Erfolg oder Aufgabe]", "[Erfolg oder Aufgabe]"])])]),
   ("Ausbildung", [("rows", [("[MM/JJJJ] - [MM/JJJJ]", ["**[Abschluss]**", "[Hochschule oder Berufsschule], [Ort]"], []), ("[JJJJ]", ["**[Weiterbildung oder Zertifikat]**", "[Anbieter]"], [])])]),
   ("Kenntnisse", [("rows", [("Sprachen", ["[Deutsch: Muttersprache]  |  [Englisch: C1]"], []), ("EDV", ["[Programm]  |  [Programm]  |  [Programm]"], []), ("Führerschein", ["[Klasse B]"], [])])])])),
 ("ohne-berufserfahrung", "de-f", de_spec("lebenslauf-vorlage-ohne-berufserfahrung.docx", "Lebenslauf Vorlage ohne Berufserfahrung", "[Vorname Nachname]", [
   ("Schulbildung", [("rows", [("[MM/JJJJ] - [MM/JJJJ]", ["**[Angestrebter oder erreichter Schulabschluss]**", "[Schule], [Ort]"], ["[Lieblingsfächer oder Projekte, die zur Stelle passen]"])])]),
   ("Praktika und Nebenjobs", [("rows", [
     ("[MM/JJJJ]", ["**[Praktikum als ...]**", "[Betrieb], [Ort]"], ["[Was Sie gemacht haben]", "[Was Sie gelernt haben]"]),
     ("[MM/JJJJ] - [MM/JJJJ]", ["**[Nebenjob oder Ferienjob]**", "[Arbeitgeber], [Ort]"], ["[Aufgabe]"])])]),
   ("Kenntnisse", [("rows", [("Sprachen", ["[Deutsch: Muttersprache]", "[Englisch: Schulkenntnisse, B1]"], []), ("EDV", ["[Programm], [Programm]"], []), ("Führerschein", ["[Falls vorhanden]"], [])])]),
   ("Ehrenamt und Interessen", [("rows", [("[Seit JJJJ]", ["[Verein, Ehrenamt oder Hobby, mit einem konkreten Detail]"], [])])])]))]

FILES = {cc: [(k, s["file"], s["title"]) for k, _, s in v] for cc, v in T.items()}

if __name__ == "__main__":
    for cc, lst in T.items():
        for key, layout, spec in lst:
            p = build_generic(cc, key, layout, spec)
            print(os.path.relpath(p, ROOT))

def previews(tmp):
    """Aperçus WebP légers (page 1) à côté de chaque .docx : python3 word_docx.py --apercus <dossier temporaire> (LibreOffice et pdftoppm)."""
    import subprocess, glob
    from PIL import Image
    for cc, lst in FILES.items():
        for key, fname, title in lst:
            src = os.path.join(ROOT, DIRS[cc], fname)
            subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", tmp, src], capture_output=True)
            pdf = os.path.join(tmp, fname[:-5] + ".pdf"); png = os.path.join(tmp, fname[:-5])
            subprocess.run(["pdftoppm", "-r", "72", "-png", "-singlefile", "-f", "1", "-l", "1", pdf, png], check=True)
            im = Image.open(png + ".png").convert("RGB"); im.thumbnail((560, 800))
            out = os.path.join(ROOT, DIRS[cc], fname[:-5] + ".webp"); im.save(out, "WEBP", quality=82, method=6)
            print(os.path.relpath(out, ROOT), im.size, os.path.getsize(out) // 1024, "Ko")

if __name__ == "__main__" and len(__import__("sys").argv) > 2 and __import__("sys").argv[1] == "--apercus":
    previews(__import__("sys").argv[2])
