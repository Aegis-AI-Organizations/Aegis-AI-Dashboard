# Optimized Dockerfile for React/Vite project
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci || npm install
COPY . .
ARG VITE_API_URL=http://api.aegis.pre-alpha.local:32564
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build || true

# Stage 2: Serve via Nginx
FROM nginx:alpine-slim
# Assumes build directory is 'dist' for Vite. For CRA, use 'build'
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
