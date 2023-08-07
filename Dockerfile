FROM node:17-alpine3.12

ARG ENVIRONMENT
ENV ENVIRONMENT=$ENVIRONMENT

ARG GITHUB_TOKEN
ENV GITHUB_TOKEN=${GITHUB_TOKEN}

RUN apk add curl

RUN mkdir -p /var/www/api

ADD scripts /var/www/api/scripts
ADD src /var/www/api/src

COPY .npmrc package.json tsconfig.json /var/www/api/
COPY .env-example /var/www/api/.env-${ENVIRONMENT}

WORKDIR /var/www/api

RUN yarn
RUN yarn build