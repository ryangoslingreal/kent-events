FROM node:22-slim

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy app
COPY . .

# Vite dev server in Docker must bind to 0.0.0.0
EXPOSE 9000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "9000"]