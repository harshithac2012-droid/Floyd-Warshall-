# Build stage for React frontend
FROM node:20 AS build-stage
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Final stage
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
# Copy built frontend to a place where FastAPI can serve it (optional, or separate serving)
# For simplicity in this mission control project, we'll assume they can be served together
COPY --from=build-stage /app/frontend/dist /app/frontend/dist

EXPOSE 8080
CMD ["gunicorn", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8080", "main:app"]
