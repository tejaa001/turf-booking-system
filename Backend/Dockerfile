# Use a specific Node.js LTS version on a lightweight Alpine Linux base
# This ensures reproducibility and a smaller image size.
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json to leverage Docker's layer caching.
# This step will only be re-run if these files change.
COPY package*.json ./

# Install production dependencies using 'npm ci' for faster, more reliable builds.
# It uses package-lock.json and is recommended for CI/production environments.
RUN npm ci --only=production

# Copy the rest of the application source code into the container.
# This is done after npm ci, so code changes don't invalidate the dependency cache.
COPY . .

# The application listens on a port defined by the PORT env variable.
# We expose a default port (5000) here, which can be mapped in docker-compose.
EXPOSE 5000

# Run the application as the built-in 'node' user for better security.
USER node

# The command to start the application when the container launches.
CMD ["node", "server.js"]