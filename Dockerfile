# Optimized Dockerfile for React/Vite project
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .

RUN npm run build || true

FROM nginx:alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
# L'entrypoint génère /env-config.js à partir des env vars Kubernetes au démarrage du pod
ENTRYPOINT ["/entrypoint.sh"]
