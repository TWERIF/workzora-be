# syntax=docker/dockerfile:1.7
# Спільний Dockerfile для всіх Node.js мікросервісів.
# Використовується з context: . (корінь репо) і build-аргументом SERVICE_DIR.

ARG SERVICE_DIR

FROM node:20-alpine AS deps
ARG SERVICE_DIR
WORKDIR /app
COPY ${SERVICE_DIR}/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci

FROM node:20-alpine AS build
ARG SERVICE_DIR
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY ${SERVICE_DIR} .
RUN npm run build

FROM node:20-alpine AS production
ARG SERVICE_DIR
WORKDIR /app
ENV NODE_ENV=production
COPY ${SERVICE_DIR}/package*.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev
COPY --from=build /app/dist ./dist
CMD ["node", "dist/main.js"]
