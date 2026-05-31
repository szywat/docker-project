# ETAP 1: DEPS
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# ETAP 2: PROD
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=deps --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --chown=appuser:appgroup src ./src
COPY --chown=appuser:appgroup package.json ./

USER appuser

EXPOSE 5000

CMD ["node", "src/index.js"]