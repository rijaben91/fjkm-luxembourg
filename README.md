# FJKM Luxembourg Fanasina

Site statique bilingue (français par défaut, malgache) pour la communauté FJKM Luxembourg. Il fonctionne sans build ni framework et peut être publié directement depuis la branche principale avec GitHub Pages.

## Structure

```text
tools/sync_i18n.py      Pré-remplit fr/ et mg/ depuis data/i18n.json
index.html              Redirige vers /fr/ (ou /mg/ si choisi précédemment)
pages/                  Anciennes URL, redirigées vers /fr/pages/
fr/                     Site en français : index.html et pages/ (À propos, Groupes, Événements, Galerie, Contact)
mg/                     Même site en malgache (mêmes fichiers)
assets/
  css/style.css
  js/i18n.js             Logique de langue (choix persisté) (localStorage `fjkm-lang`)
  js/main.js             Menu mobile et initialisation des rendus
  js/render.js           Chargement et rendu sécurisé des données JSON
  img/logo/logo.jpeg
  img/gallery/           Images de la galerie
data/
  site.json              Accroche et informations pratiques
  groups.json            Contenu des groupes
  events.json            Événements à venir
  i18n.json              Textes d'interface FR/MG (menu, footer, libellés, dates)
```

Les liens et chemins sont relatifs à chaque page : ils fonctionnent sur GitHub Pages, y compris lorsque le site est publié dans le sous-chemin `/fjkm-luxembourg/`.

## Langues

La langue est déterminée par l'URL : `/fr/...` pour le français (langue par défaut, utilisée par la racine `/`) et `/mg/...` pour le malgache. Le menu déroulant du header renvoie vers la même page dans l'autre langue ; le dernier choix est mémorisé (`localStorage`, clé `fjkm-lang`) uniquement pour la redirection de la racine. Les pages `fr/` et `mg/` ont le même HTML (seul `<html lang>` et le menu déroulant diffèrent) : toute modification de structure doit être reportée dans les deux dossiers. Tous les textes d'interface (menu du header, pied de page, titres, libellés, noms des jours et des mois) sont dans `data/i18n.json`, sous `fr` et `mg` ; `assets/js/i18n.js` ne contient que la logique (attributs `data-i18n` / `data-i18n-attr` dans le HTML). Dans les fichiers `data/*.json`, les champs en français restent la base et les traductions malgaches sont dans `i18n.mg` de chaque objet. Les pages `fr/` et `mg/` sont pré-remplies avec ces textes (pas de flash de français sur les pages malgaches, lisibles sans JavaScript) : après avoir modifié `data/i18n.json` ou `data/site.json`, lancer `python3 tools/sync_i18n.py`. Validation : `python3 -m unittest discover tests` (vérifie aussi que les pages sont synchronisées).

## Modifier le contenu

- **Groupes :** modifier les objets dans `data/groups.json`. Chaque groupe comprend `id`, `nom`, `slogan`, `description`, `public_cible`, `horaires`, `lieu`, `contact`, `image`, `couleur` et `activites`. Laisser `image` vide si aucune image n'est disponible ; sinon indiquer son chemin depuis la racine du site, par exemple `assets/img/groups/stk.jpg`. Les horaires et coordonnées actuellement indiqués comme à confirmer sont des valeurs provisoires à remplacer.
- **Accueil et contact :** modifier `data/site.json` pour mettre à jour le nom, l'accroche, le texte de bienvenue, les horaires des cultes, l'adresse et l'adresse e-mail. Remplacer `contact@example.com` par l'adresse réelle avant publication.
- **Événements :** modifier la liste `events` de `data/events.json`. Les événements passés ne sont pas affichés.
- **Photos :** remplacer ou ajouter des images dans `assets/img/gallery/`, puis mettre à jour les éléments de la galerie dans `fr/` et `mg/` (`index.html` et `pages/gallery.html`).
- **Présentation :** modifier `assets/css/style.css` pour les couleurs et la mise en page. Les pages HTML sont dans `fr/` et `mg/`.

Le navigateur doit ouvrir le site via un serveur HTTP ou GitHub Pages pour charger les fichiers JSON avec `fetch` ; l'ouverture directe des fichiers HTML (`file://`) ne permet pas leur chargement.
