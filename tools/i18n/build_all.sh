#!/bin/sh
# Régénère toutes les versions étrangères de CVLibre, leurs blogs, les hreflang français et le sitemap.
set -e
cd "$(dirname "$0")"
python3 build.py | tail -1
python3 build_de.py | tail -1
python3 en_pages2.py > /dev/null
python3 de_pages2.py > /dev/null
python3 anglo_pages.py | tail -3
python3 blog_build.py 2>/dev/null | grep articles
python3 fr_alt.py
python3 sitemap.py
python3 ads_pages.py
python3 ads_inarticle.py
