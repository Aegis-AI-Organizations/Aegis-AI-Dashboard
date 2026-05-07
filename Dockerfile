# Optimized Dockerfile for React/Vite project
# Stage 1: Build
FROM public.ecr.aws/docker/library/node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY panda.config.ts ./
RUN npm ci || npm install
COPY . .

RUN npm run build || true

FROM public.ecr.aws/nginx/nginx:alpine-slim
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 80
# L'entrypoint génère /env-config.js à partir des env vars Kubernetes au démarrage du pod
ENTRYPOINT ["/entrypoint.sh"]
