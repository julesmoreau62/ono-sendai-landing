# Refonte de la landing Ono-Sendai (v3)

## 1. Diagnostic de la v2

| Critère | Constat |
|---|---|
| Proposition de valeur en 5 s | Le hero affichait le nom et « Deux espaces, une seule app ». On voyait la forme du produit (deux espaces), pas ce qu'il apporte. Aucun bouton d'action dans le hero. |
| Exhaustivité | L'espace **Cours** (enregistrement du CM, transcription locale, cours rédigé, fiches, cartes) était absent, alors que c'est le plus universel pour la cible. |
| Hiérarchie | Le tutoriel complet (≈ 600 lignes : vocabulaire, installation, première tâche, premier mémoire, bonnes pratiques, dépannage) occupait la moitié de la page. Il noyait le message et rallongeait le défilement. |
| Appels à l'action | Pas de CTA dans le hero, pas de CTA final, pas de lien de téléchargement visible en dehors du tutoriel. |
| Preuves | Points forts : les démos interactives (copilote, APA 7 avec le vrai moteur, plan, carte mentale) sont de vraies preuves. Il manquait : confidentialité expliquée simplement, comparaison avec les outils connus, limites assumées. |
| Univers visuel | Très cohérent (noir, bleu glacé, angles droits, Martian Mono). Il manquait l'effet de déchiffrement du nom et le tracé du λ, signatures du lancement de l'app. |
| SEO | Title réduit à « Ono-Sendai », pas d'Open Graph, pas d'image de partage, pas de données structurées. |
| Honnêteté | Bonne dans l'ensemble. Un chiffre non sourcé (« parfaits pour 90 % des tâches ») a été retiré. |

## 2. Nouvelle structure

1. **Hero** : trou noir NASA, nom qui se déchiffre, titre orienté bénéfice, sous-titre, deux CTA (Installer / Voir la démo), prérequis en une ligne.
2. **Le problème** : un semestre réparti entre six endroits (PDF, mémo vocal, Notion, Anki, Word + Zotero, ChatGPT), puis la réponse.
3. **Trois espaces** : Cours, Mémoire, IA, chacun avec son flux (« Diapos + Oral → Cours → Fiche → Cartes »).
4. **Espace Cours** : nouvelle démo interactive (visionneuse, frise du CM, transcription cliquable, « Rédiger le cours », Fiche, Cartes en répétition espacée au clavier) + 8 fonctions.
5. **Espace Mémoire** : démos de la v2 conservées + nouveau bloc « Sources, puis export Word et PDF ».
6. **Espace IA** : grille et aperçu conservés + l'ancien « Le principe » (prix à l'usage) déplacé ici.
7. **Le copilote** : quatre règles (il marque ce qu'il ajoute, ne modifie rien sans toi, cite tes sources, te fait travailler).
8. **Tes données** : schéma local-first (127.0.0.1, dossiers, whisper.cpp → seul le passage envoyé sort).
9. **Comparaison** : Notion, Obsidian, Zotero, Anki, ChatGPT en mode « son point fort / ce qu'Ono-Sendai fait autrement », plus un encadré « Ce qu'Ono-Sendai ne fait pas (encore) ».
10. **Installation** : quatre étapes, prérequis, téléchargement ; le détail est dans `guide.html`.
11. **FAQ** : dix questions (gratuit, triche, données, coder, modèles, Windows, macOS bloque, Obsidian/Zotero/Word, transcription, nom).
12. **CTA final** puis pied de page.

Le tutoriel complet est dans **`guide.html`**, mis à jour pour les trois espaces, avec un nouveau parcours « Ton premier cours » et un raccourci clavier pour l'espace Cours.

## 3. Variantes de titre principal

- **A (retenue)** : « Du cours magistral à la soutenance, une seule app. » Elle couvre les trois espaces et parle à la cible.
- **B** : « Tes cours, ton mémoire, tes projets. Un copilote qui relit, sans écrire à ta place. » Elle met l'intégrité en avant, mais elle est plus longue.
- **C** : « L'IA qui t'aide à apprendre, pas à tricher. » Le message est fort, mais il ne dit pas ce que fait l'app.

## 4. Visuels et animations

Ce qui est en place :
- Tracé du λ dans l'en-tête, puis remplissage.
- Déchiffrement de « ONO-SENDAI » à partir de caractères aléatoires, en bleu glacé, avant le halo du disque (désactivé si l'animation est réduite).
- Démo Cours : passage diapos + oral → cours rédigé ligne par ligne, avec étiquettes [diapo], (oral), (hors diapos).
- Image Open Graph `assets/og.jpg` (1200 × 630) et favicon λ `assets/favicon.svg`.

Ce que je propose d'ajouter avec de vraies captures de l'app :
- Une vidéo courte (10–15 s, muette, en boucle) de l'écran de lancement : λ, déchiffrement, trois cercles.
- Une capture réelle de la vue « Rédiger le cours » à côté de la démo, pour prouver que ce n'est pas qu'une maquette.
- Un GIF de la carte mentale en mode Présenter.
- Une capture du sélecteur de modèles (prix par million de tokens, top 10 OpenRouter, groupe « Gratuits »).

## 5. À compléter ou à vérifier avant la mise en ligne

- **Liens à remplacer** : `[LIEN DE TÉLÉCHARGEMENT]` (index, guide) et `[LIEN DU DÉPÔT]` (index, guide).
- **og:image** : l'URL est relative. Une fois le domaine connu, mets une URL absolue (`https://…/assets/og.jpg`) et ajoute `<link rel="canonical">` et `og:url`.
- **Hypothèses à vérifier dans l'app** :
  - l'ordre des touches : `1` IA, `2` Mémoire, `3` Cours ;
  - l'effet des notes `1` à `4` en révision (démo : 1 = boîte 1, 2 = même boîte, 3 = boîte suivante, 4 = deux boîtes plus loin) et leurs libellés (Raté / Difficile / Bien / Facile) ;
  - l'installation de whisper.cpp (`brew install whisper-cpp` sur Mac, la page du projet ailleurs) : est-ce bien ce que l'app attend ?
  - les libellés des boutons du parcours « Ton premier cours » dans `guide.html` (écrits à partir de la description, sans maquette « Tu dois voir »).
- **Comparatif** : les fonctions des autres outils évoluent ; relis le tableau avant publication.
