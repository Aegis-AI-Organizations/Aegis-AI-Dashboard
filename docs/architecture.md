# Architecture | Aegis-AI-Dashboard

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
