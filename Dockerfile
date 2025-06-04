# Dockerfile
# Use a Node.js image
FROM node:18-alpine AS development

# Set the working directory inside the container
WORKDIR /usr/src/app # Keep this consistent with your Dockerfile output. Your build log shows /usr/src/app

# Install pnpm globally (if not already done via base image)
# Your build log shows this is CACHED, so it's already there
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
# Install dependencies using pnpm
RUN pnpm install --frozen-lockfile --prefer-offline

# Copy the rest of your application code AFTER dependencies are installed
COPY . .

# Build the application (for production, but good to ensure it builds in dev image too for validation)
# REMOVE THIS LINE for hot reload development, as the build step creates 'dist' which will conflict
# with the volume mount where you'll run `nest start --watch` on the source.
# If you run build here, `nest start --watch` might watch the `dist` folder, or just rebuild.
# For *development*, you usually don't run `pnpm run build` in the Dockerfile.
# You just run `pnpm start:dev` directly.
# RUN pnpm run build # <-- REMOVE THIS LINE FOR DEV DOCKERFILE

# Expose the port your NestJS app listens on (default is 3000)
EXPOSE 5000

# Command to run your NestJS app in watch mode using pnpm
CMD ["pnpm", "start:dev"]