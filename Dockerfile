# syntax=docker/dockerfile:1.4

# ---- Builder Stage ----
# Installs all dependencies and builds the TypeScript source code.
FROM node:24-alpine AS builder
WORKDIR /app

# Enable pnpm package manager
RUN corepack enable pnpm

# Copy dependency manifests and install all dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application source code
COPY . .

# Build the NestJS application
RUN pnpm run build


# ---- Runtime Stage ----
# This is the final, lean, and secure image for production.
FROM node:24-alpine AS runtime


# Set the environment to production
ENV NODE_ENV=production
WORKDIR /app

# Enable pnpm package manager
RUN corepack enable pnpm

# Create a dedicated, unprivileged user and group for the application
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 appuser --ingroup appgroup

# CORRECTED LINE
RUN mkdir -p /app/uploads && chown -R appuser:appgroup /app


# Switch to the non-root user
USER appuser

# Copy dependency manifests
COPY --chown=appuser:appgroup package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod

# Copy the compiled application code from the builder stage
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist

# Expose the port the application will run on (NestJS default is 3000)
EXPOSE 8000

# Health check to ensure the application is running correctly
# Note: Update '/api/health' to your actual health check endpoint.
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:8000/api/health', {timeout: 2000}, (res) => res.statusCode === 200 ? process.exit(0) : process.exit(1)).on('error', () => process.exit(1))"

# The command to start the application
CMD node dist/main.js