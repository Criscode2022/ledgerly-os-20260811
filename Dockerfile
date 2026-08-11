# --- build web ---
FROM node:22-bookworm AS web
WORKDIR /web
COPY apps/web/package*.json ./
RUN npm ci
COPY apps/web/ ./
RUN npm run build

# --- build api ---
FROM node:22-bookworm AS api
WORKDIR /api
COPY apps/api/package*.json ./
RUN npm ci
COPY apps/api/ ./
RUN npm run build

# --- runtime ---
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY apps/api/package*.json ./
RUN npm ci --omit=dev
COPY --from=api /api/dist ./dist
COPY --from=web /web/dist ./web-dist
# Point serve-static via env path layout: apps/web/dist/web
RUN mkdir -p apps/web/dist && cp -r web-dist apps/web/dist/web
EXPOSE 8080
CMD ["node", "dist/main.js"]
