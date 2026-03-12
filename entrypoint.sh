#!/bin/sh
# Génère un fichier JS chargé par le navigateur avec les variables d'environnement runtime.
# Les appels API passent par le proxy Nginx /api/ → api-gateway interne (stable).

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__RUNTIME_CONFIG__ = {
  API_GATEWAY_URL: "${API_GATEWAY_URL:-/api}"
};
EOF

exec nginx -g "daemon off;"
