# 🎛️ Aegis AI - SaaS Dashboard (Private Console)

**Project ID:** AEGIS-CORE-2026

## 🏗️ System Architecture & Role
The **Aegis SaaS Dashboard** (`app.aegis.ai`) serves as the central hub for DevSecOps users and SOC Analysts. This sophisticated Single Page Application (SPA) relies on heavy client-side functionality.

* **Tech Stack:** React 18 + Vite (SPA).
* **Key Features:**
  * **Mission Control (Home):** WebGL-powered Live Attack Map utilizing React-Three-Fiber to display realtime client infrastructure topologies.
  * **The Vault:** Provides an immutable timeline view of pentest reports leveraging secure in-memory streaming PDFs.
  * **Remediation Center:** Git Diff viewers for remediated Terraform code and PR automation.
* **UX Density:** Keyboard-first navigation (Command Palettes), high-density data tables, and default Dark Mode tailored for SOC environments.

## 🔐 Security & Dual-Interface Strategy
* **Domain Separation:** Completely disconnected from the public marketing site (`www.aegis.ai`) to strictly limit the attack surface.
* **Authentication:** Handled solely via OIDC (OpenID Connect) Authorization Code Flow with PKCE via Keycloak/Auth0. No unauthenticated data exists here.
* **No Plain-Text Secrets:** All API coordinates injected at build via Infisical.

## 🐳 Docker Deployment
The Dashboard is built statically and served by a high-performance web server container.

```bash
docker pull ghcr.io/aegis-ai/aegis-dashboard:latest

# Running as a fully read-only static file server container
infisical run --env=prod -- docker run -d \
  --name aegis-dashboard \
  --read-only \
  --cap-drop=ALL \
  --security-opt no-new-privileges:true \
  --user 10001:10001 \
  -p 80:80 \
  -e INFISICAL_TOKEN=$INFISICAL_TOKEN \
  ghcr.io/aegis-ai/aegis-dashboard:latest
```
