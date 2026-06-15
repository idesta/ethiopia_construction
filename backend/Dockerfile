FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Copy schema.sql to dist/db/ so it can be loaded at runtime
RUN cp src/db/schema.sql dist/db/schema.sql

EXPOSE 4000

CMD ["node", "dist/index.js"]
