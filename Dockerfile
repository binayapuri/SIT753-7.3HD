# FROM node:16-alpine
# WORKDIR /usr/src/app
# COPY package*.json ./
# RUN npm install --production
# COPY . .
# EXPOSE 8000
# CMD ["npm", "start"]


FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001
RUN chown -R nodeuser:nodejs /usr/src/app
USER nodeuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

# Start application
CMD ["npm", "start"]