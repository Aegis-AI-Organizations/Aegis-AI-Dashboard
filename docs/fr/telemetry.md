# 📊 Télémétrie du Dashboard

Le Dashboard se concentre pour l'instant sur l'état opérationnel de l'API plutôt
que sur de l'analytics côté client.

---

## Signaux visibles par l'utilisateur

| Signal                             | Source                                                                          |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Compteurs d'agents et dernier heartbeat | `GET /api/agents/status`                                                  |
| Liste des scans et statuts         | `GET /api/scans`, flux SSE de scan                                             |
| Détails de vulnérabilité           | `GET /api/scans/{id}/vulnerabilities`, `GET /api/vulnerabilities/{id}/evidences` |
| Solde et ledger de facturation     | Routes de l'API de facturation                                                 |
| Activité d'audit                   | Route d'audit admin                                                            |

---

## Logging frontend

Le logging de développement se limite au cycle de vie des connexions et au
diagnostic d'erreurs. Les valeurs sensibles — JWT, cookies de refresh, tokens de
déploiement, secrets agent — ne doivent jamais être loguées.

---

## Instrumentation future recommandée

- Vues de page au niveau route, sans secrets.
- Compteurs d'erreurs API par famille de routes.
- Santé des connexions SSE.
- Visibilité de la version de build frontend et de la config runtime.
- Audit des actions utilisateur uniquement via les audit logs backend.

---

*Ingénierie Frontend Aegis AI — 2026*
