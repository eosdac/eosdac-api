FROM node:17-alpine3.12

ARG CONFIG
ENV CONFIG=$CONFIG

RUN apk add curl

RUN mkdir -p /var/www/api

ADD static /var/www/api/static
ADD scripts /var/www/api/scripts
ADD src /var/www/api/src

COPY package.json tokens.json /var/www/api/
COPY example.config.js /var/www/api/${CONFIG}.config.js

WORKDIR /var/www/api

RUN yarn