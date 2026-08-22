# LAVAGE BIDÈ

Application web statique de gestion d'une station de lavage automobile et d'engins. Le projet regroupe une vitrine publique, un espace client et plusieurs portails internes pour l'administration, la caisse, la gestion des opérations et les laveurs.

> **État actuel :** l'application fonctionne côté navigateur et utilise `localStorage`/`sessionStorage` comme stockage local. Elle ne possède pas encore de serveur, d'API ou de base de données distante.

## Sommaire

- [Fonctionnalités](#fonctionnalités)
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
- ouvrir une connexion client ou une connexion à un portail interne ;
- effectuer une réservation rapide depuis l'accueil ;
- envoyer un formulaire de contact ;
- accéder au lien WhatsApp de la station ;
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
- se déconnecter.

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

## Architecture

Le projet est une application HTML/CSS/JavaScript sans framework front-end.

- **Bootstrap 5.3.3** : mise en page et composants d'interface.
- **Bootstrap Icons** : icônes de navigation et d'actions.
- **Leaflet** : carte de localisation lorsqu'elle est chargée.
- **Chart.js** : graphiques du tableau de bord administrateur.
- **QRCode.js** : génération des tickets QR du gestionnaire.
- **JavaScript natif** : logique métier, navigation, stockage et rendu dynamique.

Le projet contient deux ensembles publics historiques qui ont été reliés par des chemins relatifs :

- `Desktop/laverie/` contient l'accueil, les tarifs et le contact ;
- `lavage1/lavage/` contient À propos, Services et Client.

Les liens entre ces deux ensembles ont été corrigés pour pointer vers les fichiers réellement présents.

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
| Design | La vitrine est sombre cyan/vert ; les portails internes sont majoritairement clairs bleu/blanc. | L'identité visuelle n'est pas totalement homogène. |

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
- l'affichage sur ordinateur et mobile.

Avant une mise en production, ajouter des tests automatisés de navigation, d'authentification, de permissions, de calcul des prix et de paiement.

## Déploiement

Le projet peut être déployé comme site statique sur GitHub Pages, Netlify, Vercel ou un serveur web classique. Aucun processus de compilation n'est requis.

1. Publier l'intégralité du dossier `Hard-Terror` en conservant l'arborescence.
2. Configurer la racine du site sur le dossier du projet.
3. Vérifier que `index.html`, `login.html`, `Desktop/laverie/` et `lavage1/lavage/` sont accessibles.
4. Vérifier les chemins relatifs et le chargement des images.
5. Tester les CDN Bootstrap, Bootstrap Icons, Chart.js, Leaflet et QRCode.js.
6. Activer HTTPS sur l'hébergement.

Le déploiement statique ne transforme pas l'application en solution serveur : les données restent propres au navigateur de chaque utilisateur et ne sont pas partagées entre appareils.

### Dépendances externes

Les bibliothèques suivantes sont actuellement chargées depuis des CDN :

| Dépendance | Utilisation |
|---|---|
| Bootstrap 5.3.3 | Mise en page, formulaires, modales et composants |
| Bootstrap Icons 1.11.3 | Icônes de l'interface |
| Leaflet 1.9.4 | Carte et localisation, lorsqu'elle est utilisée |
| Chart.js | Graphiques administrateur et caisse |
| QRCode.js 1.0.0 | Génération des tickets QR |

Une connexion Internet est donc nécessaire pour disposer de toutes les fonctionnalités lorsqu'elles ne sont pas embarquées localement.

## Parcours utilisateur

### Client

1. Ouvrir la vitrine.
2. Cliquer sur `Login` ou sur `Connexion client`.
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
| `bideVehicles_<email>` | Véhicules d'un client |
| `bideReservations_<email>` | Réservations d'un client |
| `bideHistory_<email>` | Historique d'un client |
| `bideWashCount_<email>` | Compteur de lavages d'un client |

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
│   └── style.css              # Styles de la vitrine
├── lavage1/lavage/
│   ├── a-propos.html          # Présentation de BIDÈ
│   ├── services.html          # Services et formules
│   ├── client.html            # Espace client
│   ├── main.js                # Logique publique partagée
│   ├── lavage.js              # Fonctionnalités de l'espace client
│   └── style.css              # Styles publics et client
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

## Limites connues

- Les modules publics historiques sont répartis entre `Desktop/laverie/` et `lavage1/lavage/`.
- Les comptes clients utilisent `bideUsers` alors que les comptes employés utilisent `bide_users`.
- Les feedbacks utilisent plusieurs clés historiques : `bideFeedbacks`, `bide_feedbacks` et `feedbacks`.
- Les pages publiques ne partagent pas toujours exactement les mêmes formulaires et composants de connexion.
- Les données de démonstration peuvent apparaître au premier lancement.
- Les bibliothèques CDN, les cartes et les QR codes dépendent de la connexion Internet.
- Les tests automatisés, l'intégration continue et la journalisation ne sont pas encore configurés.

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

| Développeur | Responsabilités principales |
|---|---|
| **Koffi José-Jéovani SOVON** | Conception et développement de la partie **Administration** et **Caisse** ; participation aux cahiers des charges, aux tests et au déploiement. |
| **Adjo Priscille DZIWONU** | Conception et développement de l'**Accueil**, de la page **Contact** et de la page **Tarifs** ; participation aux cahiers des charges, aux tests et au déploiement. |
| **Koffi Brice ALY** | Conception et développement des portails **Gestionnaire** et **Laveur** ; participation aux cahiers des charges, aux tests et au déploiement. |
| **Koami Valentin TAGA** | Conception et développement des pages **À propos**, **Services** et **Clients** ; participation aux cahiers des charges, aux tests et au déploiement. |

### Répartition du travail

- **Conception** : réalisation des maquettes et définition des parcours utilisateurs.
- **Cahiers des charges** : expression des besoins, définition des fonctionnalités et répartition des modules.
- **Développement** : écriture et intégration du HTML, du CSS et du JavaScript dans l'éditeur Nano.
- **Tests** : vérification des pages, des formulaires, des rôles, des parcours de navigation et des fonctionnalités métier.
- **Déploiement** : préparation de la version fonctionnelle et mise à disposition de l'application.

## Licence

Aucune licence open source n'est actuellement indiquée dans le projet. Ajouter une licence avant toute distribution publique.
