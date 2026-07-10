FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
#kyuyoung@KYUYOUNGui-MacBookPro ploud % docker buildx build --platform linux/amd64,linux/arm64 -t rlarbdud/ploud-front:0.0.1 -t rlarbdud/ploud-front:latest --push .