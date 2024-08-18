
FROM node:20

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

RUN npm install -g nodemon

COPY . .

EXPOSE 5000

ENV NODE_ENV=development

ENV PORT=5000

CMD ["npm", "run", "start:dev"]
