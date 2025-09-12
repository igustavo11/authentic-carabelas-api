FROM oven/bun:1
WORKDIR /app

# Install required system dependencies for MongoDB SSL connections
RUN apt-get update -y && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package.json bun.lockb* tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN bun install

# Generate Prisma client
RUN bunx prisma generate

# Copy source code
COPY src ./src

# Expose port
EXPOSE 3335

# Production command (without --watch)
CMD ["bun", "run", "src/index.ts"]
