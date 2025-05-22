FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install @tldraw/sync-core express
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
