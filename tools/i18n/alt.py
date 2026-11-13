"""Pages équivalentes entre pays (FR, UK, DE) pour les balises hreflang et le sélecteur de pays."""
ALT = [
    ("/", "/en/", "/de/"),
    ("/creer-un-cv/", "/en/cv-builder/", "/de/lebenslauf-erstellen/"),
    ("/lettre-de-motivation/", "/en/cover-letter/", "/de/anschreiben/"),
    ("/soutenir/", "/en/support/", "/de/unterstuetzen/"),
    ("/mentions-legales/", "/en/legal-notice/", "/de/impressum/"),
    ("/confidentialite/", "/en/privacy/", "/de/datenschutz/"),
    ("/cgv/", "/en/terms/", "/de/nutzungsbedingungen/"),
    ("/mon-espace/", "/en/my-account/", "/de/mein-konto/"),
    ("/recruteurs/", "/en/recruiters/", "/de/arbeitgeber/"),
    ("/publicite/", "/en/advertise/", "/de/werbung/"),
    ("/offres-emploi/", "/en/jobs/", "/de/jobs/"),
    ("/courriers/", "/en/letters/", "/de/briefe/"),
    ("/lettre-de-demission/", "/en/resignation-letter/", "/de/kuendigungsschreiben/"),
    ("/relance-apres-entretien/", "/en/interview-follow-up-email/", "/de/nachfassen-nach-vorstellungsgespraech/"),
    ("/mail-de-candidature/", "/en/job-application-email/", "/de/bewerbung-per-email/"),
    ("/blog/", "/en/blog/", "/de/ratgeber/"),
]
# Versions anglophones hors Royaume-Uni : mêmes pages que /en/, sous /us/, /ca/, /au/, /nz/ (créateur renommé resume-builder sauf en Nouvelle-Zélande).
ANGLO = {"us": "en-US", "ca": "en-CA", "au": "en-AU", "nz": "en-NZ"}
def anglo_path(en_path, cc):
    p = "/" + cc + en_path[3:]
    if cc != "nz": p = p.replace("/cv-builder/", "/resume-builder/")
    return p

def row(path):
    for r in ALT:
        full = list(r) + [anglo_path(r[1], cc) for cc in ANGLO]
        if path in full: return full
    return None

def links(path):
    """Balises <link rel="alternate"> pour une page qui a des équivalents (vide sinon)."""
    r = row(path)
    if not r: return ""
    langs = [("fr", 0), ("en-GB", 1), ("de", 2)] + [(l, 3 + i) for i, l in enumerate(ANGLO.values())] + [("en", 3)]
    out = "".join('<link rel="alternate" hreflang="%s" href="https://cvlibre.com%s">\n' % (l, r[i]) for l, i in langs)
    return out + '<link rel="alternate" hreflang="x-default" href="https://cvlibre.com%s">\n' % r[0]
