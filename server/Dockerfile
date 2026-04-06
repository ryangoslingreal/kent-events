FROM node:22-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y chromium --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001
CMD ["npm", "run", "dev"]