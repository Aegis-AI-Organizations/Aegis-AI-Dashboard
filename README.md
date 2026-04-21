# Aegis AI — Analyst Dashboard

**Project ID:** AEGIS-CORE-2026

The Aegis AI Dashboard is the primary command and control interface for security analysts. A high-performance React 18 application that provides real-time visualization of orchestrated pentests, vulnerability intelligence, and automated remediation workflows.

🏗️ Role in the Ecosystem
The Dashboard handles all user-facing interactions and visualizes the massive data output from the Brain cluster.

- **Live Attack Map**: Real-time visualization of scan progress via Server-Sent Events (SSE).
- **Vulnerability Vault**: Deep-dive into discovered CVEs with technical evidence and loot.
- **Remediation Hub**: Automated patch generation and GitOps-driven deployment triggers.

```mermaid
graph LR
    User([Analyst]) -- "HTTPS / OIDC" --> Dashboard["Dashboard (React)"]
    Dashboard -- "REST / SSE" --> Gateway["API Gateway"]
    Gateway -- "gRPC / mTLS" --> Brain["Brain Orchestrator"]
```

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
