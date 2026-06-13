# Frontend: build the Vite app, serve the static bundle (SPA mode).
# Routing / TLS is handled by Traefik (see docker-compose.prod.yml).
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Baked into the static bundle at build time (relative → same origin /api).
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ── Serve ──
FROM node:20-alpine

WORKDIR /app
RUN npm install -g serve@14
COPY --from=build /app/dist ./dist

EXPOSE 80

# `-s` = single-page app (rewrite unknown routes → index.html).
CMD ["serve", "-s", "dist", "-l", "80"]
