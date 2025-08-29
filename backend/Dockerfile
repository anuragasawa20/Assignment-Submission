# Use Node.js LTS version for development
FROM node:18-alpine

# Install netcat for health checks and wait-for-it functionality
RUN apk add --no-cache netcat-openbsd

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Expose port
EXPOSE 8080

# Start the application in production mode
CMD ["npm", "start"]
