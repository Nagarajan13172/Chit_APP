# Backend: Express API + Prisma (Postgres)
FROM node:20-alpine

WORKDIR /app

# Install deps (incl. dev — the Prisma CLI is a devDependency used for migrate).
COPY package*.json ./
RUN npm ci

# Generate the Prisma client against the schema.
COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src

EXPOSE 4000

# Apply pending migrations, then start the server. NODE_ENV is provided at
# runtime via the env_file so dev deps remain available for `prisma migrate`.
CMD ["sh", "-c", "npx prisma migrate deploy && node src/server.js"]
