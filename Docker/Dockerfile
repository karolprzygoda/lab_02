FROM node:24-bookworm-slim
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.28.2 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN DATABASE_URL=postgresql://postgres:postgres@localhost:51414/template1 pnpm build
EXPOSE 3000
CMD ["pnpm", "start"]
