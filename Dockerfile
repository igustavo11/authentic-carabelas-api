FROM oven/bun:1
WORKDIR /app

COPY package.json bun.lockb* tsconfig.json prisma ./
RUN bun install
RUN bunx prisma generate

COPY src ./src

EXPOSE 3335
CMD ["bun", "run", "src/index.ts"]
