FROM node:17-alpine3.12

ARG NODE_ENV
ENV NODE_ENV=$NODE_ENV

RUN apk add curl

RUN mkdir -p /var/www/api

ADD static /var/www/api/static
ADD scripts /var/www/api/scripts
ADD src /var/www/api/src

COPY package.json tokens.json tsconfig.json /var/www/api/
COPY .env-example /var/www/api/.env-${NODE_ENV}

WORKDIR /var/www/api

RUN yarn
RUN yarn build