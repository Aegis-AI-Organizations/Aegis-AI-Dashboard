# [FR] # Quickstart | Aegis-AI-Dashboard

Document initialisé pour les tests de récupération Docusaurus par le plugin remote-content.

## Lancer le Dashboard en local

Le dashboard Aegis est une application React/Vite. Pour le lancer en environnement de développement :

### Pré-requis

- Node.js (v18+)
- npm, yarn ou pnpm

### Installation

1. Cloner le dépôt et se placer dans le dossier :

   ```bash
   git clone git@github.com:Aegis-AI-Organizations/Aegis-AI-Dashboard.git
   cd Aegis-AI-Dashboard
   ```

2. Installer les dépendances :

   ```bash
   npm install
   ```

3. Configuration :
   Copier le fichier d'exemple et configurer les variables :
   ```bash
   cp .env.example .env
   ```
   _Assurez-vous que `VITE_API_GATEWAY_URL` pointe bien vers votre instance locale de l'API (ex: `http://localhost:8080`)._

### Lancement

Démarrer le serveur de développement avec Hot-Reload :

```bash
npm run dev
```

Le dashboard sera accessible sur `http://localhost:5173`.

### Lancement via Docker

Si vous préférez utiliser Docker, vous pouvez construire et lancer l'image :

```bash
docker build -t aegis-dashboard .
docker run -p 3001:80 aegis-dashboard
```

Le dashboard sera alors accessible sur `http://localhost:3001`.
