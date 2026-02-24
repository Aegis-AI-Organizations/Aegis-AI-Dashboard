# Optimized Dockerfile for React/Vite project
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build || true

# Stage 2: Serve via Nginx
FROM nginx:alpine-slim
# Assumes build directory is 'dist' for Vite. For CRA, use 'build'
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
