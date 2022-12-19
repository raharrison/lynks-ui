FROM node:19-bullseye-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.23-alpine

EXPOSE 80

COPY --from=build /app/dist/lynks-ui /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
