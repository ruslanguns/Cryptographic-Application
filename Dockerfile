ARG TAG=16.13.1-alpine3.14@sha256:8569c8f07454ec42501e5e40a680e49d3f9aabab91a6c149e309bac63a3c8d54
FROM harbor.service.wobcom.de/dockerhub-proxy/library/node:${TAG}

WORKDIR /usr/src/app

RUN chown -R node:node /usr/src/app

COPY package.json yarn.lock ./

RUN yarn install --pure-lockfile

COPY . .

RUN yarn run build

EXPOSE 3000

USER node

CMD [ "yarn", "run", "start:prod" ]