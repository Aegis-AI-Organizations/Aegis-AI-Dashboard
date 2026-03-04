#!/bin/sh
# Génère un fichier JS chargé par le navigateur avec les variables d'environnement runtime.
# Ce mécanisme permet de configurer le frontend sans rebbuilder l'image Docker.

cat <<EOF > /usr/share/nginx/html/env-config.js
window.__RUNTIME_CONFIG__ = {
  API_GATEWAY_URL: "${API_GATEWAY_URL}"
};
EOF

exec nginx -g "daemon off;"
