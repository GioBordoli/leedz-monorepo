#!/usr/bin/env bash
set -euo pipefail

# Required env vars: PROJECT_ID, REGION, BACKEND_SERVICE, FRONTEND_SERVICE
# Optional: REACT_APP_API_URL, REACT_APP_GOOGLE_CLIENT_ID, REACT_APP_STRIPE_PUBLISHABLE_KEY, REACT_APP_ENVIRONMENT

if [[ -z "${PROJECT_ID:-}" || -z "${REGION:-}" || -z "${BACKEND_SERVICE:-}" || -z "${FRONTEND_SERVICE:-}" ]]; then
  echo "Missing required env vars. Export: PROJECT_ID, REGION, BACKEND_SERVICE, FRONTEND_SERVICE" >&2
  exit 1
fi

# Auth
if ! gcloud auth print-identity-token >/dev/null 2>&1; then
  echo "Logging into gcloud...";
  gcloud auth login --update-adc
fi

echo "Configuring Docker auth for gcr.io"
gcloud auth configure-docker --quiet

GIT_SHA=$(git rev-parse --short HEAD)

# Build backend image
echo "Building backend image..."
docker build -t gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}:${GIT_SHA} ./backend

echo "Pushing backend image..."
docker push gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}:${GIT_SHA}

# Build frontend image
export REACT_APP_ENVIRONMENT=${REACT_APP_ENVIRONMENT:-production}
if [[ -z "${REACT_APP_API_URL:-}" ]]; then
  export REACT_APP_API_URL="https://leedz-backend-${PROJECT_ID}.a.run.app/api"
fi

echo "Building frontend image..."
docker build -t gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}:${GIT_SHA} \
  --build-arg REACT_APP_API_URL="${REACT_APP_API_URL}" \
  --build-arg REACT_APP_GOOGLE_CLIENT_ID="${REACT_APP_GOOGLE_CLIENT_ID:-}" \
  --build-arg REACT_APP_STRIPE_PUBLISHABLE_KEY="${REACT_APP_STRIPE_PUBLISHABLE_KEY:-}" \
  --build-arg REACT_APP_ENVIRONMENT="${REACT_APP_ENVIRONMENT}" \
  ./frontend

echo "Pushing frontend image..."
docker push gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}:${GIT_SHA}

# Deploy backend
echo "Deploying backend to Cloud Run..."
gcloud run deploy ${BACKEND_SERVICE} \
  --image gcr.io/${PROJECT_ID}/${BACKEND_SERVICE}:${GIT_SHA} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production,PORT=3001,FRONTEND_URL=https://leedz.online" \
  --set-secrets="DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest,GOOGLE_CLIENT_ID=GOOGLE_CLIENT_ID:latest,GOOGLE_CLIENT_SECRET=GOOGLE_CLIENT_SECRET:latest,STRIPE_SECRET_KEY=STRIPE_SECRET_KEY:latest,STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET:latest,STRIPE_MONTHLY_PRICE_ID=STRIPE_MONTHLY_PRICE_ID:latest" \
  --add-cloudsql-instances=${PROJECT_ID}:${REGION}:leedz-production-db \
  --memory=1Gi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=10

# Deploy frontend
echo "Deploying frontend to Cloud Run..."
gcloud run deploy ${FRONTEND_SERVICE} \
  --image gcr.io/${PROJECT_ID}/${FRONTEND_SERVICE}:${GIT_SHA} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --port=80 \
  --memory=512Mi \
  --cpu=1 \
  --min-instances=1 \
  --max-instances=5

# Output URLs
echo "Backend URL: $(gcloud run services describe ${BACKEND_SERVICE} --region=${REGION} --format='value(status.url)')"
echo "Frontend URL: $(gcloud run services describe ${FRONTEND_SERVICE} --region=${REGION} --format='value(status.url)')" 