FROM node:22-alpine AS base

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Vite inlines VITE_* variables at build time, so they must be supplied before
# `npm run build`. Defaults keep a plain `docker build` working; docker-compose
# overrides them via build args.
ARG VITE_API_URL=/api/v1
ARG VITE_SITE_URL=http://localhost
ARG VITE_WHATSAPP_NUMBER=27791002552
ARG VITE_PAYSTACK_PUBLIC_KEY=
ENV VITE_API_URL=${VITE_API_URL} \
    VITE_SITE_URL=${VITE_SITE_URL} \
    VITE_WHATSAPP_NUMBER=${VITE_WHATSAPP_NUMBER} \
    VITE_PAYSTACK_PUBLIC_KEY=${VITE_PAYSTACK_PUBLIC_KEY}

RUN npm run build

FROM nginx:alpine
COPY --from=base /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
