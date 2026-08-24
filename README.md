# LAVAGE BIDÈ

Application web statique de gestion d'une station de lavage automobile et d'engins. Le projet regroupe une vitrine publique, un espace client et plusieurs portails internes pour l'administration, la caisse, la gestion des opérations et les laveurs.

> **État actuel :** l'application fonctionne côté navigateur et utilise `localStorage`/`sessionStorage` comme stockage local. Elle ne possède pas encore de serveur, d'API ou de base de données distante.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Nouveautés récentes](#nouveautés-récentes)
- [Architecture](#architecture)
- [Cohérence de la plateforme](#cohérence-de-la-plateforme)
- [Installation et lancement](#installation-et-lancement)
- [Tests et validation](#tests-et-validation)
- [Déploiement](#déploiement)
- [Parcours utilisateur](#parcours-utilisateur)
- [Portails internes](#portails-internes)
- [Authentification et rôles](#authentification-et-rôles)
- [Données et synchronisation](#données-et-synchronisation)
- [Grille tarifaire](#grille-tarifaire)
- [Structure des fichiers](#structure-des-fichiers)
- [Dépannage](#dépannage)
- [Limites et sécurité](#limites-et-sécurité)
- [Évolutions recommandées](#évolutions-recommandées)
- [Équipe de développement](#équipe-de-développement)
- [Licence](#licence)

## Fonctionnalités

### Vitrine publique

La partie publique présente les services de LAVAGE BIDÈ et permet de :

- consulter l'accueil et les engagements de la station ;
- consulter les tarifs par catégorie d'engin et par formule ;
- consulter les services de lavage ;
- consulter la page À propos ;
- consulter les informations de contact et la localisation ;
- ouvrir une connexion client ou un accès direct à l'espace client ;
- effectuer une réservation rapide depuis l'accueil ;
- envoyer un formulaire de contact ;
- consulter les retours anonymes d'autres clients ;
- accéder au lien WhatsApp de la station ;
- afficher des vidéos en arrière-plan dans les sections hero ;
- afficher des animations, compteurs et sections révélées au défilement.

### Espace client

L'espace client permet de :

- enregistrer plusieurs véhicules ;
- afficher le nombre de véhicules enregistrés ;
- consulter un historique de lavages ;
- réserver un créneau avec une date, une heure, une formule et un commentaire ;
- afficher le prochain rendez-vous ;
- suivre une simulation d'avancement du lavage ;
- consulter les notifications ;
- marquer les notifications comme lues ;
- modifier le mot de passe du compte client ;
- afficher un profil enrichi (email, téléphone, avatar avec initiales) ;
- se déconnecter proprement (nettoyage de `localStorage` et `sessionStorage`).

### Gestion des opérations

Le portail gestionnaire permet de :

- enregistrer rapidement un véhicule ;
- choisir une catégorie d'engin et une formule ;
- générer un ticket de lavage avec un code `BID-xxx` ;
- générer un QR code de ticket lorsque la bibliothèque QR est disponible ;
- consulter la file d'attente ;
- assigner un véhicule à un laveur et à une piste ;
- suivre les lavages en cours ;
- valider les lavages terminés ;
- informer le client que son véhicule est prêt ;
- consulter les notifications ;
- filtrer et rechercher les commandes ;
- consulter des rapports par type d'engin ;
- gérer les laveurs et leurs pistes ;
- créer et désactiver des utilisateurs internes ;
- modifier le profil du gestionnaire.

### Caisse et encaissement

Le portail caisse permet de :

- rechercher un véhicule par code de ticket ou immatriculation ;
- afficher les véhicules validés prêts à être payés ;
- calculer automatiquement le prix selon la catégorie et la formule ;
- enregistrer un paiement ;
- gérer les paiements en espèces, Mobile Money et carte bancaire ;
- produire un reçu ;
- conserver un historique des reçus ;
- afficher le chiffre d'affaires du jour ;
- afficher le nombre de transactions et de clients servis ;
- effectuer un rapprochement de caisse ;
- synchroniser les tarifs avec le portail administrateur.

### Administration

Le portail administrateur permet de :

- gérer la grille tarifaire ;
- modifier les prix des formules ;
- réinitialiser les tarifs recommandés ;
- consulter les statistiques et indicateurs ;
- visualiser les transactions ;
- consulter les feedbacks ;
- afficher des graphiques Chart.js ;
- filtrer les statistiques par période ;
- exporter un résumé de rapport ;
- sauvegarder et restaurer certaines données du navigateur ;
- effectuer une recherche rapide dans le tableau de bord.

### Portail laveur

Le portail laveur permet de :

- consulter les tâches assignées ;
- mettre à jour l'état d'un véhicule ;
- consulter l'historique des interventions ;
- consulter les détails d'une commande ;
- consulter et modifier le profil ;
- modifier le mot de passe ;
- se déconnecter.

## Nouveautés récentes

La dernière mise à jour a apporté des modifications significatives sur l'ensemble de la vitrine publique et de l'espace client :

### Refonte visuelle claire

Toutes les pages publiques et l'espace client ont été migrés vers un thème clair bleu/blanc. Les anciens styles sombres cyan/vert sont remplacés par une palette cohérente :

- **Fond principal :** `#f4faff` (bleu très pâle)
- **Couleur d'accent :** `#0284c7` → `#0ea5e9` (dégradé bleu)
- **Cartes :** blanc avec bordures `#d7eaf5` et ombres bleutées légères
- **Texte :** `#17324d` (primaire) / `#5d7488` (secondaire)

Chaque type de page dispose de sa propre classe CSS ciblée :

| Classe | Page |
|---|---|
| `.tarifs-page` | Tarifs publics (`Desktop/laverie/tarifs.html`) |
| `.services-page` | Services (`lavage1/lavage/services.html`) |
| `.client-page` | Espace client (`lavage1/lavage/client.html`) |

### Vidéos en arrière-plan

Les sections hero des pages Accueil, Contact, Tarifs, À propos, Services et Espace client intègrent désormais une vidéo de lavage en lecture automatique (muette, en boucle). La vidéo est fournie dans `Desktop/laverie/IMAGE/video.mp4` et `Desktop/laverie/IMAGE/video2.mp4` avec une image de secours (`poster`) pour les navigateurs ne supportant pas la lecture vidéo.

### Bouton « Espace client » unifié

Les barres de navigation des pages publiques présentent désormais un bouton **« Espace client »** au lieu du bouton « Login » ouvrant une modale. Ce bouton redirige directement vers `lavage1/lavage/client.html`. L'ancien flux modale est conservé uniquement sur la page d'accueil pour les nouveaux utilisateurs.

### Affichage des retours clients

Les pages publiques affichent désormais les **6 derniers retours anonymes** soumis via le formulaire de feedback. Les avis sont rendus dynamiquement sous forme de cartes avec type, message et date.

### Icônes Bootstrap dans les filtres tarifs et les étoiles

Les boutons de filtre par catégorie utilisent désormais des **icônes Bootstrap Icons** au lieu d'emojis pour une meilleure cohérence visuelle et un affichage plus professionnel.

Les étoiles de notation (avis clients) dans `admin.js` et `a-propos.html` utilisent également des icônes `bi-star-fill` / `bi-star` au lieu des caractères Unicode ★☆.

### Informations de contact mises à jour

Les numéros de téléphone et le lien WhatsApp ont été mis à jour avec les vrais coordonnées de la station :

- Téléphone 1 : `+228 70 45 70 07`
- Téléphone 2 : `+228 93 39 53 77`
- WhatsApp : `+228 71 02 65 75`

### Profil client amélioré

L'espace client affiche désormais :

- L'**email** et le **téléphone** du client dans la zone de profil
- Un **avatar avec initiales** générées automatiquement à partir du nom
- Une **déconnexion propre** qui nettoie à la fois `localStorage` et `sessionStorage`

### Liens réseaux sociaux dans le footer

Tous les footers des pages publiques contiennent des liens vers les réseaux sociaux de BIDÈ (Facebook, Instagram, TikTok) qui s'ouvrent dans un nouvel onglet avec `target="_blank"` et `rel="noopener"`.

### Progressive Web App (PWA)

Le projet est désormais installable comme application sur mobile et ordinateur grâce à :

- Un fichier `manifest.json` déclarant le nom, les icônes, le thème et le mode d'affichage
- Un service worker `sw.js` qui met en cache les pages visitées et les vidéos hero
- Une icône SVG `icon.svg` pour la barre d'adresse et l'écran d'accueil
- Le bouton **« Installer »** apparaît automatiquement sur Chrome/Edge Android

## Architecture

Le projet est une application HTML/CSS/JavaScript sans framework front-end.

- **Bootstrap 5.3.3** : mise en page et composants d'interface.
- **Bootstrap Icons 1.11.3** : icônes de navigation et d'actions (utilisées dans les filtres tarifs et les boutons).
- **Leaflet** : carte de localisation lorsqu'elle est chargée.
- **Chart.js** : graphiques du tableau de bord administrateur.
- **QRCode.js** : génération des tickets QR du gestionnaire.
- **JavaScript natif** : logique métier, navigation, stockage et rendu dynamique.
- **Service Worker** : cache intelligent des pages et vidéos pour la PWA et le mode hors ligne.

Le projet contient deux ensembles publics historiques qui ont été reliés par des chemins relatifs :

- `Desktop/laverie/` contient l'accueil, les tarifs et le contact ;
- `lavage1/lavage/` contient À propos, Services et Client.

Les liens entre ces deux ensembles ont été corrigés pour pointer vers les fichiers réellement présents.

### Organisation CSS

Chaque ensemble public dispose de son propre fichier `style.css` contenant :

- Les variables CSS du thème clair (déclarées dans `:root`)
- Les styles de base partagés (navbar, hero, cartes, formulaires)
- Les styles spécifiques à chaque type de page (`.tarifs-page`, `.services-page`, `.client-page`)
- Les animations et transitions responsives

## Cohérence de la plateforme

### État observé

La vitrine et les portails internes partagent une partie de leur modèle métier, mais la plateforme n'est pas encore entièrement centralisée.

| Domaine | État actuel | Conséquence |
|---|---|---|
| Tarifs | La vitrine affiche plusieurs prix écrits directement dans le HTML et le calculateur possède ses propres valeurs. L'admin, la caisse et le gestionnaire utilisent la clé `tariffs`. | Une modification effectuée dans l'admin peut ne pas apparaître immédiatement sur la vitrine. |
| Réservation rapide | Le formulaire `quickReservationForm` existe dans la vitrine, mais aucun traitement correspondant n'est actuellement présent dans son script principal. | Une demande saisie depuis l'accueil ne rejoint pas nécessairement la file du gestionnaire. |
| Réservations client | L'espace client utilise des clés par email comme `bideReservations_<email>`, alors que le back-office exploite principalement `queue`. | Les équipes internes ne disposent pas automatiquement des réservations créées par les clients. |
| Comptes | Les clients utilisent `bideUsers`/`bideCurrentUser`, tandis que les employés utilisent `bide_users`/`bide_current_user`. | Il existe deux systèmes d'identité séparés. |
| Catégories | L'admin et la vitrine présentent 9 catégories, tandis que le modèle du gestionnaire contient aussi `citadine`. | Les listes et statistiques peuvent présenter des nombres différents. |
| Point d'entrée | Le `index.html` situé à la racine redirige vers `login.html`. La vitrine est dans `Desktop/laverie/index.html`. | Un visiteur arrivant à la racine voit le portail interne au lieu de l'accueil public. |
| Design | La vitrine et les portails publics utilisent désormais un thème claire bleu/blanc cohérent. Les portails internes sont majoritairement clairs bleu/blanc. | L'identité visuelle est en cours d'harmonisation. |

### Plan d'amélioration priorisé

#### Priorité 1 : continuité métier

- choisir une base de données unique pour les clients, les employés, les véhicules, les réservations, les commandes, les paiements et les notifications ;
- créer une API serveur utilisée par la vitrine, l'espace client, l'admin, la caisse, le gestionnaire et le laveur ;
- faire lire les tarifs de la vitrine et du calculateur depuis une source unique ;
- transformer chaque réservation client en commande visible par le gestionnaire ;
- relier les statuts `réservée`, `en attente`, `assignée`, `en cours`, `terminée`, `validée` et `payée` ;
- empêcher les doubles réservations sur une même date et un même créneau.

#### Priorité 2 : comptes et sécurité

- centraliser les comptes dans un modèle utilisateur unique avec un champ `role` ;
- déplacer l'authentification et le contrôle des permissions côté serveur ;
- remplacer les comptes de démonstration et mots de passe visibles dans le code ;
- utiliser des mots de passe hachés côté serveur avec Argon2id ou bcrypt ;
- utiliser des cookies de session `Secure`, `HttpOnly` et `SameSite` ;
- ajouter une expiration de session, une limitation des tentatives et une récupération de mot de passe ;
- appliquer une validation serveur à toutes les données reçues de la vitrine et des portails.

#### Priorité 3 : expérience utilisateur

- faire de la vitrine le point d'entrée public principal ;
- harmoniser les couleurs, la typographie, les logos et les composants entre les portails ;
- afficher le même nombre de catégories dans tous les écrans ;
- permettre au client de modifier ou annuler une réservation selon les règles métier ;
- afficher au client les changements de statut provenant du gestionnaire et du laveur ;
- remplacer les données de démonstration par des données récupérées dynamiquement ;
- améliorer les états de chargement, les messages d'erreur et l'accessibilité mobile.

#### Priorité 4 : qualité et exploitation

- ajouter des tests automatisés de navigation, authentification, permissions, tarifs, réservation et paiement ;
- ajouter des tests responsive sur mobile, tablette et ordinateur ;
- mettre en place une intégration continue ;
- centraliser les erreurs et la journalisation ;
- ajouter des sauvegardes serveur et un plan de restauration ;
- servir les dépendances critiques localement ou avec une politique SRI ;
- documenter les variables d'environnement, les procédures de déploiement et les responsables de maintenance.

### Critères de réussite

La centralisation sera considérée comme complète lorsque :

- un tarif modifié par l'admin est identique dans la vitrine, le calculateur, la caisse et le gestionnaire ;
- une réservation créée par un client apparaît dans le gestionnaire sans manipulation manuelle ;
- le gestionnaire peut assigner cette réservation à un laveur ;
- le client voit l'évolution réelle de son statut ;
- la caisse retrouve la commande validée et calcule le tarif central ;
- le paiement met à jour la commande et les statistiques admin ;
- les mêmes comptes et permissions fonctionnent sur tous les portails ;
- les données restent disponibles après changement de navigateur ou d'appareil ;
- aucun mot de passe, rôle ou paiement ne peut être falsifié uniquement depuis le navigateur.

## Installation et lancement

### Prérequis

- un navigateur moderne : Chrome, Edge ou Firefox ;
- VS Code ;
- une extension de serveur local, par exemple **Live Server**, recommandée pour éviter les limitations de `file://`.

### Lancement avec VS Code

1. Ouvrir le dossier `Hard-Terror` dans VS Code.
2. Ouvrir `index.html` à la racine.
3. Lancer la page avec **Open with Live Server**.
4. Le fichier racine redirige vers `login.html`. Pour ouvrir la vitrine publique, utiliser `Desktop/laverie/index.html`.

La page principale peut également être ouverte directement :

```text
Desktop/laverie/index.html
```

Pour les portails internes, utiliser :

```text
login.html
```

### Lancement avec un serveur local Python

Depuis la racine du projet :

```bash
python -m http.server 5500
```

Puis ouvrir :

```text
http://localhost:5500/
```

## Tests et validation

Le projet ne contient pas encore de suite de tests automatisés. La validation actuelle est donc manuelle et doit couvrir au minimum :

- l'ouverture de la page racine et la redirection vers la vitrine ;
- les liens Accueil, À propos, Services, Tarifs, Clients et Contact ;
- l'inscription et la connexion d'un client ;
- l'accès refusé à l'espace client sans session ;
- la connexion de chacun des quatre rôles internes ;
- les gardes d'accès Admin, Caisse, Gestionnaire et Laveur ;
- la création d'un ticket, son assignation, sa validation et son paiement ;
- la modification des tarifs et leur lecture dans la caisse ;
- la création d'une réservation, d'un véhicule et d'un reçu ;
- la sauvegarde et la restauration des données locales ;
- l'affichage sur ordinateur et mobile ;
- la lecture automatique des vidéos hero ;
- l'affichage des feedbacks anonymes dans les pages publiques ;
- le fonctionnement du bouton « Espace client » dans la navbar.

Avant une mise en production, ajouter des tests automatisés de navigation, d'authentification, de permissions, de calcul des prix et de paiement.

## Déploiement

Le projet peut être déployé comme site statique sur GitHub Pages, Netlify, Vercel ou un serveur web classique. Aucun processus de compilation n'est requis.

1. Publier l'intégralité du dossier `Hard-Terror` en conservant l'arborescence.
2. Configurer la racine du site sur le dossier du projet.
3. Vérifier que `index.html`, `login.html`, `Desktop/laverie/` et `lavage1/lavage/` sont accessibles.
4. Vérifier les chemins relatifs et le chargement des images et vidéos.
5. Tester les CDN Bootstrap, Bootstrap Icons, Chart.js, Leaflet et QRCode.js.
6. Activer HTTPS sur l'hébergement.
7. Vérifier que les vidéos hero se chargent correctement (formats MP4, taille ~45 Mo et ~17 Mo).

Le déploiement statique ne transforme pas l'application en solution serveur : les données restent propres au navigateur de chaque utilisateur et ne sont pas partagées entre appareils.

### Installation PWA sur mobile

Une fois déployé avec HTTPS, les utilisateurs Android peuvent installer l'application :
1. Ouvrir le site dans Chrome
2. Appuyer sur « Installer l'application » ou le menu ⋮ → « Installer l'application »
3. L'icône BIDÈ apparaît sur l'écran d'accueil
4. Le site s'ouvre en mode application (sans barre d'adresse)
5. Les pages visitées fonctionnent **hors ligne** grâce au service worker

### Dépendances externes

Les bibliothèques suivantes sont actuellement chargées depuis des CDN :

| Dépendance | Utilisation |
|---|---|
| Bootstrap 5.3.3 | Mise en page, formulaires, modales et composants |
| Bootstrap Icons 1.11.3 | Icônes de l'interface et des filtres tarifs |
| Leaflet 1.9.4 | Carte et localisation, lorsqu'elle est utilisée |
| Chart.js | Graphiques administrateur et caisse |
| QRCode.js 1.0.0 | Génération des tickets QR |

Une connexion Internet est donc nécessaire pour disposer de toutes les fonctionnalités lorsqu'elles ne sont pas embarquées localement.

### Ressources multimédia

| Fichier | Taille | Utilisation |
|---|---|---|
| `Desktop/laverie/IMAGE/video.mp4` | ~45 Mo | Vidéo hero principale (pages Accueil, Contact, Tarifs, Services, À propos) |
| `Desktop/laverie/IMAGE/video2.mp4` | ~17 Mo | Vidéo hero secondaire |
| `Desktop/laverie/Génération Vidéo Lavage Voiture.mp4` | ~4 Mo | Ressource vidéo de démonstration |
| `Desktop/laverie/img/` | Divers | Images avant/après de véhicules |

## Parcours utilisateur

### Client

1. Ouvrir la vitrine.
2. Cliquer sur `Espace client` dans la navbar ou sur `Login` puis créer un compte.
3. Créer un compte avec un nom, un email, un téléphone et un mot de passe d'au moins six caractères.
4. Après inscription, l'utilisateur est redirigé vers `lavage1/lavage/client.html`.
5. Ajouter un véhicule puis effectuer une réservation.

La session client est enregistrée avec les clés `bideUsers` et `bideCurrentUser`.

### Employé

1. Ouvrir `login.html`.
2. Choisir un rôle ou utiliser une connexion rapide de démonstration.
3. Se connecter.
4. L'application redirige automatiquement vers le portail correspondant au rôle.

## Portails internes

| Portail | Page d'entrée | Rôle attendu | Fichier principal |
|---|---|---|---|
| Connexion | `login.html` | Tous les rôles | `auth.js` |
| Administration | `admin.html` | `admin` | `admin.js` |
| Caisse | `caisse.html` | `caisse` ou `admin` | `caisse.js` |
| Gestionnaire | `gestionnaire/dashboard.html` | `gestionnaire` | `js/script.js` |
| Laveur | `laveur/dashboard.html` | `laveur` | `js/script.js` |
| Client | `lavage1/lavage/client.html` | Client | `lavage1/lavage/lavage.js` |

## Authentification et rôles

L'authentification interne est centralisée dans `auth.js`.

Rôles disponibles :

- `admin` : administration générale et tarifs ;
- `caisse` : paiements et rapprochement ;
- `gestionnaire` : commandes, file d'attente, laveurs et rapports ;
- `laveur` : tâches et suivi des véhicules.

### Comptes internes de démonstration

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Administrateur | `admin` | `admin123` |
| Caissier | `caisse` | `caisse123` |
| Gestionnaire | `gestionnaire` | `gestion123` |
| Laveur | `laveur` | `laveur123` |

Ces identifiants sont visibles dans le code et ne doivent pas être utilisés en production.

Les utilisateurs internes sont initialisés dans la clé `bide_users`. La session interne utilise :

- `sessionStorage.bide_current_user` ;
- `localStorage.bide_current_user`.

## Données et synchronisation

Les données sont stockées localement dans le navigateur. Les principales clés utilisées sont :

| Clé | Utilisation |
|---|---|
| `bide_users` | Utilisateurs internes |
| `bide_current_user` | Session interne |
| `bideUsers` | Comptes clients |
| `bideCurrentUser` | Session client |
| `tariffs` | Grille tarifaire commune admin/caisse/gestionnaire |
| `queue` | File des véhicules et commandes |
| `transactions` | Paiements enregistrés |
| `receipts` | Reçus de caisse |
| `reconciliations` | Rapprochements de caisse |
| `bide_laveurs` | Liste des laveurs |
| `bide_notifications` | Notifications internes |
| `bide_feedbacks` | Retours anonymes clients (affichés sur les pages publiques) |
| `bideVehicles_<email>` | Véhicules d'un client |
| `bideReservations_<email>` | Réservations d'un client |
| `bideHistory_<email>` | Historique d'un client |
| `bideWashCount_<email>` | Compteur de lavages d'un client |
| `bide_welcomed` | Flag de première visite (popup de bienvenue) |

La synchronisation entre les écrans ouverts dans le même navigateur utilise principalement l'événement `storage`.

## Grille tarifaire

Les catégories prises en charge par le modèle opérationnel sont :

- Vélo / VTT ;
- Moto / Scooter ;
- Tricycle / Tuk-Tuk ;
- Berline / BMW ;
- SUV / 4x4 / Pick-up ;
- Minibus / Fourgon ;
- Camion moyen ;
- Poids lourd / Semi ;
- Engin spécial / Chantier.

Le fichier `js/script.js` ajoute également la catégorie **Citadine** pour le portail gestionnaire, soit 10 catégories dans ce module. Certains écrans publics et certaines valeurs par défaut en présentent 9. Cette différence doit être harmonisée avant une utilisation commerciale.

Chaque catégorie possède trois formules :

- lavage simple ;
- lavage complet ;
- lavage premium.

Les tarifs par défaut sont déclarés dans `admin.js`, `caisse.js` et `js/script.js`. La clé `tariffs` permet de partager les modifications entre les portails internes.

## Structure des fichiers

```text
Hard-Terror/
├── index.html                 # Point d'entrée et redirection
├── login.html                 # Connexion des employés
├── auth.js                    # Sessions, rôles et gardes d'accès
├── manifest.json              # Métadonnées PWA (nom, icônes, thème)
├── sw.js                      # Service Worker (cache pages et vidéos)
├── icon.svg                   # Icône SVG pour la PWA et le favicon
├── logo.jpg                   # Logo JPEG pour les icônes PWA
├── admin.html                 # Tableau de bord administrateur
├── admin.js                   # Tarifs, statistiques, graphiques et sauvegarde
├── admin.css                  # Styles administrateur
├── caisse.html                # Tableau de bord caisse
├── caisse.js                  # Recherche, paiement, reçus et rapprochement
├── caisse.css                 # Styles caisse
├── css/
│   ├── style.css              # Styles partagés
│   ├── theme.css              # Thème des portails internes
│   └── laveur-animations.css  # Animations
├── js/
│   └── script.js               # Logique gestionnaire et laveur
├── gestionnaire/
│   ├── dashboard.html         # Saisie express et suivi
│   ├── commandes.html         # Registre des commandes
│   ├── laveurs.html           # Équipe et pistes
│   ├── rapports.html          # Rapports
│   ├── utilisateurs.html      # Utilisateurs internes
│   └── profil.html            # Profil gestionnaire
├── laveur/
│   ├── dashboard.html         # Tâches assignées
│   ├── commandes.html         # Historique laveur
│   ├── details-commande.html  # Détails d'une commande
│   └── profil.html            # Profil laveur
├── Desktop/laverie/
│   ├── index.html             # Vitrine accueil
│   ├── tarifs.html            # Tarifs publics
│   ├── contact.html           # Contact et localisation
│   ├── main.js                # Connexion client et interactions publiques
│   ├── style.css              # Styles de la vitrine (thème clair)
│   ├── IMAGE/
│   │   ├── video.mp4          # Vidéo hero principale
│   │   ├── video2.mp4         # Vidéo hero secondaire
│   │   └── voiture1.jpg (1).jpeg  # Image de secours pour vidéo
│   └── img/                   # Images avant/après véhicules
├── lavage1/lavage/
│   ├── a-propos.html          # Présentation de BIDÈ
│   ├── services.html          # Services et formules
│   ├── client.html            # Espace client
│   ├── main.js                # Logique publique partagée
│   ├── lavage.js              # Fonctionnalités de l'espace client
│   └── style.css              # Styles publics et client (thème clair)
├── redmeimg/
│   ├── AKB13.jpeg            # Photo - Koffi Brice ALY
│   ├── Jeovani (2).jpeg      # Photo - Koffi José-Jéovani SOVON
│   ├── priscille 5.jpeg      # Photo - Adjo Priscille DZIWONU
│   └── valentin.jpeg         # Photo - Koami Valentin TAGA
└── images/                    # Ressources graphiques du projet
```

## Dépannage

### Une page affiche une erreur 404

Vérifier que la page est lancée depuis la racine du projet ou avec un serveur local. Les liens entre `Desktop/laverie` et `lavage1/lavage` utilisent des chemins relatifs.

### La page client revient au login

C'est le comportement attendu lorsque `bideCurrentUser` n'est pas présent ou est invalide. Se connecter ou créer un compte depuis la vitrine avant d'ouvrir `lavage1/lavage/client.html`.

### Les données semblent avoir disparu

Les données sont liées au navigateur, au profil utilisateur et parfois à l'origine du serveur. Vérifier que le projet est ouvert avec la même URL et le même navigateur. Effacer le stockage du site supprime les données locales.

### Les tarifs ne sont pas identiques partout

Vérifier la clé `tariffs` dans le stockage du navigateur et recharger les écrans ouverts. Le portail administrateur est la source prévue pour modifier la grille.

### Les composants Bootstrap ou les icônes ne s'affichent pas

Les bibliothèques sont chargées depuis des CDN. Vérifier la connexion Internet ou utiliser une version locale des dépendances.

### La vidéo hero ne se lit pas

Vérifier que le fichier `video.mp4` est présent dans `Desktop/laverie/IMAGE/` et que le serveur local est utilisé (certains navigateurs bloquent la lecture vidéo depuis `file://`). Vérifier également que l'autorisation de lecture automatique n'est pas bloquée par le navigateur.

### Les feedbacks ne s'affichent pas

Les retours sont stockés dans la clé `bide_feedbacks` du `localStorage`. Si aucun feedback n'a été soumis, un message « Aucun retour n'a encore été enregistré » est affiché.

### La PWA ne s'installe pas

Vérifier que le site est accessible en HTTPS (requis pour le service worker). Ouvrir Chrome DevTools → onglet **Application** → **Service Workers** pour vérifier l'état. Vider le cache du navigateur si le SW est bloqué sur une ancienne version.

### Le service worker affiche des erreurs

Vérifier que `sw.js` est bien accessible depuis la racine du serveur. Les erreurs de chemin (404) empêchent l'enregistrement. Consulter la console du navigateur pour les détails.

## Limites connues

- Les modules publics historiques sont répartis entre `Desktop/laverie/` et `lavage1/lavage/`.
- Les comptes clients utilisent `bideUsers` alors que les comptes employés utilisent `bide_users`.
- Les feedbacks utilisent plusieurs clés historiques : `bideFeedbacks`, `bide_feedbacks` et `feedbacks`.
- Les pages publiques ne partagent pas toujours exactement les mêmes formulaires et composants de connexion.
- Les données de démonstration peuvent apparaître au premier lancement.
- Les bibliothèques CDN, les cartes, les QR codes et les vidéos dépendent de la connexion Internet.
- Les tests automatisés, l'intégration continue et la journalisation ne sont pas encore configurés.
- Les vidéos hero pèsent environ 45 Mo et 17 Mo, ce qui peut ralentir le chargement initial sur des connexions lentes.

## Limites et sécurité

Cette version est adaptée à une démonstration ou à un prototype local, mais pas à une exploitation réelle :

- les données sont stockées dans `localStorage` et peuvent être modifiées depuis les outils développeur ;
- les comptes et mots de passe de démonstration sont présents dans le code ;
- les contrôles de rôle sont réalisés côté client et ne remplacent pas une autorisation serveur ;
- les réservations, transactions et historiques ne sont pas sauvegardés sur un serveur ;
- les mots de passe clients sont hachés côté navigateur, mais cela ne constitue pas une authentification sécurisée de production ;
- aucune protection CSRF, limitation de tentatives ou journalisation serveur n'est disponible ;
- les dépendances CDN ne sont pas toutes accompagnées d'une politique SRI ;
- plusieurs modules historiques utilisent des noms de clés de stockage différents.

Ne pas utiliser de données personnelles ou de vrais moyens de paiement dans cette version de démonstration.

## Évolutions recommandées

Pour passer à une version production :

1. créer une API serveur et une base de données ;
2. déplacer l'authentification et les autorisations côté serveur ;
3. remplacer les mots de passe en clair par un hachage serveur avec sel, par exemple Argon2 ou bcrypt ;
4. centraliser les comptes clients et employés dans un seul modèle ;
5. centraliser les clés de stockage et les modèles de données ;
6. ajouter une validation serveur pour les réservations, prix et paiements ;
7. protéger les sessions avec des cookies sécurisés et `HttpOnly` ;
8. ajouter des tests fonctionnels et des tests de sécurité ;
9. servir les dépendances critiques localement ou avec SRI ;
10. mettre en place des sauvegardes et une gestion des erreurs côté serveur.

## Équipe de développement

La conception de LAVAGE BIDÈ a été réalisée collectivement, depuis la maquette et la rédaction des cahiers des charges jusqu'à l'écriture du code dans l'éditeur Nano, aux tests et au déploiement de l'application.

<table>
  <thead>
    <tr>
      <th>Développeur</th>
      <th>Photo</th>
      <th>Responsabilités principales</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Koffi José-Jéovani SOVON</strong></td>
      <td align="center"><img src="redmeimg/Jeovani%20(2).jpeg" alt="Koffi José-Jéovani SOVON" width="120" height="120" style="border-radius:50%;object-fit:cover;"></td>
      <td>Conception et développement de la partie <strong>Administration</strong> et <strong>Caisse</strong> ; participation aux cahiers des charges, aux tests et au déploiement.</td>
    </tr>
    <tr>
      <td><strong>Adjo Priscille DZIWONU</strong></td>
      <td align="center"><img src="redmeimg/priscille%205.jpeg" alt="Adjo Priscille DZIWONU" width="120" height="120" style="border-radius:50%;object-fit:cover;"></td>
      <td>Conception et développement de l'<strong>Accueil</strong>, de la page <strong>Contact</strong> et de la page <strong>Tarifs</strong> ; participation aux cahiers des charges, aux tests et au déploiement.</td>
    </tr>
    <tr>
      <td><strong>Koffi Brice ALY</strong></td>
      <td align="center"><img src="redmeimg/AKB13.jpeg" alt="Koffi Brice ALY" width="120" height="120" style="border-radius:50%;object-fit:cover;"></td>
      <td>Conception et développement des portails <strong>Gestionnaire</strong> et <strong>Laveur</strong> ; participation aux cahiers des charges, aux tests et au déploiement.</td>
    </tr>
    <tr>
      <td><strong>Koami Valentin TAGA</strong></td>
      <td align="center"><img src="redmeimg/valentin.jpeg" alt="Koami Valentin TAGA" width="120" height="120" style="border-radius:50%;object-fit:cover;"></td>
      <td>Conception et développement des pages <strong>À propos</strong>, <strong>Services</strong> et <strong>Clients</strong> ; participation aux cahiers des charges, aux tests et au déploiement.</td>
    </tr>
  </tbody>
</table>

### Répartition du travail

- **Conception** : réalisation des maquettes et définition des parcours utilisateurs.
- **Cahiers des charges** : expression des besoins, définition des fonctionnalités et répartition des modules.
- **Développement** : écriture et intégration du HTML, du CSS et du JavaScript dans l'éditeur Nano.
- **Tests** : vérification des pages, des formulaires, des rôles, des parcours de navigation et des fonctionnalités métier.
- **Déploiement** : préparation de la version fonctionnelle et mise à disposition de l'application.

## Licence

Aucune licence open source n'est actuellement indiquée dans le projet. Ajouter une licence avant toute distribution publique.
