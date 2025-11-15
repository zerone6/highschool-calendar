# Highschool 프로젝트 - Docker 배포 가이드

## 개요

이 프로젝트는 Docker 컨테이너로 배포되도록 구성되었습니다. Docker를 사용하면:
- 일관된 개발/배포 환경 제공
- 쉬운 확장성 (새 서비스 추가)
- 격리된 환경에서 안전한 실행
- 롤백 및 버전 관리 용이

## 아키텍처

```
┌─────────────────────────────────────────┐
│    Nginx Reverse Proxy (Port 80/443)   │
│         hstarst.net                     │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐   ┌───▼────┐   ┌───▼────┐
│ Main   │   │School  │   │  New   │
│ Page   │   │Select  │   │Project │
│        │   │        │   │        │
└────────┘   └────────┘   └───┬────┘
                              │
                         ┌────▼────┐
                         │   DB    │
                         └─────────┘
```

## 빠른 시작

### 로컬 개발

```bash
# 개발 서버 실행 (Docker 없이)
npm install
npm run dev
```

### Docker 로컬 테스트

```bash
# 이미지 빌드
docker build -t highschool:latest .

# 컨테이너 실행
docker run -d --name highschool -p 8080:80 highschool:latest

# 브라우저에서 확인
# http://localhost:8080/highschool/

# 중지 및 제거
docker stop highschool
docker rm highschool
```

### 서버 배포

#### 자동 배포 (GitHub Actions)

1. master 브랜치에 push
2. GitHub Actions가 자동으로 빌드 및 배포

#### 수동 배포

```bash
# 이미지 빌드 및 저장
docker build -t highschool:latest .
docker save highschool:latest | gzip > highschool-image.tar.gz

# 서버로 전송
scp highschool-image.tar.gz user@hstarst.net:/tmp/

# 서버에서 실행
ssh user@hstarst.net
cd /tmp
docker load < highschool-image.tar.gz
docker stop highschool || true
docker rm highschool || true
docker run -d --name highschool --network web --restart unless-stopped highschool:latest
```

## 프로젝트 구조

```
.
├── Dockerfile                      # Docker 이미지 빌드 설정
├── docker-compose.yml              # 전체 서비스 관리
├── .dockerignore                   # Docker 빌드 시 제외 파일
├── docker/
│   └── nginx/
│       ├── nginx.conf              # Nginx 메인 설정
│       └── conf.d/
│           └── default.conf        # Reverse Proxy 설정
├── nginx/
│   └── default.conf                # 컨테이너 내부 Nginx 설정
├── .github/
│   └── workflows/
│       ├── deploy.yml              # 기존 배포 (deprecated)
│       └── deploy-docker.yml       # Docker 배포
├── docker-deploy-guide.md          # 상세 배포 가이드
└── example-new-project-dockerfiles.md  # 새 프로젝트 추가 예시
```

## 주요 변경 사항

### 1. Vite 설정

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  base: '/highschool/',  // 서브 경로 설정
});
```

### 2. Router 설정

```typescript
// src/App.tsx
<BrowserRouter basename="/highschool">
  <Routes>
    <Route path="/" element={<HomePage />} />
    <Route path="/school-schedule" element={<SchoolSchedulePage />} />
  </Routes>
</BrowserRouter>
```

### 3. 접속 URL

- 개발: `http://localhost:5173/`
- 배포: `https://hstarst.net/highschool/`

## 환경별 설정

### 개발 환경

```bash
npm run dev
```

- Hot Module Replacement (HMR) 지원
- 즉시 반영
- 디버깅 용이

### 프로덕션 빌드

```bash
npm run build
npm run preview
```

### Docker 환경

```bash
docker build -t highschool:latest .
docker run -d -p 8080:80 highschool:latest
```

## 유용한 명령어

### Docker 명령어

```bash
# 컨테이너 로그 확인
docker logs highschool
docker logs -f highschool  # 실시간

# 컨테이너 내부 접속
docker exec -it highschool sh

# 컨테이너 재시작
docker restart highschool

# 리소스 사용량 확인
docker stats highschool

# 이미지 목록
docker images

# 컨테이너 목록
docker ps
docker ps -a  # 중지된 것 포함
```

### Docker Compose 명령어

```bash
# 전체 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스만 재시작
docker-compose restart highschool

# 서비스 중지
docker-compose down

# 빌드 및 시작
docker-compose up -d --build
```

## 트러블슈팅

### 빌드 실패

```bash
# 캐시 없이 다시 빌드
docker build --no-cache -t highschool:latest .

# 빌드 로그 확인
docker build -t highschool:latest . 2>&1 | tee build.log
```

### 컨테이너 시작 실패

```bash
# 로그 확인
docker logs highschool

# 상태 확인
docker inspect highschool
```

### 네트워크 연결 문제

```bash
# 네트워크 확인
docker network ls
docker network inspect web

# 네트워크 재생성
docker network rm web
docker network create web
```

## 모니터링 및 로그

### 로그 확인

```bash
# 최근 100줄
docker logs --tail 100 highschool

# 실시간
docker logs -f highschool

# 시간 범위 지정
docker logs --since 1h highschool
```

### 헬스 체크

```bash
# 헬스 체크 상태
docker inspect highschool | grep -A 10 Health

# 수동 헬스 체크
curl http://localhost/highschool/health
```

## 보안

### 이미지 보안 스캔

```bash
# Trivy로 취약점 스캔
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image highschool:latest
```

### 최소 권한 실행

Dockerfile에서 non-root 사용자로 실행 (nginx:alpine은 기본적으로 안전)

## 성능 최적화

### 빌드 캐싱

- Multi-stage build 사용
- package.json을 먼저 복사하여 의존성 캐싱
- .dockerignore로 불필요한 파일 제외

### 이미지 크기

```bash
# 이미지 크기 확인
docker images highschool

# 레이어 분석
docker history highschool:latest
```

현재 이미지 크기: ~50MB (Alpine 기반)

## 추가 서비스 통합

새로운 서비스를 추가하려면 `example-new-project-dockerfiles.md` 참고

## 문서

- [Docker 배포 가이드](./docker-deploy-guide.md) - 상세 배포 방법
- [새 프로젝트 추가 예시](./example-new-project-dockerfiles.md) - Java + React 프로젝트 통합

## 지원

문제 발생 시:
1. 로그 확인: `docker logs highschool`
2. GitHub Issues에 등록
3. [Docker 공식 문서](https://docs.docker.com/) 참고

## 라이센스

이 프로젝트는 MIT 라이센스를 따릅니다.
