# 📊 Dashboard Telemetry

The Dashboard currently focuses on operational API state rather than client-side
analytics.

---

## User-visible signals

| Signal                          | Source                                                                          |
| ------------------------------- | --------------------------------------------------------------------------- |
| Agent counts and last heartbeat | `GET /api/agents/status`                                                       |
| Scan list and statuses          | `GET /api/scans`, scan SSE streams                                             |
| Vulnerability details           | `GET /api/scans/{id}/vulnerabilities`, `GET /api/vulnerabilities/{id}/evidences` |
| Billing balance and ledger      | Billing API routes                                                             |
| Audit activity                  | Admin audit route                                                              |

---

## Frontend logging

Development logging is limited to connection lifecycle and error diagnostics.
Sensitive values — JWTs, refresh cookies, deployment tokens, agent secrets — must
never be logged.

---

## Recommended future instrumentation

- Route-level page views without secrets.
- API error counters by route family.
- SSE connection health.
- Frontend build version and runtime config visibility.
- User action audit only through backend audit logs.

---

*Aegis AI Frontend Engineering — 2026*
