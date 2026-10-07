"""Pré-remplit les pages fr/ et mg/ depuis data/i18n.json et data/site.json.

Le JavaScript applique déjà les traductions au chargement ; ce script évite
l'affichage initial dans la mauvaise langue (et sans JavaScript).
Usage : python3 tools/sync_i18n.py [--check]
"""
import glob
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def load(*parts):
    with open(os.path.join(ROOT, *parts), encoding="utf-8") as f:
        return json.load(f)


CATALOG = load("data", "i18n.json")
SITE = load("data", "site.json")


def site_value(lang, field):
    translation = SITE.get("i18n", {}).get(lang, {})
    return translation.get(field, SITE.get(field))


def translate(lang, source):
    messages = CATALOG[lang]["messages"]
    fallback = CATALOG["fr"]["messages"]

    def text_for(key, n=None):
        value = messages.get(key, fallback.get(key))
        return value.replace("{n}", n) if value is not None and n else value

    def set_attrs(match):
        tag = match.group(0)
        n = re.search(r'data-i18n-n="([^"]*)"', tag)
        for pair in re.search(r'data-i18n-attr="([^"]+)"', tag).group(1).split(";"):
            name, key = pair.split(":")
            value = text_for(key, n.group(1) if n else None)
            if value is not None:
                tag = re.sub(r'(\s%s=")[^"]*(")' % re.escape(name),
                             lambda m: m.group(1) + html.escape(value) + m.group(2), tag, count=1)
        return tag

    source = re.sub(r"<[^>]*data-i18n-attr=[^>]*>", set_attrs, source)

    def set_text(match):
        value = text_for(match.group(3))
        return match.group(1) + (html.escape(value, quote=False) if value is not None else match.group(4)) + match.group(5)

    source = re.sub(r'(<(\w+)[^>]*data-i18n="([^"]+)"[^>]*>)(.*?)(</\2>)', lambda m: set_text_with_tag(m, text_for), source, flags=re.S)

    def set_site(match):
        value = site_value(lang, match.group(3))
        if value is None:
            return match.group(0)
        tag = match.group(1)
        if match.group(2) == "a":
            tag = re.sub(r'href="[^"]*"', 'href="mailto:%s"' % html.escape(value), tag, count=1)
        return tag + html.escape(value, quote=False) + match.group(4)

    return re.sub(r'(<(\w+)[^>]*data-site-field="([^"]+)"[^>]*>)[^<]*(</\2>)', set_site, source)


def set_text_with_tag(match, text_for):
    value = text_for(match.group(3))
    if value is None:
        return match.group(0)
    return match.group(1) + html.escape(value, quote=False) + match.group(5)


def main():
    check = "--check" in sys.argv
    stale = []
    for lang in ("fr", "mg"):
        for path in sorted(glob.glob(os.path.join(ROOT, lang, "**", "*.html"), recursive=True)):
            with open(path, encoding="utf-8") as f:
                current = f.read()
            updated = translate(lang, current)
            if updated != current:
                stale.append(os.path.relpath(path, ROOT))
                if not check:
                    with open(path, "w", encoding="utf-8") as f:
                        f.write(updated)
    if check and stale:
        print("Pages à synchroniser :", ", ".join(stale))
        sys.exit(1)
    print("%d page(s) mise(s) à jour" % len(stale) if not check else "Pages à jour")


if __name__ == "__main__":
    main()
