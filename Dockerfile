FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run server:build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
ENV ENVIRONMENT=production
ENV SERVER_HOST=0.0.0.0
ENV SERVER_PORT=43148
COPY --from=build /app/dist/server ./dist/server
EXPOSE 43148
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.SERVER_PORT||43148)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server/host.js"]
