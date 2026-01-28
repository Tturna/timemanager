# build with the parent dir as build context so front/ is accessible.

FROM node:25.4 AS build

WORKDIR /app

COPY ./front/. .

FROM nginx:1.27

COPY --from=build /app/dist /app/dist
COPY proxy/nginx.conf /etc/nginx/nginx.conf
