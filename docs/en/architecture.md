# 🎛️ Dashboard Architecture: Real-time Analyst Interface

The **Aegis AI Dashboard** is the primary command and control interface for security analysts. Built with **React 18** and **Vite**, it provides a high-density, real-time visualization of the entire offensive orchestration pipeline.

---

## 🏗️ Core Design Principles

The Dashboard is designed for **responsiveness**, **state-synchronization**, and **security**:

1. **State-of-the-Art Core**: Leveraging **Vite** for near-instant development and optimized production builds.
2. **Real-time Synchronization**: Uses **Server-Sent Events (SSE)** to stream live scan progress and worker logs directly from the API Gateway without client-side polling.
3. **Decoupled Architecture**: The Dashboard is a pure Single Page Application (SPA) that interacts with the Aegis ecosystem solely through the standardized REST/SSE endpoints of the `Aegis-AI-Api-Gateway`.

---

## 🔐 Authentication & Session Hardening

Aegis enforces a Zero Trust posture for all analyst interactions:

- **OIDC with PKCE**: Authentication is handled via **OpenID Connect (OIDC)** using the **Proof Key for Code Exchange (PKCE)** flow to mitigate authorization code injection attacks.
- **Silent Refresh**: Implements a secure silent-refresh mechanism to maintain sessions without requiring hard page reloads or exposing tokens to persistent storage.
- **CSRF & XSS Mitigation**: Strictly typed data handling and secure HTTP-only cookies for refresh tokens.

---

## 🛰️ Technical Stack

| Component        | Technology                     | Version |
| ---------------- | ------------------------------ | ------- |
| Frontend Library | **React 18** (Concurrent Mode) | 18.2+   |
| Build Tooling    | **Vite**                       | 5.x     |
| State Management | **Zustand**                    | 4.x     |
| Data Fetching    | **React Query** (TanStack)     | 5.x     |
| Real-time        | **SSE** (Server-Sent Events)   | —       |

---

## 🌊 Logic Flow: Real-time Scans

When an analyst initiates a scan, the Dashboard enters a high-intensity monitoring state:

1. **Initiation**: POST request to `/scans` via the API Gateway.
2. **Streaming**: Opens a persistent `EventSource` connection to `/scans/stream`.
3. **State Updates**: Reacting to SSE events, the **Zustand** store is updated in real-time, triggering reactive UI changes across the Attack Map and Vulnerability tables.
4. **Hydration**: On page reload, the Dashboard performs a "Session Recovery" to ensure the analyst returns to the exact state of active scans.

---

_Aegis AI User Experience & Frontend Engineering — 2026_
