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
    ("/offres-emploi/", "/en/jobs/", "/de/jobs/"),
    ("/courriers/", "/en/letters/", "/de/briefe/"),
    ("/lettre-de-demission/", "/en/resignation-letter/", "/de/kuendigungsschreiben/"),
    ("/relance-apres-entretien/", "/en/interview-follow-up-email/", "/de/nachfassen-nach-vorstellungsgespraech/"),
    ("/mail-de-candidature/", "/en/job-application-email/", "/de/bewerbung-per-email/"),
    ("/blog/", "/en/blog/", "/de/ratgeber/"),
]
IDX = {"fr": 0, "en": 1, "de": 2}

def row(path):
    for r in ALT:
        if path in r: return r
    return None

def links(path):
    """Balises <link rel="alternate"> pour une page qui a des équivalents (vide sinon)."""
    r = row(path)
    if not r: return ""
    out = "".join('<link rel="alternate" hreflang="%s" href="https://cvlibre.com%s">\n' % (l, r[i]) for l, i in (("fr", 0), ("en", 1), ("de", 2)))
    return out + '<link rel="alternate" hreflang="x-default" href="https://cvlibre.com%s">\n' % r[0]
