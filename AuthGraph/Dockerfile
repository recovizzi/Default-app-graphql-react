FROM node:16

WORKDIR /appauth

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 4001

CMD ["npx", "nodemon", "index.js"]
