FROM node:22-bookworm-slim AS base

# Install dependencies required for canvas, sqlite3, and tfjs-node
RUN apt-get update && apt-get install -y \
    build-essential \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    python3 \
    pkg-config \
    openssl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# We don't download models here if they are already downloaded locally, 
# but let's run the script just in case to ensure they are present.
RUN node scratch/download_models.js
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create the directories for persistence
RUN mkdir -p public/uploads
RUN mkdir -p data

COPY --from=builder /app/public ./public
# Automatically leverage output traces to reduce image size
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Copy Prisma schema and generated client for db push
COPY --from=builder /app/prisma ./prisma
# Copy models
COPY --from=builder /app/public/models ./public/models

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Set Prisma DB URL to a persistent volume path
ENV DATABASE_URL="file:/app/data/prod.db"

# Startup command: push schema to DB then start the server
CMD ["sh", "-c", "npx prisma db push && node server.js"]
