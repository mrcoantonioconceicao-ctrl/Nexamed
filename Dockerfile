# Stage 1: Build Phase
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package declarations
COPY package*.json ./

# Install all dependencies including devDependencies for build
RUN npm ci

# Copy application source code
COPY . .

# Run build script (Vite frontend + esbuild server.ts -> dist/server.cjs)
RUN npm run build

# Stage 2: Production Execution Environment
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy package declarations and install production dependencies only
COPY package*.json ./
RUN npm ci --only=production

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Expose application port
EXPOSE 3000

# Container Health Check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start NexaMed Production Server
CMD ["node", "dist/server.cjs"]
