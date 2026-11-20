"""20 nov 2026 (Jeremy) : 2 modèles Word plus graphiques par pays, en plus des 3 de word_docx.py.
- "élégant" : bandeau de couleur en haut (nom, poste, contact), puis frise avec les dates à gauche ;
- "deux colonnes" : colonne de couleur à gauche (contact, compétences, langues), contenu à droite.
Toujours de vrais styles Word et des tableaux sans bordure, faciles à modifier. Lancer : python3 tools/i18n/word_design.py
(ajouter --apercus <dossier> pour refaire les aperçus WebP)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
import word_docx as W
from docx.shared import Pt, Cm, RGBColor
from docx.enum.text import WD_TAB_ALIGNMENT, WD_ALIGN_PARAGRAPH
from docx.enum.style import WD_STYLE_TYPE
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

W.COL.update({"elegant": "1B2A41", "column": "0F766E"})
GOLD, SIDE = "B8892B", "134E4A"

def shade(cell, fill):
    tcpr = cell._tc.get_or_add_tcPr(); s = OxmlElement("w:shd")
    for k, v in (("val", "clear"), ("color", "auto"), ("fill", fill)): s.set(qn("w:" + k), v)
    tcpr.append(s)

def margins(cell, t, l, b, r):
    tcpr = cell._tc.get_or_add_tcPr(); m = OxmlElement("w:tcMar")
    for side, v in (("top", t), ("left", l), ("bottom", b), ("right", r)):
        e = OxmlElement("w:" + side); e.set(qn("w:w"), str(int(v * 567))); e.set(qn("w:type"), "dxa"); m.append(e)
    tcpr.append(m)

def row_min(row, cm):
    trpr = row._tr.get_or_add_trPr(); h = OxmlElement("w:trHeight"); h.set(qn("w:val"), str(int(cm * 567))); h.set(qn("w:hRule"), "atLeast"); trpr.append(h)

def cp(cell, text, style=None, color=None, size=None, bold=None, italic=None, first=False, after=None, before=None, caps=False):
    p = cell.paragraphs[0] if first else cell.add_paragraph()
    if style: p.style = cell.part.document.styles[style] if hasattr(cell.part, "document") else style
    for i, chunk in enumerate(text.split("**")):
        if not chunk: continue
        r = p.add_run(chunk)
        if i % 2 == 1: r.bold = True
        elif bold is not None: r.bold = bold
        if italic: r.italic = True
        if color: r.font.color.rgb = RGBColor.from_string(color)
        if size: r.font.size = Pt(size)
        if caps: r.font.all_caps = True
    if after is not None: p.paragraph_format.space_after = Pt(after)
    if before is not None: p.paragraph_format.space_before = Pt(before)
    return p

def photo_box(cell, label, w=3.0, h=3.6, color="FFFFFF", text="FFFFFF", align=WD_ALIGN_PARAGRAPH.CENTER):
    t = cell.add_table(rows=1, cols=1); W._widths(t, [w]); W._row_height(t.rows[0], h); t.alignment = 1 if align == WD_ALIGN_PARAGRAPH.CENTER else 0
    c = t.rows[0].cells[0]; W._cell_border(c, color, 8, "dashed")
    p = c.paragraphs[0]; p.alignment = WD_ALIGN_PARAGRAPH.CENTER; p.paragraph_format.space_before = Pt(h * 9)
    r = p.add_run(label); r.font.size = Pt(8.5); r.font.color.rgb = RGBColor.from_string(text)
    return t

def styles(d, side=False):
    st = d.styles; F = st["Normal"].font.name
    if side:
        a = st.add_style("Sidebar Heading", WD_STYLE_TYPE.PARAGRAPH); a.base_style = st["Normal"]
        W._font(a, F, 10.5, True, "FFFFFF"); a.font.all_caps = True
        a.paragraph_format.space_before = Pt(12); a.paragraph_format.space_after = Pt(4); a.paragraph_format.keep_with_next = True
        W._pbdr(a, "5EEAD4", 6)
        b = st.add_style("Sidebar Text", WD_STYLE_TYPE.PARAGRAPH); b.base_style = st["Normal"]
        W._font(b, F, 9.5, None, "ECFDF5"); b.paragraph_format.space_after = Pt(3)

# ---------------------------------------------------------------- mises en page
def section_main(d, cell, title, first=False):
    return cp(cell, title, style="Heading 1", first=first)

def job_rows(d, cell, w, jobs, date_col=None):
    """Frise : dates à gauche (élégant) ou poste + dates à droite sur une ligne (deux colonnes)."""
    if date_col:
        t = cell.add_table(rows=0, cols=2)
        W._no_borders(t); W._widths(t, [date_col, w - date_col])
        for title, org, dates, bl in jobs:
            row = t.add_row(); W._widths_row(row, [date_col, w - date_col]); a, b = row.cells
            cp(a, dates, color=GOLD, size=9.5, bold=True, first=True)
            cp(b, title, style="Heading 2", first=True).paragraph_format.space_before = Pt(0); cp(b, org, italic=True, color="4B5563")
            for x in bl: cp(b, x, style="List Bullet")
            b.paragraphs[-1].paragraph_format.space_after = Pt(6)
        return t
    for title, org, dates, bl in jobs:
        p = cp(cell, title, style="Heading 2")
        p.paragraph_format.tab_stops.add_tab_stop(Cm(w - 0.05), WD_TAB_ALIGNMENT.RIGHT)
        r = p.add_run("\t" + dates); r.bold = False; r.font.color.rgb = RGBColor(0x4B, 0x55, 0x63); r.font.size = Pt(9.5)
        cp(cell, org, italic=True, color="4B5563")
        for x in bl: cp(cell, x, style="List Bullet")

def extras(d, cell, w, D, date_col=None):
    for head, kind, items in D.get("extra", []):
        section_main(d, cell, head)
        if kind == "p": cp(cell, items)
        elif kind == "refs":
            for name, det in items:
                cp(cell, name, bold=True, after=0); cp(cell, det, color="4B5563", after=5)

def elegant(cc, D):
    d = W.new_doc(cc, "elegant", D["title_e"]); styles(d)
    sec = d.sections[0]; sec.left_margin = sec.right_margin = Cm(1.6); sec.top_margin = Cm(1.2)
    w = (sec.page_width - sec.left_margin - sec.right_margin) / 360000; d._w = Cm(w)
    W._pbdr(d.styles["Heading 1"], GOLD, 8); d.styles["Heading 1"].font.all_caps = True
    d.styles["Heading 1"].paragraph_format.space_before = Pt(10)
    ph = D.get("photo")
    band = d.add_table(rows=1, cols=2 if ph else 1); W._no_borders(band)
    W._widths(band, [w - 3.6, 3.6] if ph else [w])
    L = band.rows[0].cells[0]; shade(L, W.COL["elegant"]); margins(L, 0.45, 0.6, 0.45, 0.4)
    p = cp(L, D["name"], style="Title", color="FFFFFF", first=True, size=24)
    cp(L, D["job"], color=GOLD, size=12.5, bold=True, after=6)
    cp(L, "   |   ".join(D["contact"]), color="E5E7EB", size=9.5, after=0)
    if D.get("contact2"): cp(L, "   |   ".join(D["contact2"]), color="E5E7EB", size=9.5, after=0)
    if ph:
        R = band.rows[0].cells[1]; shade(R, W.COL["elegant"]); margins(R, 0.35, 0.2, 0.35, 0.35)
        R.paragraphs[0].paragraph_format.space_after = Pt(0); photo_box(R, ph, 2.8, 3.3, GOLD, "E5E7EB")
    C = d; H = D["h"]; first = False
    d.add_paragraph().paragraph_format.space_after = Pt(0)
    if D.get("personal"):
        section_main(d, C, H["contact"])
        t = C.add_table(rows=0, cols=2); W._no_borders(t); W._widths(t, [3.9, w - 3.9])
        for k, v in D["personal"]:
            row = t.add_row(); W._widths_row(row, [3.9, w - 3.9]); cp(row.cells[0], k, color=GOLD, bold=True, size=9.5, first=True); cp(row.cells[1], v, first=True)
    section_main(d, C, H["profile"], first=first); cp(C, D["profile"])
    section_main(d, C, H["exp"]); job_rows(d, C, w, D["jobs"], 3.9)
    section_main(d, C, H["edu"]); job_rows(d, C, w, [(a, b, y, []) for a, b, y in D["edu"]], 3.9)
    section_main(d, C, H["skills"])
    sk = D["skills"]; half = (len(sk) + 1) // 2
    t = C.add_table(rows=1, cols=2); W._no_borders(t); W._widths(t, [w / 2, w / 2])
    for col, items in zip(t.rows[0].cells, (sk[:half], sk[half:])):
        for i, x in enumerate(items): p = cp(col, x, style="List Bullet", first=(i == 0))
    for key in ("langs", "interests"):
        if D.get(key): section_main(d, C, H[key]); cp(C, "   |   ".join(D[key]) if isinstance(D[key], list) else D[key])
    extras(d, C, w, D)
    for txt, kw in D.get("end", []): cp(C, txt, **kw)
    return W.save(d, cc, D["file_e"])

def column(cc, D):
    d = W.new_doc(cc, "column", D["title_c"]); styles(d, side=True)
    sec = d.sections[0]
    for a in ("left_margin", "right_margin", "top_margin", "bottom_margin"): setattr(sec, a, Cm(1.0))
    w = (sec.page_width - sec.left_margin - sec.right_margin) / 360000; sw = 6.0
    d.styles["Heading 1"].font.all_caps = True; W._pbdr(d.styles["Heading 1"], "99D5CF", 6)
    t = d.add_table(rows=1, cols=2); W._no_borders(t); W._widths(t, [sw, w - sw])
    row_min(t.rows[0], (sec.page_height - sec.top_margin - sec.bottom_margin) / 360000 - 0.15)
    S, M = t.rows[0].cells; shade(S, SIDE); margins(S, 0.6, 0.5, 0.6, 0.5); margins(M, 0.5, 0.65, 0.4, 0.2)
    H = D["h"]; ph = D.get("photo")
    if ph:
        S.paragraphs[0].paragraph_format.space_after = Pt(0); photo_box(S, ph, 3.2, 3.8, "99D5CF", "ECFDF5")
        cp(S, D["name"], color="FFFFFF", size=19, bold=True, before=10, after=2)
    else:
        cp(S, D["name"], color="FFFFFF", size=21, bold=True, first=True, after=2)
    cp(S, D["job"], color="5EEAD4", size=11, bold=True, after=4)
    cp(S, H["contact"], style="Sidebar Heading")
    for x in (D.get("personal_side") or D["contact"] + D.get("contact2", [])): cp(S, x, style="Sidebar Text")
    cp(S, H["skills"], style="Sidebar Heading")
    for x in D["skills"]: cp(S, x, style="Sidebar Text")
    for key in ("langs", "interests"):
        if D.get(key):
            cp(S, H[key], style="Sidebar Heading")
            for x in (D[key] if isinstance(D[key], list) else [D[key]]): cp(S, x, style="Sidebar Text")
    mw = w - sw - 0.85
    section_main(d, M, H["profile"], first=True); cp(M, D["profile"])
    section_main(d, M, H["exp"]); job_rows(d, M, mw, D["jobs"])
    section_main(d, M, H["edu"]); job_rows(d, M, mw, [(a, b, y, []) for a, b, y in D["edu"]])
    extras(d, M, mw, D)
    for txt, kw in D.get("end", []): cp(M, txt, **kw)
    return W.save(d, cc, D["file_c"])

# ---------------------------------------------------------------- contenus par pays
def jobs3(t, o, dt, b1, b2, b3, b4):
    return [(t, o, dt[0], [b1, b2, b3]), (t, o, dt[1], [b1, b4]), (t, o, dt[1], [b1, b4])]

D = {}
D["fr"] = dict(file_e="modele-cv-elegant.docx", file_c="modele-cv-deux-colonnes.docx", title_e="Modèle de CV élégant", title_c="Modèle de CV deux colonnes",
  name="[Prénom NOM]", job="[Intitulé du poste recherché]", contact=["[06 00 00 00 00]", "[prenom.nom@email.fr]", "[Ville (département)]"], contact2=["[Permis B, si utile]"], photo="[Photo facultative]",
  h=dict(contact="Contact", profile="Profil", exp="Expériences professionnelles", edu="Formation", skills="Compétences", langs="Langues", interests="Centres d'intérêt"),
  profile="[2 ou 3 lignes : votre métier, votre expérience et ce que vous apportez au poste visé. Adaptez-les à chaque offre.]",
  jobs=jobs3("[Intitulé du poste]", "[Entreprise], [Ville]", ("[MM/AAAA] - [MM/AAAA]", "[MM/AAAA] - [MM/AAAA]"), "[Mission principale, avec un verbe d'action]", "[Réalisation chiffrée : clients, budget, délai]", "[Outil, logiciel ou responsabilité]", "[Résultat obtenu]"),
  edu=[("[Diplôme ou titre]", "[Établissement], [Ville]", "[AAAA]"), ("[Diplôme ou titre]", "[Établissement], [Ville]", "[AAAA]")],
  skills=["[Compétence métier 1]", "[Compétence métier 2]", "[Logiciel ou outil]", "[Qualité prouvée par un exemple]"],
  langs=["[Anglais : B2]", "[Espagnol : A2]"], interests="[Activité précise : club, bénévolat, sport]")
D["en"] = dict(file_e="cv-template-uk-elegant.docx", file_c="cv-template-uk-two-column.docx", title_e="UK CV template (elegant)", title_c="UK CV template (two column)",
  name="[Your Name]", job="[Job title you are applying for]", contact=["[Phone number]", "[Email address]", "[Town or city]"], contact2=["[LinkedIn profile, optional]"],
  h=dict(contact="Contact", profile="Personal statement", exp="Work history", edu="Education and qualifications", skills="Skills", langs="Languages", interests="Interests"),
  profile="[3 to 5 lines: who you are, the skills and experience you bring and the role you want. Tailor it to each job.]",
  jobs=jobs3("[Job title]", "[Employer], [Town]", ("[Month Year] - present", "[Month Year] - [Month Year]"), "[Main responsibility, starting with an action verb: organised, managed]", "[Achievement with a figure: customers, budget, time saved]", "[Skill or system you used every day]", "[Achievement or result]"),
  edu=[("[Degree, diploma or apprenticeship]", "[University, college or provider]", "[Year]"), ("[A levels or GCSEs: subjects and grades]", "[School or college]", "[Year]")],
  skills=["[Job-specific skill]", "[Job-specific skill]", "[Software or licence]", "[Transferable skill]"],
  langs=["[Language: level, optional]"], interests="[Optional: a club, team sport or volunteering]",
  extra=[("References", "p", "References available on request.")])
D["us"] = dict(file_e="resume-template-us-elegant.docx", file_c="resume-template-us-two-column.docx", title_e="US resume template (elegant)", title_c="US resume template (two column)",
  name="[Your Name]", job="[Target Job Title]", contact=["[Phone]", "[Email]", "[City, State]"], contact2=["[LinkedIn URL]"],
  h=dict(contact="Contact", profile="Summary", exp="Experience", edu="Education", skills="Skills", langs="Languages", interests="Interests"),
  profile="[3 or 4 sentences: your profession, years of experience, top skills and the value you bring. Use key words from the job posting.]",
  jobs=jobs3("[Job Title]", "[Company], [City, State]", ("[Month Year] - Present", "[Month Year] - [Month Year]"), "[Accomplishment starting with an action verb: organized, increased]", "[Result with a number: dollars, percent, customers]", "[Key responsibility or tool]", "[Result with a number]"),
  edu=[("[Degree]", "[School], [City, State]", "[Year]"), ("[Certification]", "[Issuing organization]", "[Year]")],
  skills=["[Skill]", "[Skill]", "[Software]", "[Software]"], langs=["[Language: proficiency]"])
D["ca"] = dict(file_e="resume-template-canada-elegant.docx", file_c="resume-template-canada-two-column.docx", title_e="Canadian resume template (elegant)", title_c="Canadian resume template (two column)",
  name="[Your Name]", job="[Target Job Title]", contact=["[Phone]", "[Email]", "[City, Province]"], contact2=["[LinkedIn URL]"],
  h=dict(contact="Contact", profile="Profile", exp="Work Experience", edu="Education", skills="Skills", langs="Languages", interests="Interests"),
  profile="[3 or 4 lines: your occupation, Canadian or international experience, main skills and the role you are targeting.]",
  jobs=jobs3("[Job Title]", "[Employer], [City, Province or Country]", ("[Month Year] - Present", "[Month Year] - [Month Year]"), "[Accomplishment starting with an action verb: organized, coordinated]", "[Result with a number]", "[Tool, licence or certification used]", "[Result]"),
  edu=[("[Diploma or Degree]", "[College or University], [City, Country]", "[Year]"), ("[Certification or licence]", "[Issuing organization]", "[Year]")],
  skills=["[Technical skill]", "[Technical skill]", "[Software]", "[Transferable skill]"], langs=["[English: fluent]", "[French: your level]"])
REF = lambda rel: [("[Referee name], [Job title], [Organisation]", "[Phone]  |  [Email]  |  " + rel), ("[Referee name], [Job title], [Organisation]", "[Phone]  |  [Email]  |  [Relationship]")]
D["au"] = dict(file_e="resume-template-australia-elegant.docx", file_c="resume-template-australia-two-column.docx", title_e="Australian resume template (elegant)", title_c="Australian resume template (two column)",
  name="[Your Name]", job="[Target job title]", contact=["[Mobile]", "[Email]", "[Suburb, State]"], contact2=["[LinkedIn, optional]"],
  h=dict(contact="Contact", profile="About me", exp="Employment history", edu="Education and training", skills="Key skills", langs="Licences and certificates", interests="Interests"),
  profile="[3 or 4 lines: your occupation, your experience, the skills you bring and the role you are looking for.]",
  jobs=jobs3("[Job title]", "[Employer], [Suburb]", ("[Month Year] - present", "[Month Year] - [Month Year]"), "[Duty or achievement, starting with an action verb: organised, supervised]", "[Achievement with a number]", "[Key responsibility or equipment]", "[Result]"),
  edu=[("[Certificate III, Diploma or Bachelor]", "[Provider]", "[Year]"), ("[Year 12 or equivalent]", "[School]", "[Year]")],
  skills=["[Skill related to the job]", "[Skill related to the job]", "[Software or equipment]", "[Personal quality, with proof]"],
  langs=["[Driver licence]", "[White Card]", "[First Aid]"], extra=[("Referees", "refs", REF("[Former manager]"))])
D["nz"] = dict(file_e="cv-template-nz-elegant.docx", file_c="cv-template-nz-two-column.docx", title_e="New Zealand CV template (elegant)", title_c="New Zealand CV template (two column)",
  name="[Your Name]", job="[Target job title]", contact=["[Mobile]", "[Email]", "[Town or city]"], contact2=["[LinkedIn, optional]"],
  h=dict(contact="Contact", profile="Personal statement", exp="Work experience", edu="Qualifications", skills="Skills", langs="Languages", interests="Interests"),
  profile="[3 or 4 lines: who you are, the skills and experience you bring and the kind of role you are looking for.]",
  jobs=jobs3("[Job title]", "[Employer], [Town]", ("[Month Year] - present", "[Month Year] - [Month Year]"), "[Main task or achievement, starting with an action verb: organised]", "[Achievement with a number]", "[Key responsibility]", "[Result]"),
  edu=[("[NZ Certificate, Diploma or degree]", "[Provider]", "[Year]"), ("[NCEA level or equivalent]", "[School]", "[Year]")],
  skills=["[Skill related to the job]", "[Skill related to the job]", "[Software, equipment or licence]", "[Personal quality, with proof]"],
  langs=["[English: fluent]", "[Other language: level]"], interests="[A club, coaching or volunteering]", extra=[("Referees", "refs", REF("[Current manager or team leader]"))])
D["de"] = dict(file_e="lebenslauf-vorlage-elegant.docx", file_c="lebenslauf-vorlage-zweispaltig.docx", title_e="Lebenslauf Vorlage elegant", title_c="Lebenslauf Vorlage zweispaltig",
  name="[Vorname Nachname]", job="[Gewünschte Position]", contact=["[Straße Hausnummer], [PLZ Ort]", "[Telefonnummer]", "[E-Mail-Adresse]"], photo="[Bewerbungsfoto, freiwillig]",
  contact2=["Geboren am [TT.MM.JJJJ] in [Ort] (freiwillige Angabe)"],
  personal_side=["[Straße Hausnummer]", "[PLZ Ort]", "[Telefonnummer]", "[E-Mail-Adresse]", "Geboren am [TT.MM.JJJJ] in [Ort] (freiwillig)"],
  h=dict(contact="Persönliche Daten", profile="Kurzprofil", exp="Berufserfahrung", edu="Ausbildung", skills="Kenntnisse", langs="Sprachen", interests="Interessen"),
  profile="[2 bis 3 Zeilen: Ihr Beruf, Ihre Erfahrung und was Sie der neuen Stelle bieten.]",
  jobs=jobs3("[Position]", "[Unternehmen], [Ort]", ("[MM/JJJJ] - heute", "[MM/JJJJ] - [MM/JJJJ]"), "[Aufgabe oder Erfolg, möglichst mit Zahl]", "[Projekt oder Verantwortung]", "[Werkzeug oder Methode]", "[Aufgabe oder Erfolg]"),
  edu=[("[Abschluss: Ausbildung oder Studium]", "[Betrieb, Berufsschule oder Hochschule], [Ort]", "[MM/JJJJ] - [MM/JJJJ]"), ("[Schulabschluss]", "[Schule], [Ort]", "[JJJJ]")],
  skills=["[EDV: Programm, Programm]", "[Fachkenntnis]", "[Fachkenntnis]", "[Führerschein Klasse B]"], langs=["[Deutsch: Muttersprache]", "[Englisch: B2]"], interests="[Ehrenamt oder Hobby, freiwillig]",
  end=[("[Ort], [TT.MM.JJJJ]", dict(before=14, after=18)), ("[Unterschrift]", dict(color="6B7280"))])

KEYS = {"fr": ("elegant", "deux-colonnes"), "de": ("elegant", "zweispaltig")}
FILES = {cc: [(KEYS.get(cc, ("elegant", "two-column"))[0], v["file_e"], v["title_e"]), (KEYS.get(cc, ("elegant", "two-column"))[1], v["file_c"], v["title_c"])] for cc, v in D.items()}

if __name__ == "__main__":
    for cc, v in D.items():
        print(os.path.relpath(elegant(cc, v), W.ROOT)); print(os.path.relpath(column(cc, v), W.ROOT))
    if len(sys.argv) > 2 and sys.argv[1] == "--apercus":
        W.FILES = FILES; W.previews(sys.argv[2])
