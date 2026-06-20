FROM node:20-alpine

WORKDIR /app

# Prisma needs OpenSSL on Alpine/musl.
RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

EXPOSE 4000

# On boot: apply migrations, seed (idempotent), then start.
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.js && node src/index.js"]
