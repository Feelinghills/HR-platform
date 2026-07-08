FROM node:20-alpine AS build
WORKDIR /app

COPY ui/package.json ui/package-lock.json ./
RUN npm install

COPY ui/public ./public
COPY ui/src ./src

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files $uri $uri/ /index.html; \
        add_header Cache-Control "no-cache, no-store, must-revalidate"; \
    } \
    location /static/ { \
        root /usr/share/nginx/html; \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
    location /api/auth/ { \
        proxy_pass http://auth-service:50051; \
        proxy_http_version 1.1; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
    } \
    location /api { \
        proxy_pass http://backend:5126; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_cache_bypass $http_upgrade; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
