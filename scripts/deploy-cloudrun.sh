#!/usr/bin/env bash
set -e

# Ensure gcloud uses Python 3.10+
if [ -f "/Users/joseluiszabala/.local/share/uv/python/cpython-3.10.17-macos-aarch64-none/bin/python3.10" ]; then
  export CLOUDSDK_PYTHON="/Users/joseluiszabala/.local/share/uv/python/cpython-3.10.17-macos-aarch64-none/bin/python3.10"
fi

# Deploy Next.js Standalone Container directly to Google Cloud Run
PROJECT_ID="med-peptides-app"
REGION="us-central1"
SERVICE_NAME="ssrmedpeptidesapp27a3a"
IMAGE_TAG="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "🚀 [Cloud Run Standalone] Building and deploying standalone container..."

# 1. Compile with Turbopack (fast Rust compilation)
npm run build

# 2. Build container via Cloud Build (no local Docker daemon required)
echo "📦 [Cloud Run Standalone] Submitting build to Google Cloud Build..."
gcloud builds submit --project="${PROJECT_ID}" --tag="${IMAGE_TAG}" .

# 3. Deploy new revision to Cloud Run
echo "⚡ [Cloud Run Standalone] Deploying revision to Cloud Run..."
gcloud run deploy "${SERVICE_NAME}" \
  --project="${PROJECT_ID}" \
  --region="${REGION}" \
  --image="${IMAGE_TAG}" \
  --platform="managed" \
  --allow-unauthenticated

echo "✅ [Cloud Run Standalone] Deployment completed successfully!"
