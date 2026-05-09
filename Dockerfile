# Base image
FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source code and build
COPY tsconfig.json ./
COPY prisma.config.ts ./
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# Production image
FROM node:22-alpine AS runner

WORKDIR /app

# Copy production dependencies and built files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./

# Set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# Start script running migrations and the app
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
