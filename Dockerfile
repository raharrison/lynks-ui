FROM node:17-bullseye-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM nginx:1.21-alpine

EXPOSE 80

COPY --from=build /app/dist/lynks-ui /usr/share/nginx/html

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
