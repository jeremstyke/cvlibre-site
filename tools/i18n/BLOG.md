# Blogs de CVLibre : comment ajouter des articles

Sept blogs, un par pays. Jamais de tiret cadratin (—) ni de tiret demi-cadratin (–) dans les textes : seulement le tiret court (-).

| Pays | Langue | Blog | Créateur | Articles |
|---|---|---|---|---|
| France | français, vouvoiement | /blog/ | /creer-un-cv/ | HTML écrit à la main dans blog/<slug>/index.html |
| Royaume-Uni | anglais britannique | /en/blog/ | /en/cv-builder/ | content/blog/en/<slug>.json |
| États-Unis | anglais américain, "resume" | /us/blog/ | /us/resume-builder/ | content/blog/us/<slug>.json |
| Canada | anglais canadien (colour, organize), "resume" | /ca/blog/ | /ca/resume-builder/ | content/blog/ca/<slug>.json |
| Australie | anglais australien, "resume" | /au/blog/ | /au/resume-builder/ | content/blog/au/<slug>.json |
| Nouvelle-Zélande | anglais néo-zélandais, "CV" | /nz/blog/ | /nz/cv-builder/ | content/blog/nz/<slug>.json |
| Allemagne | allemand, "Sie" | /de/ratgeber/ | /de/lebenslauf-erstellen/ | content/blog/de/<slug>.json |

## Article JSON (en, us, ca, au, nz, de)

```json
{"slug": "mot-cle-en-minuscules", "title": "Titre (60 caractères environ)", "desc": "Description de 140 à 160 caractères.",
 "mins": 5, "date": "AAAA-MM-JJ", "cat": "CV",
 "blocks": [["p", "Paragraphe, liens HTML autorisés"], ["h2", "Intertitre"], ["h3", "Sous-titre"],
            ["ul", ["puce 1", "puce 2"]], ["ol", ["étape 1", "étape 2"]], ["ex", "Avant (mauvais exemple)", "Après (bon exemple)"]]}
```

- `cat` : "CV" (en), "Resume" (us, ca, au), "CV" (nz), "Lebenslauf" ou "Bewerbung" (de).
- Un sujet par article, précis et utile au pays (conventions locales, lois locales, exemples locaux). Jamais un sujet déjà traité dans le même pays (lire les slugs existants).
- 500 à 900 mots, 4 à 7 intertitres, au moins un lien interne vers le créateur du pays ou un autre article du même blog.
- Tout fait qui peut changer (loi, préavis, montant, salaire minimum, délai) est vérifié par une recherche web et formulé prudemment. Jamais de chiffre inventé.
- Puis lancer `sh tools/i18n/build_all.sh` : il régénère les pages, les blogs, les hreflang et sitemap.xml.

## Article français

1. Copier la structure d'un article existant (par exemple blog/cv-senior/index.html) dans blog/<slug>/index.html : changer title, description, canonical, og:url, JSON-LD (headline, description, datePublished, dateModified, mainEntityOfPage), h1, chapeau, sommaire, contenu et "À lire aussi".
2. Ajouter sa carte en tête de la grille de blog/index.html (même balisage que les autres cartes).
3. Ajouter `  <url><loc>https://cvlibre.com/blog/<slug>/</loc><lastmod>AAAA-MM-JJ</lastmod></url>` dans sitemap.xml, avant les pages des autres pays (sitemap.py garde les lignes françaises telles quelles).

## Publier

`git add -A && git commit -m "Articles de la semaine" && git push`, puis prévenir Bing et Yandex avec IndexNow (clé 4bb608c76fc94e1fc06e70aa81302ec0, fichier à la racine du site) pour les nouvelles URL et https://cvlibre.com/sitemap.xml.
