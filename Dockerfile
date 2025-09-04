FROM oven/bun:1
WORKDIR /app

# Install OpenSSL to fix Prisma connection issues
RUN apt-get update -y && apt-get install -y openssl

COPY package.json bun.lockb* tsconfig.json prisma ./
RUN bun install
RUN bunx prisma generate

COPY src ./src

EXPOSE 3335
CMD ["bun", "--watch", "run", "src/index.ts"]
