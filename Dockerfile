FROM alpine:3.12 AS builder
RUN apk add --no-cache hugo
COPY . /app/
WORKDIR /app
RUN hugo

FROM caddy:2-alpine
COPY --from=builder /app/public /srv
COPY Caddyfile /etc/caddy/Caddyfile
