# FJKM Luxembourg Fanasina

Site statique en français pour la communauté FJKM Luxembourg. Il fonctionne sans build ni framework et peut être publié directement depuis la branche principale avec GitHub Pages.

## Structure

```text
index.html
pages/                  Pages À propos, Groupes, Événements, Galerie et Contact
assets/
  css/style.css
  js/main.js             Menu mobile et initialisation des rendus
  js/render.js           Chargement et rendu sécurisé des données JSON
  img/logo/logo.jpeg
  img/gallery/           Images de la galerie
data/
  site.json              Accroche et informations pratiques
  groups.json            Contenu des groupes
  events.json            Événements à venir
```

Les liens et chemins sont relatifs à chaque page : ils fonctionnent sur GitHub Pages, y compris lorsque le site est publié dans le sous-chemin `/fjkm-luxembourg/`.

## Modifier le contenu

- **Groupes :** modifier les objets dans `data/groups.json`. Chaque groupe comprend `id`, `nom`, `slogan`, `description`, `public_cible`, `horaires`, `lieu`, `contact`, `image`, `couleur` et `activites`. Laisser `image` vide si aucune image n'est disponible ; sinon indiquer son chemin depuis la racine du site, par exemple `assets/img/groups/stk.jpg`. Les horaires et coordonnées actuellement indiqués comme à confirmer sont des valeurs provisoires à remplacer.
- **Accueil et contact :** modifier `data/site.json` pour mettre à jour le nom, l'accroche, le texte de bienvenue, les horaires des cultes, l'adresse et l'adresse e-mail. Remplacer `contact@example.com` par l'adresse réelle avant publication.
- **Événements :** modifier la liste `events` de `data/events.json`. Les événements passés ne sont pas affichés.
- **Photos :** remplacer ou ajouter des images dans `assets/img/gallery/`, puis mettre à jour les éléments de la galerie dans `index.html` et `pages/gallery.html`.
- **Présentation :** modifier `assets/css/style.css` pour les couleurs et la mise en page. Les pages HTML sont dans `index.html` et `pages/`.

Le navigateur doit ouvrir le site via un serveur HTTP ou GitHub Pages pour charger les fichiers JSON avec `fetch` ; l'ouverture directe des fichiers HTML (`file://`) ne permet pas leur chargement.
