# 🚀 Quickstart : Dashboard Analyste

Le Dashboard Aegis est une application React 18 + Vite. Il consomme les endpoints
REST/SSE de l'API Gateway et laisse toutes les décisions métier au backend.

---

## Prérequis

- Node.js 18+
- npm (ou yarn / pnpm)

## Développement local

```bash
npm install
cp .env.example .env      # définir VITE_API_URL, ex. http://localhost:8080/api
npm run dev
```

Le serveur de dev tourne sur `http://localhost:5173` (Vite) ou
`http://localhost:3000` via la stack Docker Compose `Aegis-AI-Infra/local-dev`.

Pointez les boutons de documentation vers une instance Docusaurus locale si
besoin :

```bash
VITE_DOCS_URL=http://localhost:3000/Aegis-AI-Documentation npm run dev
```

## Build de production

```bash
npm run build
```

Le build exécute la génération Panda CSS, la compilation TypeScript et le bundling
Vite.

## Docker

```bash
docker build -t aegis-dashboard .
docker run -p 3001:80 aegis-dashboard
```

---

## Configuration runtime

Le frontend lit d'abord `window.__RUNTIME_CONFIG__`, puis les variables Vite :

| Clé                                | Objectif                                 |
| ---------------------------------- | ------------------------------------- |
| `API_GATEWAY_URL` / `VITE_API_URL` | URL de base de la Gateway               |
| `DOCS_BASE_URL` / `VITE_DOCS_URL`  | URL de base Docusaurus pour les boutons de documentation |

## Onboarding d'un agent depuis le Dashboard

1. Activez le compte owner ou faites une rotation du token agent depuis
   **Paramètres**.
2. Copiez immédiatement le token de déploiement `ag_...` (affiché une seule fois).
3. Ouvrez le tableau de bord sécurité.
4. Si aucun agent n'est configuré, cliquez sur **Déployer le premier agent** pour
   ouvrir le guide d'installation.
5. Attendez que `Agents déployés`, `Actifs` et `Vu pour la dernière fois` se
   mettent à jour. Le panneau est alimenté par `GET /api/agents/status`.

---

*Ingénierie Frontend Aegis AI — 2026*
