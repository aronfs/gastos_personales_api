# Stage 1: Build the application
FROM oven/bun:latest AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application files
COPY . .

# Generate Prisma Client
RUN bunx prisma generate

# Stage 2: Production environment
FROM oven/bun:latest AS runner

WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app .

# Expose port
EXPOSE 3000

# Set Node environment to production
ENV NODE_ENV=production

# Run the app
CMD ["bun", "run", "src/server.ts"]
