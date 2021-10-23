### STAGE 1: Build ###
FROM bitnami/node:14 AS build
RUN apt-get update &&  apt-get install git
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm  install
COPY editor/. .
RUN npm run build

### STAGE 2: Run ###
FROM nginx:1.17.1-alpine
COPY editor/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /usr/src/app/dist /usr/share/nginx/html

CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/static/env.template.js > /usr/share/nginx/html/static/env.js && exec nginx -g 'daemon off;'"]
