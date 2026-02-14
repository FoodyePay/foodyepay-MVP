# Dockerfile for FoodyePay Next.js Application optimized for Cloud Run
# Includes AVOS (AI Voice Ordering System) - Patent Pending

# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time dummy variables (Secrets will be injected at runtime via Cloud Run)
ENV CDP_API_KEY_ID=dummy
ENV CDP_API_PRIVATE_KEY=dummy
ENV CDP_PROJECT_ID=dummy
ENV NEXT_PUBLIC_SUPABASE_URL=https://dummy.com
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set permissions for nextjs user
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage standalone output to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 8080

CMD ["node", "server.js"]
