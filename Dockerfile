FROM node:20-alpine

WORKDIR /app

# Install frontend deps and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Install backend deps
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source
COPY backend/ ./backend/

# Create data directory for SQLite
RUN mkdir -p /data

ENV DB_PATH=/data/school_dashboard.db
ENV PORT=3001
ENV NODE_ENV=production

EXPOSE 3001

CMD ["node", "backend/server.js"]
