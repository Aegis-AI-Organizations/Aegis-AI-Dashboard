# 🎛️ Architecture du Dashboard : Interface Analyste Temps Réel

Le **Dashboard Aegis AI** est l'interface principale de commande et de contrôle pour les analystes de sécurité. Construit avec **React 18** et **Vite**, il fournit une visualisation haute densité et en temps réel de l'ensemble du pipeline d'orchestration offensive.

---

## 🏗️ Principes de Conception de Base

Le Dashboard est conçu pour la **réactivité**, la **synchronisation d'état** et la **sécurité** :

1. **Cœur à la Pointe de la Technologie** : Exploitation de **Vite** pour un développement quasi instantané et des builds de production optimisés.
2. **Synchronisation Temps Réel** : Utilise les **Server-Sent Events (SSE)** pour diffuser en direct la progression des scans et les logs des workers directement depuis l'API Gateway, sans polling côté client.
3. **Architecture Découplée** : Le Dashboard est une pure Application à Page Unique (SPA) qui interagit avec l'écosystème Aegis uniquement via les points d'entrée REST/SSE standardisés de l' `Aegis-AI-Api-Gateway`.

---

## 🔐 Authentification et Renforcement des Sessions

Aegis impose une posture Zero Trust pour toutes les interactions des analystes :

- **OIDC avec PKCE** : L'authentification est gérée via **OpenID Connect (OIDC)** en utilisant le flux **Proof Key for Code Exchange (PKCE)** pour atténuer les attaques par injection de code d'autorisation.
- **Silent Refresh** : Implémente un mécanisme sécurisé de rafraîchissement silencieux pour maintenir les sessions sans nécessiter de rechargements de page complets ni exposer les jetons à un stockage persistant.
- **Atténuation CSRF et XSS** : Manipulation des données strictement typée et cookies sécurisés HTTP-only pour les jetons de rafraîchissement.

---

## 🛰️ Pile Technique

| Composant               | Technologie                    | Version |
| ----------------------- | ------------------------------ | ------- |
| Bibliothèque Frontend   | **React 18** (Concurrent Mode) | 18.2+   |
| Outil de Build          | **Vite**                       | 5.x     |
| Gestion d'État          | **Zustand**                    | 4.x     |
| Récupération de Données | **React Query** (TanStack)     | 5.x     |
| Temps Réel              | **SSE** (Server-Sent Events)   | —       |

---

## 🌊 Flux Logique : Scans Temps Réel

Lorsqu'un analyste lance un scan, le Dashboard entre dans un état de surveillance à haute intensité :

1. **Initialisation** : Requête POST vers `/scans` via l'API Gateway.
2. **Streaming** : Ouvre une connexion persistante `EventSource` vers `/scans/stream`.
3. **Mises à Jour d'État** : En réaction aux événements SSE, le store **Zustand** est mis à jour en temps réel, déclenchant des changements d'interface réactifs sur la carte d'attaque et les tableaux de vulnérabilités.
4. **Hydratation** : Lors du rechargement de la page, le Dashboard effectue une "Récupération de Session" pour s'assurer que l'analyste revient à l'état exact des scans actifs.

---

## 🗂️ Paramètres de l'entreprise

Les owners et admins gèrent le profil de leur organisation depuis un écran dédié
**Paramètres de l'entreprise** (`src/pages/CompanySettings.tsx`, accessible
depuis la Sidebar et la navigation mobile) :

- Lit le profil du tenant via `GET /api/companies/me` (nom, avatar, taille et
  type d'organisation, nombre de membres, email du owner, solde de tokens).
- Enregistre les modifications via `PUT /api/companies/me` ; la taille et le
  type d'organisation sont contraints aux valeurs d'énumération du backend pour
  garder l'UI synchronisée avec le Brain.
- Utilise les recipes Panda CSS partagées `card` / `pageTitle` / `button`,
  cohérentes avec le reste de la console.

---

_Expérience Utilisateur et Ingénierie Frontend Aegis AI — 2026_
