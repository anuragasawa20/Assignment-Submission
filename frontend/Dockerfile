# Simple Node.js development server for frontend
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port for development server
EXPOSE 3001

# Start development server
CMD ["npm", "start"]
