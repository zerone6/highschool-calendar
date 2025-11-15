# Highschool Calendar

입시일정 선택 서비스

## 🚀 Quick Start

### Development

```bash
# Install dependencies
npm install

# Prepare data
npm run prepare:data

# Start development server
npm run dev
```

### Docker

```bash
# Build image
docker build -t highschool-calendar .

# Run container
docker run -p 80:80 highschool-calendar
```

## 📦 Deployment

This project automatically builds and pushes Docker images to GitHub Container Registry (GHCR) when code is pushed to the main branch.

### Pull the latest image

```bash
docker pull ghcr.io/YOUR_USERNAME/highschool-calendar:latest
```

### Run the container

```bash
docker run -d -p 80:80 --name highschool ghcr.io/YOUR_USERNAME/highschool-calendar:latest
```

## 🔗 Related Repositories

- [indexpage](https://github.com/YOUR_USERNAME/indexpage) - Infrastructure orchestration
- [realestate-calc](https://github.com/YOUR_USERNAME/realestate-calc) - Real estate calculator service

## 📝 License

Private - Family use only
