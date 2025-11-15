# Docker 배포 가이드

## 1. 서버 초기 설정

### Docker 설치 (Oracle Cloud Ubuntu)

```bash
# Docker 설치
sudo apt-get update
sudo apt-get install -y apt-transport-https ca-certificates curl software-properties-common
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 현재 사용자를 docker 그룹에 추가
sudo usermod -aG docker $USER
newgrp docker

# Docker 서비스 시작
sudo systemctl enable docker
sudo systemctl start docker
```

### Docker 네트워크 생성

```bash
# web 네트워크 생성 (서비스 간 통신용)
docker network create web

# backend 네트워크 생성 (DB 통신용)
docker network create backend
```

## 2. 프로젝트 디렉토리 구조

서버에 다음과 같은 디렉토리 구조를 생성합니다:

```bash
mkdir -p ~/projects
cd ~/projects

# 디렉토리 구조
~/projects/
├── docker-compose.yml          # 전체 서비스 관리
├── nginx/                      # Nginx 설정 (이 프로젝트에서 복사)
├── highschool/                 # 이 프로젝트
├── main-page/                  # 메인 페이지 (가족정보 공유사이트)
└── new-project/                # 새 프로젝트
    ├── frontend/
    └── backend/
```

## 3. 로컬에서 Docker 빌드 및 테스트

```bash
# 로컬에서 이미지 빌드
docker build -t highschool:latest .

# 로컬에서 실행 테스트
docker run -d --name highschool-test -p 8080:80 highschool:latest

# 브라우저에서 테스트
# http://localhost:8080/highschool/

# 테스트 완료 후 중지 및 제거
docker stop highschool-test
docker rm highschool-test
```

## 4. 서버 배포 방법

### 방법 1: GitHub Actions 자동 배포 (권장)

1. GitHub Repository Secrets 설정:
   - `REMOTE_HOST`: 서버 IP 또는 도메인
   - `REMOTE_USER`: SSH 사용자명
   - `SSH_PRIVATE_KEY`: SSH 개인키

2. master 브랜치에 push:
   ```bash
   git add .
   git commit -m "Deploy with Docker"
   git push origin master
   ```

3. GitHub Actions에서 자동으로 빌드 및 배포

### 방법 2: 수동 배포

```bash
# 1. 이미지 빌드
docker build -t highschool:latest .

# 2. 이미지를 tar 파일로 저장
docker save highschool:latest | gzip > highschool-image.tar.gz

# 3. 서버로 전송
scp highschool-image.tar.gz user@hstarst.net:/tmp/

# 4. 서버에 SSH 접속
ssh user@hstarst.net

# 5. 서버에서 이미지 로드 및 실행
cd /tmp
docker load < highschool-image.tar.gz
docker stop highschool || true
docker rm highschool || true
docker run -d --name highschool --network web --restart unless-stopped highschool:latest
rm highschool-image.tar.gz
```

## 5. Docker Compose로 전체 시스템 실행

서버의 ~/projects 디렉토리에서:

```bash
# docker-compose.yml 파일 업로드 (이 프로젝트의 docker-compose.yml)
# nginx 설정 파일 업로드 (docker/nginx 디렉토리)

# 전체 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스만 재시작
docker-compose restart highschool

# 서비스 중지
docker-compose down

# 서비스 중지 및 볼륨 삭제
docker-compose down -v
```

## 6. Nginx Reverse Proxy 설정

### Nginx 컨테이너만 먼저 실행

```bash
# nginx-proxy 서비스만 시작
docker-compose up -d nginx-proxy

# Nginx 설정 테스트
docker exec nginx-proxy nginx -t

# Nginx 리로드
docker exec nginx-proxy nginx -s reload
```

## 7. SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo apt-get install certbot

# 인증서 발급 (Nginx 컨테이너 중지 필요)
docker-compose stop nginx-proxy
sudo certbot certonly --standalone -d hstarst.net -d www.hstarst.net

# 인증서를 docker/ssl 디렉토리에 복사
sudo mkdir -p ~/projects/docker/ssl
sudo cp /etc/letsencrypt/live/hstarst.net/fullchain.pem ~/projects/docker/ssl/
sudo cp /etc/letsencrypt/live/hstarst.net/privkey.pem ~/projects/docker/ssl/
sudo chown -R $USER:$USER ~/projects/docker/ssl

# docker/nginx/conf.d/default.conf 에서 SSL 설정 주석 해제

# Nginx 재시작
docker-compose up -d nginx-proxy
```

## 8. 유용한 Docker 명령어

```bash
# 실행 중인 컨테이너 확인
docker ps

# 모든 컨테이너 확인 (중지된 것 포함)
docker ps -a

# 컨테이너 로그 확인
docker logs highschool
docker logs -f highschool  # 실시간 로그

# 컨테이너 내부 접속
docker exec -it highschool sh

# 컨테이너 재시작
docker restart highschool

# 사용하지 않는 리소스 정리
docker system prune -a

# 이미지 목록
docker images

# 네트워크 목록
docker network ls

# 특정 네트워크의 컨테이너 확인
docker network inspect web
```

## 9. 트러블슈팅

### 컨테이너가 시작되지 않을 때

```bash
# 컨테이너 로그 확인
docker logs highschool

# 컨테이너 상태 확인
docker inspect highschool

# 이전 이미지 및 컨테이너 완전 삭제 후 재시작
docker stop highschool
docker rm highschool
docker rmi highschool:latest
# 이미지 다시 빌드 및 실행
```

### Nginx 프록시 연결 안 될 때

```bash
# Nginx 설정 테스트
docker exec nginx-proxy nginx -t

# Nginx 로그 확인
docker logs nginx-proxy

# 네트워크 연결 확인
docker network inspect web
```

### 포트 충돌

```bash
# 포트 사용 확인
sudo netstat -tlnp | grep :80
sudo netstat -tlnp | grep :443

# 기존 Nginx가 실행 중이면 중지
sudo systemctl stop nginx
sudo systemctl disable nginx
```

## 10. 모니터링

```bash
# 컨테이너 리소스 사용량 실시간 모니터링
docker stats

# 특정 컨테이너만
docker stats highschool

# 디스크 사용량
docker system df
```

## 11. 백업 및 복원

### 데이터 백업

```bash
# 볼륨 백업 (DB 데이터 등)
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# 이미지 백업
docker save highschool:latest | gzip > highschool-backup.tar.gz
```

### 복원

```bash
# 볼륨 복원
docker run --rm -v postgres-data:/data -v $(pwd):/backup alpine tar xzf /backup/postgres-backup.tar.gz -C /data

# 이미지 복원
docker load < highschool-backup.tar.gz
```

## 12. 다른 서비스 추가 시

### Java + React 프로젝트 예시

1. **프로젝트 디렉토리에 Dockerfile 생성**

2. **docker-compose.yml에 서비스 추가** (주석 해제)

3. **Nginx 설정에 라우팅 추가** (docker/nginx/conf.d/default.conf)

4. **재배포**:
   ```bash
   docker-compose up -d
   ```

## 13. 기존 서버에서 Docker로 전환 시

```bash
# 기존 Nginx 중지 (Docker Nginx를 사용하므로)
sudo systemctl stop nginx
sudo systemctl disable nginx

# 기존 PM2 프로세스 중지 (해당하는 경우)
pm2 stop all
pm2 delete all

# Docker 서비스 시작
docker-compose up -d
```
