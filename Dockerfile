# ========================================
# Development Stage
# ========================================
FROM node:20-alpine AS development

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Create applogs directory for logging
RUN mkdir -p /app/applogs

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# ✅ Build the application to create /app/dist
RUN pnpm build

# Expose port (optional for dev containers)
EXPOSE 5000

# Start the application in development mode
CMD ["pnpm", "run", "start:dev"]


# ========================================
# Production Build Stage
# ========================================
FROM node:20-alpine AS production

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# ✅ Copy the built app from development stage
COPY --from=development /app/dist ./dist

# Set environment to production
ENV NODE_ENV=production

# Start the application in production mode
CMD ["node", "dist/main"]
