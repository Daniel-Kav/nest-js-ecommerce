# Stage 1: Build the application
FROM node:lts-alpine AS builder

WORKDIR /app

# Copy package.json and pnpm-lock.yaml and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN pnpm run build

# Stage 2: Run the production application
FROM node:lts-alpine AS runner

WORKDIR /app

# Copy package.json and pnpm-lock.yaml from the builder stage
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy the built application code from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the application port (assuming your app runs on port 5000 as seen in logs)
EXPOSE 5000

# Run the application in production mode
CMD ["pnpm", "start:prod"] 