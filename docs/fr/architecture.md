# [FR] # Architecture | Aegis-AI-Dashboard

Document initialisé pour les tests de récupération Docusaurus par le plugin remote-content.

## Frontend (React / Vite)

L'interface principale du Dashboard suit une architecture modulaire et orientée responsabilités.

### Structure des dossiers

- `src/components/` : Composants UI métiers (ex: `LaunchpadForm` orchestrateur, `ScanProgressTracker` pour le rendu conditionnel du suivi).
- `src/hooks/` : Logique métier et effets de bord isolés (appels API, boucle temporelle).
- `src/types/` : Définitions TypeScript partagées (contrats d'API).
- `src/constants/` : Données statiques de configuration.

### Mécanisme de Suivi des Scans (Polling)

Pour la version actuelle (Pre-Alpha), le Frontend utilise un mécanisme de **HTTP Polling** pour suivre l'avancement d'un pentest. Le hook `useScanPolling` effectue une requête `GET /scans/:id` toutes les 2.5 secondes sur l'API Gateway.

**Évolution prévue :** Par la suite, pour des raisons d'optimisations de performance réseau et pour garantir un véritable temps réel, ce mécanisme sera remplacé par du **Server-Sent Events (SSE)** ou des **WebSockets**, ce qui permettra au backend de "pousser" les changements d'états directement vers le dashboard sans requêtes répétées.

### Machine à États des Scans (State Machine)

Le cycle de vie d'un scan est strictement défini par ces statuts, traités visuellement par le Dashboard :

1. `PENDING` : En attente sur l'API Gateway.
2. `PROVISIONING` : Déploiement K8s en cours.
3. `RECONNAISSANCE` : Analyse de surface.
4. `ATTACKING` : Exécution agressive.
5. `ANALYZING` : Traitement des résultats (IA).
6. `GENERATING_REPORT` : Création du rapport structuré.
7. `CLEANING_UP` : Destruction du pod cible.
8. `COMPLETED` : Terminé avec succès (Fin du polling).

- _Failure states_: `FAILED` (erreur critique), `CANCELED` (action manuelle) -> Stoppent également le polling.

## Composants Principaux (Dashboard v2)

L'interface de l'application a été structurée autour de plusieurs vues clés permettant aux utilisateurs de gérer leurs pentests :

### 1. Launchpad & Suivi de Scan (`LaunchpadForm` & `ScanProgressTracker`)

Le composant **LaunchpadForm** permet de soumettre une cible (Image Docker) à l'API. Dès qu'un scan est initié, l'interface bascule sur le **ScanProgressTracker**.
Ce composant offre un retour visuel en temps réel grâce à une jauge de progression circulaire (SVG) qui se remplit au fur et à mesure que le scan avance, guidée par la machine à états de l'API.

### 2. Historique des Pentests Auto-Rafraîchi (`useScans`)

La page d'accueil affiche les 3 derniers pentests exécutés. Grâce au passage de la fonction de rafraîchissement (`refetch`) depuis le Hook `useScans` vers le formulaire de lancement et le tracker de progression, la liste s'actualise automatiquement dès qu'un nouveau scan est créé ou que le statut du scan actif change, éliminant le besoin de rechargement manuel.

### 3. Vue Détaillée des Vulnérabilités (`Vulnerabilities.tsx`)

Une interface dédiée permet d'inspecter les résultats d'un scan spécifique :

- **VulnerabilityList** : Liste les failles découvertes avec leurs sévérités (CRITICAL, HIGH, MEDIUM, LOW) et leurs statuts.
- **PentestAccordion** : Regroupe les actions menées par l'agent IA par phase (RECONNAISSANCE, EXPLOITATION, etc.) pour une analyse granulaire.
- **VulnerabilityDetailsDrawer** : Un panneau latéral s'ouvrant pour afficher le détail complet d'une vulnérabilité (Description, Solution, Preuves d'exploitation / Logs).
- **Téléchargement de Rapport** : Un hook dédié (`useDownloadReport`) gère la récupération sécurisée (via Blob URL) du rapport final au format Markdown ou PDF généré par le backend.
