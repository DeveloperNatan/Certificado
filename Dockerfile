FROM node:current-alpine3.22

WORKDIR /app
COPY package*.json ./

RUN npm install

ENV EMAIL_USER=certificadocatolica@gmail.com
ENV EMAIL_PASS=pdaplscdtwkywitp
ENV PORT=8080

COPY . .

CMD [ "node", "server.js" ]

EXPOSE 8080

