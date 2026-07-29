# =============================================================================
# OKUMA OS - Dockerfile
# Multi-stage build for production deployment
# =============================================================================

# ---- Stage 1: Backend ----
FROM python:3.12-slim AS backend

WORKDIR /app/backend

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ .

# Expose backend port
EXPOSE 8000

# Start backend with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]


# ---- Stage 2: Frontend ----
FROM node:20-alpine AS frontend

WORKDIR /app/frontend

# Install ALL dependencies (devDependencies são necessárias para o build)
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend code
COPY frontend/ .

# Build Next.js
RUN npm run build

# Expose frontend port
EXPOSE 3000

# Start Next.js
CMD ["npm", "start"]


# ---- Stage 3: Production ----
FROM python:3.12-slim AS production

WORKDIR /app

# Copy backend
COPY --from=backend /app/backend /app/backend
COPY --from=backend /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages

# Copy frontend build
COPY --from=frontend /app/frontend/.next /app/frontend/.next
COPY --from=frontend /app/frontend/public /app/frontend/public
COPY --from=frontend /app/frontend/node_modules /app/frontend/node_modules
COPY --from=frontend /app/frontend/package.json /app/frontend/package.json

# Install Node for serving frontend
RUN apt-get update && apt-get install -y --no-install-recommends \
    nodejs \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 8000 3000

CMD ["bash", "-c", "cd /app/backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 & cd /app/frontend && npm start -- --port 3000"]
