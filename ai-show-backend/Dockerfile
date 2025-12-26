FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY src ./src
COPY data ./data
COPY public ./public

ENV PORT=3000

CMD ["node", "src/app.js"]
