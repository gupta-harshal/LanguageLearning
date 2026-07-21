# Build stage — needs TypeScript + Prisma CLI (devDependencies)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY . .

# prisma generate + tsc + postbuild (ts-add-js-extension)
RUN npm run build


# Production stage — smaller image, only runtime deps
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
COPY prisma ./prisma

# Production deps + Prisma client generation
RUN npm ci --omit=dev && npx prisma generate

COPY --from=builder /app/dist ./dist

# Render injects PORT; Express already reads process.env.PORT
EXPOSE 3000

CMD ["node", "dist/index.js"]
