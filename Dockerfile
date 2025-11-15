# Multi-stage build for React application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Prepare data
RUN npm run prepare:data && \
    mkdir -p public && \
    rm -f public/data && \
    ln -sf ../Data public/data

# Build the application
RUN npm run build

# Production stage - use Nginx to serve static files
FROM nginx:alpine

# Copy built files from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html/highschool

# Copy custom nginx config
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
