# Dependencies
FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

# Builder
FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules

COPY . .

RUN npm run build

# Production
FROM node:22-alpine AS runner
WORKDIR /app

RUN apk add --no-cache curl

RUN addgroup --system --gid 1001 nuxtjs
RUN adduser --system --uid 1001 nuxtjs

COPY --from=builder --chown=nuxtjs:nuxtjs /app/.output ./

USER nuxtjs

EXPOSE 3000

ENV NODE_ENV=Production
ENV PORT=3000
ENV HOST=0.0.0.0

HEALTHCHECK --interval=30s --timeout=30s --start-period=15s --retries=3 CMD curl -f http://localhost:3000/ || exit 1

CMD ["node", "server/index.mjs"]