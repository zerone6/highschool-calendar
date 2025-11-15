# 새 프로젝트 Docker 구성 예시 (Java Spring Boot + React)

## 1. React Frontend Dockerfile

새 프로젝트의 frontend 디렉토리에 생성:

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

# React 빌드 결과물 복사
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx 설정
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Frontend Nginx 설정

```nginx
# frontend/nginx.conf
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Frontend vite.config.ts

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/new-project/',  // 서브 경로 설정
});
```

### Frontend Router 설정

```typescript
// src/main.tsx 또는 App.tsx
import { BrowserRouter } from 'react-router-dom';

<BrowserRouter basename="/new-project">
  <App />
</BrowserRouter>
```

## 2. Java Spring Boot Backend Dockerfile

새 프로젝트의 backend 디렉토리에 생성:

```dockerfile
# backend/Dockerfile
FROM maven:3.9-eclipse-temurin-17 AS builder

WORKDIR /app

# pom.xml 먼저 복사 (캐싱 활용)
COPY pom.xml .
RUN mvn dependency:go-offline

# 소스 코드 복사 및 빌드
COPY src ./src
RUN mvn clean package -DskipTests

# 실행 스테이지
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 빌더 스테이지에서 JAR 파일 복사
COPY --from=builder /app/target/*.jar app.jar

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Gradle 사용 시

```dockerfile
# backend/Dockerfile (Gradle)
FROM gradle:8-jdk17 AS builder

WORKDIR /app

# Gradle wrapper 및 의존성 파일 복사
COPY build.gradle settings.gradle gradlew ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon

# 소스 코드 복사 및 빌드
COPY src ./src
RUN gradle bootJar --no-daemon

# 실행 스테이지
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Spring Boot application.yml

```yaml
server:
  port: 8080
  servlet:
    context-path: /api

spring:
  application:
    name: new-project
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:newproject}
    username: ${DB_USER:dbuser}
    password: ${DB_PASSWORD:dbpassword}
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

# CORS 설정 (application.yml에서 관리 시)
cors:
  allowed-origins: https://hstarst.net,http://localhost:5173
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

### CORS 설정 (Java)

```java
// config/WebConfig.java
package com.example.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("https://hstarst.net", "http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## 3. docker-compose.yml에 새 서비스 추가

메인 docker-compose.yml 파일에 추가:

```yaml
services:
  # ... 기존 서비스들 ...

  # 새 프로젝트 - Frontend
  new-project-frontend:
    build:
      context: ../new-project/frontend
      dockerfile: Dockerfile
    container_name: new-project-frontend
    expose:
      - "80"
    networks:
      - web
    restart: unless-stopped

  # 새 프로젝트 - Backend
  new-project-backend:
    build:
      context: ../new-project/backend
      dockerfile: Dockerfile
    container_name: new-project-backend
    environment:
      - SPRING_PROFILES_ACTIVE=prod
      - DB_HOST=postgres
      - DB_PORT=5432
      - DB_NAME=newproject
      - DB_USER=dbuser
      - DB_PASSWORD=dbpassword
    expose:
      - "8080"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - web
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:8080/actuator/health"]
      interval: 30s
      timeout: 10s
      retries: 5

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    environment:
      - POSTGRES_DB=newproject
      - POSTGRES_USER=dbuser
      - POSTGRES_PASSWORD=dbpassword
    volumes:
      - postgres-data:/var/lib/postgresql/data
      - ./init-db:/docker-entrypoint-initdb.d  # 초기 SQL 스크립트
    networks:
      - backend
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dbuser"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres-data:
```

## 4. Nginx 설정에 라우팅 추가

docker/nginx/conf.d/default.conf에 추가:

```nginx
# Upstream 정의
upstream new-project-frontend {
    server new-project-frontend:80;
}

upstream new-project-backend {
    server new-project-backend:8080;
}

server {
    # ... 기존 설정 ...

    # 새 프로젝트 - Frontend
    location /new-project/ {
        proxy_pass http://new-project-frontend/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 새 프로젝트 - Backend API
    location /new-project/api/ {
        proxy_pass http://new-project-backend/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # API timeout 설정
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

## 5. GitHub Actions 워크플로우 (새 프로젝트)

새 프로젝트 저장소에 생성:

```yaml
# .github/workflows/deploy.yml
name: Deploy New Project

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Build Frontend Image
        run: |
          cd frontend
          docker build -t new-project-frontend:latest .

      - name: Build Backend Image
        run: |
          cd backend
          docker build -t new-project-backend:latest .

      - name: Save Docker Images
        run: |
          docker save new-project-frontend:latest | gzip > frontend-image.tar.gz
          docker save new-project-backend:latest | gzip > backend-image.tar.gz

      - name: Copy Images to Server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          source: "*-image.tar.gz"
          target: "/tmp/"

      - name: Deploy Containers
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.REMOTE_HOST }}
          username: ${{ secrets.REMOTE_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /tmp
            docker load < frontend-image.tar.gz
            docker load < backend-image.tar.gz
            rm *-image.tar.gz

            cd ~/projects
            docker-compose up -d new-project-frontend new-project-backend

            echo "Deployment completed successfully"
```

## 6. 환경 변수 관리

### .env 파일 (서버에서 사용)

```bash
# ~/projects/.env
DB_HOST=postgres
DB_PORT=5432
DB_NAME=newproject
DB_USER=dbuser
DB_PASSWORD=secure_password_here

SPRING_PROFILES_ACTIVE=prod
```

### docker-compose에서 .env 사용

```yaml
services:
  new-project-backend:
    environment:
      - DB_HOST=${DB_HOST}
      - DB_PORT=${DB_PORT}
      - DB_NAME=${DB_NAME}
      - DB_USER=${DB_USER}
      - DB_PASSWORD=${DB_PASSWORD}
```

## 7. 배포 명령어

```bash
# 전체 서비스 재배포
cd ~/projects
docker-compose up -d --build

# 특정 서비스만 재배포
docker-compose up -d --build new-project-frontend
docker-compose up -d --build new-project-backend

# 로그 확인
docker-compose logs -f new-project-backend
docker-compose logs -f new-project-frontend

# 서비스 재시작
docker-compose restart new-project-backend
```
