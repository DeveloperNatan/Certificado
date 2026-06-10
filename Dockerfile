FROM node:current-alpine3.22

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV EMAIL_USER=certificadocatolica@gmail.com
ENV EMAIL_PASS=pdaplscdtwkywitp
ENV PORT=8080

EXPOSE 8080

CMD [ "node", "server.js" ]