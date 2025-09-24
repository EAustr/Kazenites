# Use Node.js 20 LTS
FROM node:20-alpine

WORKDIR /app

# Install dependencies for React Native development
RUN apk add --no-cache \
    git \
    python3 \
    make \
    g++ \
    openjdk17-jre-headless

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Metro bundler port
EXPOSE 8081

# Start Metro bundler for development
CMD ["npm", "start"]