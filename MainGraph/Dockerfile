FROM node:16

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma/

RUN npx prisma generate

COPY . .

EXPOSE 4000

CMD ["npx", "nodemon", "index.js"]
