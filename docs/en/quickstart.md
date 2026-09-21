# 🚀 Quickstart: Analyst Dashboard

The Aegis Dashboard is a React 18 + Vite application. It consumes the API
Gateway's REST/SSE endpoints and keeps all business decisions on the backend.

---

## Prerequisites

- Node.js 18+
- npm (or yarn / pnpm)

## Local development

```bash
npm install
cp .env.example .env      # set VITE_API_URL, e.g. http://localhost:8080/api
npm run dev
```

The dev server runs on `http://localhost:5173` (Vite) or `http://localhost:3000`
via the `Aegis-AI-Infra/local-dev` Docker Compose stack.

Point the docs buttons at a local Docusaurus instance when needed:

```bash
VITE_DOCS_URL=http://localhost:3000/Aegis-AI-Documentation npm run dev
```

## Production build

```bash
npm run build
```

The build runs Panda CSS codegen, TypeScript compilation, and Vite bundling.

## Docker

```bash
docker build -t aegis-dashboard .
docker run -p 3001:80 aegis-dashboard
```

---

## Runtime configuration

The frontend reads `window.__RUNTIME_CONFIG__` first, then Vite env vars:

| Key                                | Purpose                                  |
| ---------------------------------- | ------------------------------------- |
| `API_GATEWAY_URL` / `VITE_API_URL` | Gateway base URL                        |
| `DOCS_BASE_URL` / `VITE_DOCS_URL`  | Docusaurus base URL for doc buttons    |

## Agent onboarding from the Dashboard

1. Activate the owner account or rotate the agent token from **Settings**.
2. Copy the `ag_...` deployment token immediately (shown once).
3. Open the security dashboard.
4. If no agent is configured, click **Deploy first agent** to open the install guide.
5. Wait for `Agents deployed`, `Active`, and `Last seen` to update. The panel is
   powered by `GET /api/agents/status`.

---

*Aegis AI Frontend Engineering — 2026*
