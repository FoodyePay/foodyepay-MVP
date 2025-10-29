# Dockerfile for FoodyePay Next.js Application

# ---- Base Stage: Install dependencies ----
# Use a specific Node.js version for consistency.
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and lock file to leverage Docker cache.
COPY package.json package-lock.json* ./
RUN npm ci

# ---- Builder Stage: Build the application ----
FROM node:20-alpine AS builder
WORKDIR /app

# Copy dependencies from the 'deps' stage.
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code.
COPY . .

# The env-check.js script requires these variables to be present during build.
# We provide dummy values here. The actual secrets will be injected at runtime in Cloud Run.
ENV CDP_API_KEY_ID=dummy-build-time-value
ENV CDP_API_PRIVATE_KEY=dummy-build-time-value
ENV CDP_PROJECT_ID=dummy-build-time-value
ENV NEXT_PUBLIC_SUPABASE_URL=https://dummy-build-time-url.com
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy-build-time-key

# Run the build command as defined in package.json.
RUN npm run build

# ---- Runner Stage: Create the final, lean production image ----
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create a non-root user for security purposes.
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy only the necessary files from the builder stage.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# The app will run as the non-root 'nextjs' user.
USER nextjs

# Expose the port Next.js runs on.
EXPOSE 3000

# Set the host to 0.0.0.0 to allow external connections to the container.
ENV HOSTNAME "0.0.0.0"
ENV PORT 3000

# The command to start the Next.js server.
CMD ["npm", "start"]
