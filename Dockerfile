# Build stage
FROM node:18-alpine AS builder

WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only package files first to leverage Docker cache
COPY package.json pnpm-lock.yaml ./

# Install dependencies with specific flags for faster installation
RUN pnpm install --frozen-lockfile --prefer-offline

# Copy source code
COPY . .

# Build the application
RUN pnpm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /usr/src/app

# Install pnpm globally
RUN npm install -g pnpm

# Copy only package files first
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile --prefer-offline

# Copy built application from builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the application port
EXPOSE 5000

# Start the application
CMD ["pnpm", "run", "start:prod"] 