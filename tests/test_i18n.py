"""Validation statique du multilinguisme FR/MG. Lancer : python3 -m unittest discover tests"""
import glob
import json
import os
import re
import unittest

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def read(*parts):
    with open(os.path.join(ROOT, *parts), encoding="utf-8") as f:
        return f.read()


def catalog():
    return json.loads(read("data", "i18n.json"))


def message_keys(lang):
    return list(catalog()[lang]["messages"])


class I18nTest(unittest.TestCase):
    def test_same_keys_in_both_languages(self):
        fr, mg = message_keys("fr"), message_keys("mg")
        self.assertTrue(fr)
        self.assertEqual(sorted(fr), sorted(mg))
        self.assertEqual(len(fr), len(set(fr)))

    def test_no_hardcoded_messages_in_js(self):
        js = read("assets", "js", "i18n.js")
        self.assertNotIn("'nav.home'", js)
        self.assertIn("data/i18n.json", js)

    def test_dates_defined_for_both_languages(self):
        for lang, data in catalog().items():
            self.assertEqual(len(data["dates"]["days"]), 7, lang)
            self.assertEqual(len(data["dates"]["months"]), 12, lang)

    def test_default_language_is_french(self):
        self.assertIn("DEFAULT_LANG = 'fr'", read("assets", "js", "i18n.js"))
        self.assertTrue(all(catalog()[l]["messages"] for l in ("fr", "mg")))

    def test_language_pages_exist_with_dropdown(self):
        known = set(message_keys("fr"))
        for lang in ("fr", "mg"):
            files = sorted(glob.glob(os.path.join(ROOT, lang, "**", "*.html"), recursive=True))
            self.assertEqual(len(files), 6, lang)
            for path in files:
                name = os.path.relpath(path, ROOT)
                html = read(name)
                self.assertIn('<html lang="%s">' % lang, html, name)
                keys = re.findall(r'data-i18n="([^"]+)"', html)
                for attr in re.findall(r'data-i18n-attr="([^"]+)"', html):
                    keys += [pair.split(":")[1] for pair in attr.split(";")]
                for key in keys:
                    self.assertIn(key, known, "%s : clé inconnue %s" % (name, key))
                self.assertIn('<select id="lang-select"', html, name)
                self.assertLess(html.index("i18n.js"), html.index("render.js"), name)
                # chaque option de langue pointe vers un fichier existant
                for value, option_lang in re.findall(r'<option value="([^"]+)" lang="(\w+)"', html):
                    target = os.path.normpath(os.path.join(os.path.dirname(path), value))
                    self.assertTrue(os.path.isfile(target), "%s -> %s" % (name, value))
                    self.assertIn(os.sep + option_lang + os.sep, target)

    def test_local_references_resolve(self):
        for path in glob.glob(os.path.join(ROOT, "*", "**", "*.html"), recursive=True) + glob.glob(os.path.join(ROOT, "*.html")):
            if os.path.relpath(path, ROOT).split(os.sep)[0] not in ("fr", "mg", "pages", "index.html"):
                continue
            html = read(os.path.relpath(path, ROOT))
            for ref in re.findall(r'(?:src|href)="([^"#:]+)"', html):
                if ref.startswith("//"):
                    continue
                self.assertTrue(os.path.exists(os.path.normpath(os.path.join(os.path.dirname(path), ref))), "%s -> %s" % (path, ref))

    def test_root_pages_redirect_to_language_folders(self):
        for name in ["index.html"] + sorted(glob.glob(os.path.join("pages", "*.html"))):
            html = read(name)
            self.assertIn("http-equiv=\"refresh\"", html, name)
            self.assertIn("fr/", html, name)

    def test_json_content_has_malagasy_translation(self):
        site = json.loads(read("data", "site.json"))
        for field in ("tagline", "welcome", "cultes", "address"):
            self.assertTrue(site["i18n"]["mg"][field], field)
        for group in json.loads(read("data", "groups.json"))["groups"]:
            for field in ("slogan", "description", "public_cible", "horaires", "lieu", "contact", "activites"):
                self.assertTrue(group["i18n"]["mg"][field], group["id"] + "." + field)
        for event in json.loads(read("data", "events.json"))["events"]:
            for field in ("title", "description", "group", "location"):
                self.assertTrue(event["i18n"]["mg"][field], str(event["id"]) + "." + field)


if __name__ == "__main__":
    unittest.main()
