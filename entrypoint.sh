#!/bin/sh
# Génère un fichier JS chargé par le navigateur avec les variables d'environnement runtime.
# Les appels API passent par le proxy Nginx /api/ → api-gateway interne (stable).

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__RUNTIME_CONFIG__ = {
  API_GATEWAY_URL: "${API_GATEWAY_URL:-/api}"
};
EOF

# Remplace l'URL de l'API Gateway interne dynamiquement dans la config Nginx
sed -i "s|INTERNAL_API_URL_PLACEHOLDER|${INTERNAL_API_URL:-http://api-gateway-mvp:8080/}|g" /etc/nginx/conf.d/default.conf

exec nginx -g "daemon off;"
