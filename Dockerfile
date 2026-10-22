FROM node:22-bookworm-slim AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends openssl \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS build
COPY package.json package-lock.json ./
RUN HUSKY=0 npm ci
COPY . .
RUN npm run build

FROM build AS dependencies
RUN npm prune --omit=dev --ignore-scripts

FROM base AS production
ENV NODE_ENV=production \
    PORT=10000
COPY --from=dependencies --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
COPY --from=build --chown=node:node /app/prisma ./prisma
COPY --from=build --chown=node:node /app/prisma.config.ts ./prisma.config.ts
COPY --from=build --chown=node:node /app/package.json /app/package-lock.json ./
COPY --chown=node:node docker/entrypoint.sh ./docker/entrypoint.sh
USER node
EXPOSE 10000
CMD ["sh", "docker/entrypoint.sh"]
